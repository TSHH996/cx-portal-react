import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const CX_SUPABASE_URL = Deno.env.get("CX_SUPABASE_URL");

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "Missing RESEND_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!FROM_EMAIL) {
      return new Response(JSON.stringify({ success: false, error: "Missing FROM_EMAIL secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!CX_SUPABASE_URL) {
      return new Response(JSON.stringify({ success: false, error: "Missing CX_SUPABASE_URL secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      ticket_id,
      ticket_no,
      branch_name,
      branch_email,
      customer_name,
      customer_phone,
      feedback_type,
      feedback_category,
      sub_category,
      description,
      priority,
      status,
      complaint_at,
      complaint_display,
      attachment_links,
    } = body || {};

    if (!branch_email) {
      return new Response(JSON.stringify({ success: false, error: "Missing branch_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ticket_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing ticket_id (UUID)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let reply_url = "";
    try {
      const replyLinkRes = await fetch(`${CX_SUPABASE_URL}/functions/v1/create-reply-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: String(ticket_id),
          base_url: "https://tshh996.github.io/cx-portal-react",
        }),
      });

      if (replyLinkRes.ok) {
        const j = await replyLinkRes.json();
        reply_url = j?.url || "";
      }
    } catch {
      reply_url = "";
    }

    const safeLinks = Array.isArray(attachment_links) ? attachment_links : [];
    const attachmentLinksHtml = safeLinks.length
      ? `
        <tr>
          <td><b>Attachments</b></td>
          <td>
            <ul style="margin:0;padding-left:18px">
              ${safeLinks
                .filter((a) => a && a.url)
                .map((a) => `<li style="margin:6px 0"><a href="${a.url}" target="_blank">${a.name || "file"}</a></li>`)
                .join("")}
            </ul>
          </td>
        </tr>
      `
      : `
        <tr>
          <td><b>Attachments</b></td>
          <td>No attachments</td>
        </tr>
      `;

    const subject = `CX Ticket #${ticket_no ?? "-"} - ${branch_name ?? "Branch"}`;
    const safeDescription = (description ?? "-")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\n", "<br/>");

    const complaintDateTime = complaint_display || complaint_at || "-";
    const replyButtonHtml = reply_url
      ? `
        <div style="margin:16px 0 6px">
          <a href="${reply_url}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111;color:#fff;text-decoration:none;font-weight:700;">
            Reply to this Ticket
          </a>
        </div>
        <div style="color:#666;font-size:12px;margin-top:6px">
          Link valid for 14 days.
        </div>
      `
      : `
        <div style="margin:16px 0;color:#b00;font-size:12px">
          Reply link could not be generated (please contact CX team).
        </div>
      `;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.7">
        <h2>CX Ticket Notification</h2>
        <p>A new customer ticket has been created.</p>

        ${replyButtonHtml}

        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
          <tr><td><b>Ticket No</b></td><td>${ticket_no ?? "-"}</td></tr>
          <tr><td><b>Branch</b></td><td>${branch_name ?? "-"}</td></tr>
          <tr><td><b>Complaint Date & Time</b></td><td>${complaintDateTime}</td></tr>
          <tr><td><b>Customer Name</b></td><td>${customer_name ?? "-"}</td></tr>
          <tr><td><b>Customer Phone</b></td><td>${customer_phone ?? "-"}</td></tr>
          <tr><td><b>Feedback Source</b></td><td>${feedback_type ?? "-"}</td></tr>
          <tr><td><b>Feedback Category</b></td><td>${feedback_category ?? "-"}</td></tr>
          <tr><td><b>Sub Category</b></td><td>${sub_category ?? "-"}</td></tr>
          <tr><td><b>Priority</b></td><td>${priority ?? "-"}</td></tr>
          <tr><td><b>Status</b></td><td>${status ?? "-"}</td></tr>
          <tr><td><b>Description</b></td><td>${safeDescription}</td></tr>
          ${attachmentLinksHtml}
        </table>

        <p style="margin-top:14px;color:#666;font-size:12px">
          Please open the attachment links above to view the files.
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [branch_email],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ success: false, error: "Resend API error", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully", resend: resendData, reply_url: reply_url || null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
