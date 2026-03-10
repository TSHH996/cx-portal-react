import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, supabaseAnonKey, supabaseUrl } from "../../lib/supabase";
import { normalizeTicket } from "../dashboard/dashboardUtils";
import { resolveBranchCity } from "./newTicketConfig";

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatResolutionActivity(payload) {
  const rows = [
    ["Action Type", payload.resolution_action_type],
    ["Customer Contact Status", payload.customer_contact_status],
    ["Customer Satisfied", payload.customer_satisfied],
    ["Resolution Date", payload.resolution_date ? String(payload.resolution_date).slice(0, 10) : ""],
    ["Handled By", payload.resolution_handled_by],
  ].filter(([, value]) => value);

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

async function fetchPortalState(language) {
  const [branchesRes, repliesRes, attachmentsRes, ticketsRes] = await Promise.all([
    supabase.from("branches").select("*").order("branch_name", { ascending: true }),
    supabase.from("ticket_replies").select("*").order("created_at", { ascending: true }),
    supabase.from("ticket_attachments").select("*").order("created_at", { ascending: true }),
    supabase.from("tickets").select("*").order("created_at", { ascending: false }),
  ]);

  const failing = [branchesRes, repliesRes, attachmentsRes, ticketsRes].find((result) => result.error);
  if (failing?.error) throw failing.error;

  const repliesByTicketId = {};
  (repliesRes.data || []).forEach((reply) => {
    const key = reply.ticket_id;
    if (!repliesByTicketId[key]) repliesByTicketId[key] = [];
    repliesByTicketId[key].push(reply);
  });

  const attachmentsByTicketId = {};
  (attachmentsRes.data || []).forEach((attachment) => {
    const key = attachment.ticket_uuid || null;
    if (!key) return;
    if (!attachmentsByTicketId[key]) attachmentsByTicketId[key] = [];
    attachmentsByTicketId[key].push(attachment);
  });

  const branches = (branchesRes.data || []).map((branch) => ({
    ...branch,
    city: resolveBranchCity(branch.branch_name, branch.city),
  }));

  const branchCityByName = Object.fromEntries(branches.map((branch) => [branch.branch_name, branch.city]));

  const tickets = (ticketsRes.data || []).map((ticket) => normalizeTicket(ticket, repliesByTicketId, attachmentsByTicketId, language, branchCityByName));

  return {
    tickets,
    branches,
    repliesByTicketId,
    attachmentsByTicketId,
  };
}

export function usePortalData(language) {
  const [state, setState] = useState({
    tickets: [],
    branches: [],
    repliesByTicketId: {},
    attachmentsByTicketId: {},
    loading: true,
    error: "",
  });

  const load = useCallback(async () => {
    if (!supabase) {
      setState((current) => ({ ...current, loading: false, error: "Supabase environment is not configured." }));
      return null;
    }

    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const nextState = await fetchPortalState(language);

      setState({
        ...nextState,
        loading: false,
        error: "",
      });
      return nextState;
    } catch (error) {
      const message = error?.message || "Could not load portal data.";
      setState((current) => ({
        ...current,
        loading: false,
        error: message,
      }));
      throw error instanceof Error ? error : new Error(message);
    }
  }, [language]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const updateTicketStatus = useCallback(async (ticketId, status) => {
    const { error } = await supabase.from("tickets").update({ status }).eq("id", ticketId);
    if (error) throw error;

    const refreshedState = await load();
    const refreshedTicket = refreshedState?.tickets.find((ticket) => ticket.rowId === ticketId) || null;
    if (!refreshedTicket || refreshedTicket.status === status) return;

    throw new Error("Ticket status update was blocked by Supabase row-level security. Add an UPDATE policy for authenticated users on public.tickets.");
  }, [load]);

  const actions = useMemo(() => ({
    refresh: load,
    async saveReply(ticketId, replyText) {
      const nowIso = new Date().toISOString();
      const { data: currentTicket, error: currentTicketError } = await supabase
        .from("tickets")
        .select("first_reply_at")
        .eq("id", ticketId)
        .maybeSingle();

      if (currentTicketError) throw currentTicketError;

      const { error } = await supabase.from("ticket_replies").insert([{
        ticket_id: ticketId,
        reply_text: replyText,
        reply_by: "Branch",
        action_taken: null,
      }]);
      if (error) throw error;

      const updatePayload = {
        branch_reply: replyText,
        reply_by: "Branch",
        reply_datetime: nowIso,
      };

      if (!currentTicket?.first_reply_at) updatePayload.first_reply_at = nowIso;

      const { error: ticketError } = await supabase.from("tickets").update(updatePayload).eq("id", ticketId);
      if (ticketError) throw ticketError;

      await load();
    },
    async saveCustomerResolution(ticketId, payload) {
      const nowIso = new Date().toISOString();
      const updatePayload = {
        resolution_action_type: payload.resolution_action_type || null,
        customer_contact_status: payload.customer_contact_status || null,
        customer_satisfied: payload.customer_satisfied || null,
        resolution_date: payload.resolution_date || null,
        resolution_handled_by: payload.resolution_handled_by || null,
        resolution_details: payload.resolution_details || null,
        resolution_updated_at: nowIso,
      };

      const { error: ticketError } = await supabase.from("tickets").update(updatePayload).eq("id", ticketId);
      if (ticketError) throw ticketError;

      const timelineDetails = [formatResolutionActivity(updatePayload), payload.resolution_details].filter(Boolean).join("\n\n");
      const { error: logError } = await supabase.from("ticket_replies").insert([{
        ticket_id: ticketId,
        reply_text: timelineDetails || null,
        reply_by: "Customer Resolution",
        action_taken: formatResolutionActivity(updatePayload) || "Customer resolution updated",
      }]);
      if (logError) throw logError;

      await load();
    },
    async markReplied(ticketId) {
      await updateTicketStatus(ticketId, "Replied");
    },
    async closeTicket(ticketId) {
      await updateTicketStatus(ticketId, "Closed");
    },
    async createTicket(payload, files = []) {
      let { data, error } = await supabase.from("tickets").insert([payload]).select("*");

      if (error && error.message && error.message.includes("schema cache")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        ({ data, error } = await supabase.from("tickets").insert([payload]).select("*"));
      }

      if (error) throw error;

      const created = data?.[0];
      if (created?.id && files.length) {
        for (const file of files) {
          const base64 = await fileToBase64(file);
          const response = await fetch(`${supabaseUrl}/functions/v1/upload-ticket-attachment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              ticket_id: created.id,
              ticket_no: created.ticket_no,
              file_name: file.name,
              mime_type: file.type || "application/octet-stream",
              file_size: file.size || 0,
              source: "cx",
              uploaded_by: "cx portal react",
              file_base64: base64,
            }),
          });
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Attachment upload failed.");
          }
        }
      }

      let emailError = "";

      if (created?.id) {
        const branch = state.branches.find((row) => row.branch_name === created.branch_name);
        const { data: attachmentRows } = await supabase
          .from("ticket_attachments")
          .select("file_name, public_url")
          .eq("ticket_uuid", created.id)
          .order("created_at", { ascending: true });

        if (branch?.branch_email) {
          const complaintDisplay = payload.complaint_at
            ? new Date(payload.complaint_at).toISOString().slice(0, 16).replace("T", " ")
            : null;

          const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-branch-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              ticket_id: created.id,
              ticket_no: created.ticket_no,
              branch_name: created.branch_name,
              branch_email: branch.branch_email,
              customer_name: created.customer_name,
              customer_phone: created.customer_phone,
              feedback_type: created.feedback_type,
              feedback_category: created.feedback_category,
              sub_category: created.sub_category,
              description: created.description,
              priority: created.priority,
              status: created.status,
              complaint_at: payload.complaint_at || null,
              complaint_display: complaintDisplay,
              attachment_links: (attachmentRows || []).filter((row) => row.public_url).map((row) => ({ name: row.file_name, url: row.public_url })),
            }),
          });

          if (!emailRes.ok) {
            const text = await emailRes.text();
            emailError = text || "Branch email failed.";
          }
        }
      }

      await load();
      return { ...created, emailError };
    },
  }), [load, state.branches, updateTicketStatus]);

  return useMemo(() => ({ ...state, ...actions }), [actions, state]);
}
