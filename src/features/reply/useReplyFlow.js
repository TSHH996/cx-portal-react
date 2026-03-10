import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabaseUrl } from "../../lib/supabase";

const functionBase = `${supabaseUrl}/functions/v1`;

async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function safeReadText(res) {
  try { return await res.text(); } catch { return ""; }
}

export function useReplyFlow(copy) {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticket") || "";
  const token = searchParams.get("token") || "";
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [status, setStatus] = useState("Replied");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "muted", text: copy.replyLoading });
  const [submitted, setSubmitted] = useState(false);

  const setMsg = useCallback((text, type = "muted") => setMessage({ text, type }), []);

  const loadTicket = useCallback(async () => {
    if (!ticketId || !token) {
      setLoading(false);
      setMsg(copy.replyMissingParams, "error");
      return;
    }

    setLoading(true);
    setMsg(copy.replyLoading);

    try {
      const url = `${functionBase}/branch-reply-api?ticket=${encodeURIComponent(ticketId)}&token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const txt = await safeReadText(res);
        setMsg(`API Error ${res.status}: ${txt || copy.replyApiNoBody}`, "error");
        setLoading(false);
        return;
      }

      const txt = await safeReadText(res);
      let data = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch {
        setMsg(`API returned non-JSON: ${txt.slice(0, 200)}`, "error");
        setLoading(false);
        return;
      }

      if (data.error) {
        setMsg(data.error, "error");
        setLoading(false);
        return;
      }

      setTicket(data.ticket || {});
      setReplyText(data.ticket?.branch_reply || "");
      setStatus(data.ticket?.status === "Closed" ? "Closed" : "Replied");
      setMsg(copy.replyReady, "success");
    } catch (error) {
      setMsg(`Fetch failed (network/CORS). ${error?.message || error}`, "error");
    } finally {
      setLoading(false);
    }
  }, [copy.replyApiNoBody, copy.replyLoading, copy.replyMissingParams, copy.replyReady, setMsg, ticketId, token]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const submitReply = useCallback(async () => {
    if (!replyText.trim()) {
      setMsg(copy.replyTextRequired, "error");
      return;
    }

    setSubmitting(true);
    setMsg(copy.replySubmitting);

    try {
      const payload = { ticket_id: ticketId, token, reply_text: replyText.trim(), action_taken: actionTaken.trim(), status, files: [] };
      for (const file of files) {
        const base64 = await fileToBase64(file);
        payload.files.push({ file_name: file.name, mime_type: file.type || "application/octet-stream", file_size: file.size, file_base64: base64 });
      }

      const res = await fetch(`${functionBase}/branch-reply-api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await safeReadText(res);
      if (!res.ok) {
        setMsg(`Submit API Error ${res.status}: ${txt || copy.replySubmitNoBody}`, "error");
        setSubmitting(false);
        return;
      }

      let data = {};
      try {
        data = txt ? JSON.parse(txt) : {};
      } catch {
        data = {};
      }
      if (data.error) {
        setMsg(data.error, "error");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setMsg(`${copy.replySubmitted} ✅`, "success");
    } catch (error) {
      setMsg(`Submit failed (network/CORS). ${error?.message || error}`, "error");
    } finally {
      setSubmitting(false);
    }
  }, [actionTaken, copy.replySubmitted, copy.replySubmitNoBody, copy.replySubmitting, copy.replyTextRequired, files, replyText, setMsg, status, ticketId, token]);

  const filesHint = useMemo(() => (files.length ? `${files.length} ${copy.replyFilesHintCount}` : copy.replyFilesHintEmpty), [copy.replyFilesHintCount, copy.replyFilesHintEmpty, files.length]);

  return {
    ticket,
    loading,
    submitting,
    submitted,
    message,
    replyText,
    actionTaken,
    status,
    files,
    filesHint,
    setReplyText,
    setActionTaken,
    setStatus,
    setFiles,
    submitReply,
  };
}
