import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { normalizeTicket } from "../dashboard/dashboardUtils";

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
      return;
    }

    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
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

      setState({
        tickets,
        branches: branchesRes.data || [],
        repliesByTicketId,
        attachmentsByTicketId,
        loading: false,
        error: "",
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Could not load portal data.",
      }));
    }
  }, [language]);

  useEffect(() => {
    load();
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
      const { error } = await supabase.from("tickets").update({ status: "Replied" }).eq("id", ticketId);
      if (error) throw error;
      await load();
    },
    async closeTicket(ticketId) {
      const { error } = await supabase.from("tickets").update({ status: "Closed" }).eq("id", ticketId);
      if (error) throw error;
      await load();
    },
  }), [load]);

  return useMemo(() => ({ ...state, ...actions }), [actions, state]);
}
