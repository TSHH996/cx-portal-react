import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64url(input: Uint8Array) {
  let str = "";
  input.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSHA256(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64url(new Uint8Array(sig));
}

function parseToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const exp = Number(parts[0]);
  const sig = parts[1];
  if (!exp || !sig) return null;
  return { exp, sig };
}

function nowEpoch() {
  return Math.floor(Date.now() / 1000);
}

function decodeBase64ToBytes(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function guessExt(mime: string) {
  const value = (mime || "").toLowerCase();
  if (value.includes("png")) return "png";
  if (value.includes("jpeg") || value.includes("jpg")) return "jpg";
  if (value.includes("pdf")) return "pdf";
  if (value.includes("gif")) return "gif";
  if (value.includes("webp")) return "webp";
  if (value.includes("heic")) return "heic";
  return "bin";
}

function escapeHtml(value: string) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br/>");
}

async function sendEmailResend(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data, status: res.status };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("CX_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("CX_SERVICE_ROLE_KEY");
    const SIGN_SECRET = Deno.env.get("CX_REPLY_SIGNING_SECRET");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const CX_ADMIN_EMAILS = Deno.env.get("CX_ADMIN_EMAILS");

    if (!SUPABASE_URL || !SERVICE_ROLE || !SIGN_SECRET) {
      return json({
        error: "Missing env: CX_SUPABASE_URL / CX_SERVICE_ROLE_KEY / CX_REPLY_SIGNING_SECRET",
        has: {
          CX_SUPABASE_URL: !!SUPABASE_URL,
          CX_SERVICE_ROLE_KEY: !!SERVICE_ROLE,
          CX_REPLY_SIGNING_SECRET: !!SIGN_SECRET,
        },
      }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    let ticket_id = "";
    let token = "";
    let body: Record<string, unknown> | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      ticket_id = (url.searchParams.get("ticket") || "").trim();
      token = (url.searchParams.get("token") || "").trim();
    } else if (req.method === "POST") {
      body = await req.json();
      ticket_id = String(body.ticket_id || "").trim();
      token = String(body.token || "").trim();
    } else {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!ticket_id || !token) return json({ error: "ticket and token are required" }, 400);

    const parsed = parseToken(token);
    if (!parsed) return json({ error: "Invalid token format" }, 400);
    if (parsed.exp < nowEpoch()) return json({ error: "Token expired" }, 403);

    const payloadSig = `ticket=${ticket_id}&exp=${parsed.exp}`;
    const expectedSig = await hmacSHA256(SIGN_SECRET, payloadSig);
    if (expectedSig !== parsed.sig) return json({ error: "Invalid token signature" }, 403);

    if (req.method === "GET") {
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("id, ticket_no, customer_name, customer_phone, branch_name, description, status, created_at, branch_reply, reply_by, reply_datetime")
        .eq("id", ticket_id)
        .maybeSingle();

      if (ticketError) return json({ error: "Ticket query failed", details: ticketError.message }, 500);
      if (!ticket) return json({ error: "Ticket not found" }, 404);

      const { data: attachments, error: attachmentsError } = await supabase
        .from("ticket_attachments")
        .select("id, file_name, public_url, created_at, source, uploaded_by, reply_id, storage_path")
        .eq("ticket_uuid", ticket_id)
        .order("created_at", { ascending: true });

      if (attachmentsError) {
        return json({ ticket, attachments: [], attachments_warning: attachmentsError.message }, 200);
      }

      return json({ ticket, attachments: attachments || [] }, 200);
    }

    const reply_text = String(body?.reply_text || "").trim();
    const action_taken = String(body?.action_taken || "").trim();
    const status = String(body?.status || "Replied").trim();
    const files = Array.isArray(body?.files) ? body.files : [];

    if (!reply_text) return json({ error: "reply_text is required" }, 400);

    const { data: ticketRow, error: ticketRowErr } = await supabase
      .from("tickets")
      .select("ticket_no, branch_name, customer_name, customer_phone, description, sla_due_at, first_reply_at, sla_status")
      .eq("id", ticket_id)
      .maybeSingle();

    if (ticketRowErr) {
      return json({ error: "Failed to read ticket", details: ticketRowErr.message }, 500);
    }

    const ticketNo = ticketRow?.ticket_no ?? "-";
    const branchName = ticketRow?.branch_name ?? "-";

    const { data: inserted, error: replyError } = await supabase
      .from("ticket_replies")
      .insert([
        {
          ticket_id,
          reply_text,
          action_taken: action_taken || null,
          reply_by: "Branch",
        },
      ])
      .select("id")
      .single();

    if (replyError || !inserted) return json({ error: "Failed to insert reply", details: replyError?.message }, 500);
    const reply_id = inserted.id;

    const nowIso = new Date().toISOString();
    const isFirstReply = !ticketRow?.first_reply_at;
    let computedSlaStatus: string | null = null;

    if (isFirstReply && ticketRow?.sla_due_at) {
      const due = new Date(ticketRow.sla_due_at).getTime();
      const nowMs = new Date(nowIso).getTime();
      computedSlaStatus = nowMs <= due ? "within_sla" : "breached";
    }

    const updatePayload: Record<string, string | null> = {
      status,
      branch_reply: reply_text,
      reply_by: "Branch",
      reply_datetime: nowIso,
    };

    if (isFirstReply) {
      updatePayload.first_reply_at = nowIso;
      if (computedSlaStatus) updatePayload.sla_status = computedSlaStatus;
    } else if ((ticketRow?.sla_status === "pending" || !ticketRow?.sla_status) && ticketRow?.sla_due_at) {
      const due = new Date(ticketRow.sla_due_at).getTime();
      if (Date.now() > due) updatePayload.sla_status = "breached";
    }

    const { error: ticketUpdateError } = await supabase.from("tickets").update(updatePayload).eq("id", ticket_id);
    if (ticketUpdateError) return json({ error: "Failed to update ticket status/SLA", details: ticketUpdateError.message }, 500);

    const uploaded: Array<Record<string, string>> = [];
    const uploadedPublicLinks: Array<{ name: string; url: string }> = [];

    for (const entry of files as Array<Record<string, unknown>>) {
      const file_name = String(entry.file_name || "").trim();
      const mime_type = String(entry.mime_type || "application/octet-stream");
      const file_base64 = String(entry.file_base64 || "");
      const file_size = Number(entry.file_size || 0);

      if (!file_name || !file_base64) continue;

      const bytes = decodeBase64ToBytes(file_base64);
      const ext = guessExt(mime_type);
      const path = `tickets/${ticket_id}/branch_reply/${reply_id}/${crypto.randomUUID()}_${file_name || `file.${ext}`}`;

      const { error: uploadError } = await supabase.storage
        .from("ticket_attachments")
        .upload(path, bytes, { contentType: mime_type, upsert: false });

      if (uploadError) {
        uploaded.push({ file_name, error: uploadError.message });
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from("ticket_attachments").getPublicUrl(path);
      const publicUrl = publicUrlData?.publicUrl || "";
      if (publicUrl) uploadedPublicLinks.push({ name: file_name, url: publicUrl });

      const { error: insertAttachmentError } = await supabase.from("ticket_attachments").insert([
        {
          ticket_uuid: ticket_id,
          ticket_id: null,
          file_name,
          mime_type,
          file_size,
          storage_path: path,
          public_url: publicUrl || null,
          source: "branch_reply",
          uploaded_by: "branch",
          reply_id,
        },
      ]);

      if (insertAttachmentError) uploaded.push({ file_name, warning: insertAttachmentError.message });
      else uploaded.push({ file_name, public_url: publicUrl, storage_path: path });
    }

    let notify_ok = false;
    let notify_error: unknown = null;

    const adminEmails = (CX_ADMIN_EMAILS || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (!adminEmails.length) {
      notify_error = "CX_ADMIN_EMAILS is empty";
    } else if (!RESEND_API_KEY || !FROM_EMAIL) {
      notify_error = "Missing RESEND_API_KEY or FROM_EMAIL";
    } else {
      const attachmentsHtml = uploadedPublicLinks.length
        ? `<ul style="margin:0;padding-left:18px">${uploadedPublicLinks.map((a) => `<li style="margin:6px 0"><a href="${a.url}" target="_blank">${escapeHtml(a.name)}</a></li>`).join("")}</ul>`
        : `<span>No attachments</span>`;

      const subject = `Branch replied - Ticket #${ticketNo} (${branchName})`;
      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.7">
          <h2>Branch Reply Received</h2>
          <p>A branch has submitted a reply via the reply form.</p>

          <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
            <tr><td><b>Ticket No</b></td><td>${escapeHtml(String(ticketNo))}</td></tr>
            <tr><td><b>Branch</b></td><td>${escapeHtml(String(branchName))}</td></tr>
            <tr><td><b>Customer Name</b></td><td>${escapeHtml(String(ticketRow?.customer_name ?? "-"))}</td></tr>
            <tr><td><b>Customer Phone</b></td><td>${escapeHtml(String(ticketRow?.customer_phone ?? "-"))}</td></tr>
            <tr><td><b>Ticket Description</b></td><td>${escapeHtml(String(ticketRow?.description ?? "-"))}</td></tr>
            <tr><td><b>Status</b></td><td>${escapeHtml(status)}</td></tr>
            <tr><td><b>Reply Text</b></td><td style="white-space:pre-wrap">${escapeHtml(reply_text)}</td></tr>
            <tr><td><b>Action Taken</b></td><td style="white-space:pre-wrap">${escapeHtml(action_taken || "-")}</td></tr>
            <tr><td><b>Reply Attachments</b></td><td>${attachmentsHtml}</td></tr>
          </table>

          <p style="margin-top:14px;color:#666;font-size:12px">
            Automated notification from CX Portal.
          </p>
        </div>
      `;

      try {
        const sent = await sendEmailResend({ apiKey: RESEND_API_KEY, from: FROM_EMAIL, to: adminEmails, subject, html });
        notify_ok = sent.ok;
        if (!sent.ok) notify_error = sent.data;
      } catch (error) {
        notify_error = String(error);
      }
    }

    return json({
      ok: true,
      reply_id,
      status,
      uploaded,
      notify_ok,
      notify_error,
      is_first_reply: isFirstReply,
      first_reply_at_written: isFirstReply ? nowIso : ticketRow?.first_reply_at ?? null,
      sla_status_written: updatePayload.sla_status ?? ticketRow?.sla_status ?? "pending",
    }, 200);
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});
