import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, supabaseAnonKey, supabaseUrl } from "../../lib/supabase";
import { normalizeTicket } from "../dashboard/dashboardUtils";

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

  const tickets = (ticketsRes.data || []).map((ticket) => normalizeTicket(ticket, repliesByTicketId, attachmentsByTicketId, language));

  return {
    tickets,
    branches: branchesRes.data || [],
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
      const { error } = await supabase.from("ticket_replies").insert([{
        ticket_id: ticketId,
        reply_text: replyText,
        reply_by: "Branch",
        action_taken: "Reply saved",
      }]);
      if (error) throw error;
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
        const basePayload = { ...payload };
        delete basePayload.brand;
        delete basePayload.feedback_type;
        delete basePayload.feedback_category;
        delete basePayload.sub_category;
        ({ data, error } = await supabase.from("tickets").insert([basePayload]).select("*"));
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

      await load();
      return created;
    },
  }), [load, updateTicketStatus]);

  return useMemo(() => ({ ...state, ...actions }), [actions, state]);
}
