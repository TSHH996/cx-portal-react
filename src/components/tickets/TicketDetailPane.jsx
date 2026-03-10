import { useState } from "react";
import { CUSTOMER_CONTACT_STATUSES, CUSTOMER_SATISFIED_OPTIONS, RESOLUTION_ACTION_TYPES } from "../../features/portal/newTicketConfig";
import { fmtDate } from "../../features/dashboard/dashboardUtils";
import { buildTimeline, ticketInfoRows } from "../../features/tickets/ticketUtils";
import { splitMultiValue } from "../../lib/multiValue";

function renderInfoValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "--";
    if (value.length === 1) return <bdi className="data-value">{value[0]}</bdi>;
    return (
      <span className="kv-multi-badges">
        {value.map((entry) => <span key={entry} className="soft-badge"><bdi className="data-value">{entry}</bdi></span>)}
      </span>
    );
  }

  const str = String(value ?? "");
  const parts = splitMultiValue(str);
  if (parts.length <= 1) return <bdi className="data-value">{str || "--"}</bdi>;

  return (
    <span className="kv-multi-badges">
      {parts.map((part) => <span key={part} className="soft-badge"><bdi className="data-value">{part}</bdi></span>)}
    </span>
  );
}

function toDateInputValue(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialResolutionForm(ticket, handledByDefault) {
  return {
    resolution_action_type: ticket?.resolutionActionType || "",
    customer_contact_status: ticket?.customerContactStatus || "",
    customer_satisfied: ticket?.customerSatisfied || "",
    resolution_date: toDateInputValue(ticket?.resolutionDate),
    resolution_handled_by: ticket?.resolutionHandledBy || handledByDefault || "",
    resolution_details: ticket?.resolutionDetails || "",
  };
}

function TicketDetailPane({ copy, ticket, handledByDefault, onSaveReply, onSaveResolution, onMarkReplied, onClose, onAssign, onAddNote, busy }) {
  const [replyText, setReplyText] = useState(ticket?.branchReply || "");
  const [resolutionForm, setResolutionForm] = useState(initialResolutionForm(ticket, handledByDefault));

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

  const hasReply = Boolean(ticket.branchReply);
  const hasResolution = Boolean(
    ticket.resolutionActionType
      || ticket.customerContactStatus
      || ticket.customerSatisfied
      || ticket.resolutionDate
      || ticket.resolutionHandledBy
      || ticket.resolutionDetails
  );

  return (
    <section className="ticket-detail-card">
      <div className="detail-head">
        <div className="detail-left">
          <div className="detail-eyebrow">{copy.detailEyebrow}</div>
          <div className="detail-title"><bdi className="data-value">{ticket.subject || ticket.id}</bdi></div>
          <div className="detail-subtitle"><bdi className="data-value">{ticket.id}</bdi> • <bdi className="data-value">{ticket.branch}</bdi> • <bdi className="data-value">{ticket.statusLabel || ticket.status}</bdi></div>
        </div>
        <div className="detail-actions">
          <button type="button" className="ghost-btn" onClick={onAssign}>{copy.btnAssignTxt}</button>
          <button type="button" className="ghost-btn good" onClick={() => onClose(ticket.rowId)} disabled={busy}>{copy.btnCloseTxt}</button>
          <button type="button" className="primary-btn" onClick={onAddNote}>{copy.btnAddNoteTxt}</button>
        </div>
      </div>

      <div className="detail-body-grid">
        <article className="panel-card">
          <div className="panel-heading">{copy.complaintDetailsTitle || copy.ticketInfoTitle}</div>
          <div className="ticket-kv-grid">
            {infoRows.map(([label, value]) => <div key={label}><b>{label}:</b> {renderInfoValue(value)}</div>)}
          </div>
          <div className="detail-section-divider" />
          <div className="panel-heading small">{copy.descriptionTitle}</div>
          <div className="mono-block"><bdi className="data-value">{ticket.description || "--"}</bdi></div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">{copy.attachmentsTitle}</div>
          <div className="attachments-list">
            {ticket.attachments?.length ? ticket.attachments.map((file, index) => {
              const url = file.public_url || file.file_url || file.url || "#";
              const name = file.file_name || `file-${index + 1}`;
              return <div key={`${name}-${index}`}><a href={url} target="_blank" rel="noreferrer"><bdi className="data-value">{name}</bdi></a>{file.source ? <span className="attachment-meta">(<bdi className="data-value">{file.source}</bdi>)</span> : null}</div>;
            }) : <div className="panel-note">{copy.noAttachments}</div>}
          </div>
        </article>

        <article className="panel-card detail-section-card">
          <div className="detail-section-head">
            <div>
              <div className="panel-heading">{copy.branchReplyTitle}</div>
              <div className="panel-note">{copy.branchReplySub}</div>
            </div>
            <div className="panel-note">{ticket.replyAt ? `${copy.branchReplyMeta}: ${fmtDate(ticket.replyAt)}` : copy.branchReplyEmpty}</div>
          </div>

          <div className="detail-section-stack">
            <div className="detail-highlight-card">
              <div className="panel-heading small">{copy.branchReplyLatestTitle}</div>
              <div className="mono-block"><bdi className="data-value">{ticket.branchReply || copy.branchReplyEmpty}</bdi></div>
            </div>

            <div className="reply-box reply-box-managed">
              <textarea dir="auto" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={copy.branchReplyPlaceholder} />
              <div className="inline-actions">
                <button type="button" className="primary-btn" onClick={() => onSaveReply(ticket.rowId, replyText)} disabled={busy}>{hasReply ? (copy.btnUpdateReplyTxt || copy.btnSaveReplyTxt) : copy.btnSaveReplyTxt}</button>
                <button type="button" className="ghost-btn warn" onClick={() => onMarkReplied(ticket.rowId)} disabled={busy}>{copy.btnMarkRepliedTxt}</button>
              </div>
            </div>
          </div>
        </article>

        <article className="panel-card detail-section-card">
          <div className="detail-section-head">
            <div>
              <div className="panel-heading">{copy.customerResolutionTitle}</div>
              <div className="panel-note">{copy.customerResolutionSub}</div>
            </div>
            <div className="panel-note">{ticket.resolutionUpdatedAt ? `${copy.branchReplyMeta}: ${fmtDate(ticket.resolutionUpdatedAt)}` : copy.resolutionEmpty}</div>
          </div>

          <div className="detail-section-stack">
            {hasResolution ? (
              <div className="detail-highlight-card resolution-summary-grid">
                <div><b>{copy.resolutionActionTypeLabel}:</b> <bdi className="data-value">{ticket.resolutionActionType || "--"}</bdi></div>
                <div><b>{copy.resolutionContactStatusLabel}:</b> <bdi className="data-value">{ticket.customerContactStatus || "--"}</bdi></div>
                <div><b>{copy.resolutionSatisfiedLabel}:</b> <bdi className="data-value">{ticket.customerSatisfied || "--"}</bdi></div>
                <div><b>{copy.resolutionDateLabel}:</b> <bdi className="data-value">{ticket.resolutionDate ? fmtDate(ticket.resolutionDate) : "--"}</bdi></div>
                <div><b>{copy.resolutionHandledByLabel}:</b> <bdi className="data-value">{ticket.resolutionHandledBy || "--"}</bdi></div>
                <div className="resolution-summary-notes"><b>{copy.resolutionDetailsLabel}:</b> <bdi className="data-value">{ticket.resolutionDetails || "--"}</bdi></div>
              </div>
            ) : null}

            <div className="resolution-grid">
              <div className="fieldReact">
                <label>{copy.resolutionActionTypeLabel}</label>
                <select dir="auto" value={resolutionForm.resolution_action_type} onChange={(e) => setResolutionForm((current) => ({ ...current, resolution_action_type: e.target.value }))}>
                  <option value="">--</option>
                  {RESOLUTION_ACTION_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="fieldReact">
                <label>{copy.resolutionContactStatusLabel}</label>
                <select dir="auto" value={resolutionForm.customer_contact_status} onChange={(e) => setResolutionForm((current) => ({ ...current, customer_contact_status: e.target.value }))}>
                  <option value="">--</option>
                  {CUSTOMER_CONTACT_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="fieldReact">
                <label>{copy.resolutionSatisfiedLabel}</label>
                <select dir="auto" value={resolutionForm.customer_satisfied} onChange={(e) => setResolutionForm((current) => ({ ...current, customer_satisfied: e.target.value }))}>
                  <option value="">--</option>
                  {CUSTOMER_SATISFIED_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="fieldReact">
                <label>{copy.resolutionDateLabel}</label>
                <input dir="auto" type="date" value={resolutionForm.resolution_date} onChange={(e) => setResolutionForm((current) => ({ ...current, resolution_date: e.target.value }))} />
              </div>
              <div className="fieldReact full">
                <label>{copy.resolutionHandledByLabel}</label>
                <input dir="auto" value={resolutionForm.resolution_handled_by} onChange={(e) => setResolutionForm((current) => ({ ...current, resolution_handled_by: e.target.value }))} />
              </div>
              <div className="fieldReact full">
                <label>{copy.resolutionDetailsLabel}</label>
                <textarea dir="auto" value={resolutionForm.resolution_details} onChange={(e) => setResolutionForm((current) => ({ ...current, resolution_details: e.target.value }))} placeholder={copy.resolutionDetailsPlaceholder} />
              </div>
            </div>

            <div className="inline-actions">
              <button type="button" className="primary-btn" onClick={() => onSaveResolution(ticket.rowId, resolutionForm)} disabled={busy}>{hasResolution ? copy.resolutionUpdateTxt : copy.resolutionSaveTxt}</button>
            </div>
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
