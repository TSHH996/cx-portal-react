import { useState } from "react";
import { fmtDate } from "../../features/dashboard/dashboardUtils";
import { buildTimeline, ticketInfoRows } from "../../features/tickets/ticketUtils";
import { splitMultiValue } from "../../lib/multiValue";

function renderInfoValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "--";
    if (value.length === 1) return value[0];
    return (
      <span className="kv-multi-badges">
        {value.map((entry) => <span key={entry} className="soft-badge">{entry}</span>)}
      </span>
    );
  }

  const str = String(value ?? "");
  const parts = splitMultiValue(str);
  if (parts.length <= 1) return str || "--";

  return (
    <span className="kv-multi-badges">
      {parts.map((part) => <span key={part} className="soft-badge">{part}</span>)}
    </span>
  );
}

function TicketDetailPane({ copy, ticket, onSaveReply, onMarkReplied, onClose, onAssign, onAddNote, busy }) {
  const [replyText, setReplyText] = useState(ticket?.branchReply || "");

  const infoRows = ticketInfoRows(ticket, copy.ticketInfoLabels || {});
  const timeline = buildTimeline(ticket, copy);

  if (!ticket) {
    return (
      <section className="ticket-detail-card">
        <div className="detail-head">
          <div className="detail-left">
            <div className="detail-eyebrow">{copy.detailEyebrow}</div>
            <div className="detail-title">{copy.detailTitleEmpty}</div>
            <div className="detail-subtitle">{copy.detailSubEmpty}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="ticket-detail-card">
        <div className="detail-head">
          <div className="detail-left">
            <div className="detail-eyebrow">{copy.detailEyebrow}</div>
            <div className="detail-title">{ticket.subject || ticket.id}</div>
            <div className="detail-subtitle"><bdi>{ticket.id}</bdi> • {ticket.branch} • {ticket.statusLabel || ticket.status}</div>
          </div>
        <div className="detail-actions">
          <button type="button" className="ghost-btn" onClick={onAssign}>{copy.btnAssignTxt}</button>
          <button type="button" className="ghost-btn good" onClick={() => onClose(ticket.rowId)} disabled={busy}>{copy.btnCloseTxt}</button>
          <button type="button" className="primary-btn" onClick={onAddNote}>{copy.btnAddNoteTxt}</button>
        </div>
      </div>

      <div className="detail-body-grid">
        <article className="panel-card">
          <div className="panel-heading">{copy.ticketInfoTitle}</div>
          <div className="ticket-kv-grid">
            {infoRows.map(([label, value]) => <div key={label}><b>{label}:</b> {renderInfoValue(value)}</div>)}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">{copy.descriptionTitle}</div>
          <div className="mono-block">{ticket.description || "--"}</div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">{copy.attachmentsTitle}</div>
          <div className="attachments-list">
            {ticket.attachments?.length ? ticket.attachments.map((file, index) => {
              const url = file.public_url || file.file_url || file.url || "#";
              const name = file.file_name || `file-${index + 1}`;
              return <div key={`${name}-${index}`}><a href={url} target="_blank" rel="noreferrer">{name}</a>{file.source ? <span className="attachment-meta">({file.source})</span> : null}</div>;
            }) : <div className="panel-note">{copy.noAttachments}</div>}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">{copy.branchReplyTitle}</div>
          <div className="reply-box">
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={copy.branchReplyPlaceholder} />
            <div className="inline-actions">
              <button type="button" className="primary-btn" onClick={() => onSaveReply(ticket.rowId, replyText)} disabled={busy}>{copy.btnSaveReplyTxt}</button>
              <button type="button" className="ghost-btn warn" onClick={() => onMarkReplied(ticket.rowId)} disabled={busy}>{copy.btnMarkRepliedTxt}</button>
            </div>
            <div className="panel-note">{ticket.replyAt ? `${copy.replyByMeta} ${ticket.replyBy || copy.replyByBranchTimeline} • ${fmtDate(ticket.replyAt)}` : copy.noBranchReplyYet}</div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">{copy.timelineTitle}</div>
          <div className="timeline-list">
            {timeline.map((event, index) => (
              <div key={`${event.t}-${index}`} className="timeline-event">
                <div className="timeline-dot" />
                <div className="timeline-box">
                  <div className="timeline-title">{event.t}</div>
                  <div className="timeline-desc">{event.d}</div>
                  <div className="timeline-meta">{event.m}</div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default TicketDetailPane;
