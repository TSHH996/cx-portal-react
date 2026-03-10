import { useAppShell } from "../contexts/AppShellContext";
import { useReplyFlow } from "../features/reply/useReplyFlow";

function ReplyPage() {
  const { copy } = useAppShell();
  const {
    ticket,
    loading,
    submitting,
    submitted,
    message,
    replyText,
    actionTaken,
    status,
    filesHint,
    setReplyText,
    setActionTaken,
    setStatus,
    setFiles,
    submitReply,
  } = useReplyFlow(copy);

  return (
    <div className="replyPageReact">
      <div className="replyPageInner">
        <div className="replyHeader">
          <div className="logo-mark replyLogo">CX</div>
          <div className="replyHeaderText">
            <div className="eyebrow-text">{copy.brandEyebrow}</div>
            <div className="replyTitle">{copy.replyPageTitle}</div>
            <div className="replySub">{copy.replyPageSub}</div>
          </div>
        </div>

        <div className={`replyMessageCard ${message.type}`}>{message.text}</div>

        {!loading && ticket ? (
          <div className="replyCard">
            <div className="replyCardSection">
              <div className="replySectionLabel">{copy.replyTicketInfo}</div>
              <div className="replyGridRow">
                <div><label>{copy.replyTicketNo}</label><input value={ticket.ticket_no || ""} readOnly /></div>
                <div><label>{copy.replyBranchName}</label><input value={ticket.branch_name || ""} readOnly /></div>
              </div>
              <div className="replyGridRow">
                <div><label>{copy.replyCustomerName}</label><input value={ticket.customer_name || ""} readOnly /></div>
                <div><label>{copy.replyCustomerPhone}</label><input value={ticket.customer_phone || ""} readOnly /></div>
              </div>
              <div>
                <label>{copy.replyTicketDescription}</label>
                <textarea value={ticket.description || ""} readOnly />
              </div>
            </div>

            <div className="replyCardSection replyAccentSection">
              <div className="replySectionLabel">{copy.replyYourReply}</div>
              <div className="replyFieldSpace">
                <label>{copy.replyTextLabel} <span className="replyRequired">*</span></label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={copy.replyTextPlaceholder} disabled={submitted} />
              </div>

              <div className="replyFieldSpace">
                <label>{copy.replyActionTaken} <span className="replyOptional">({copy.replyActionHint})</span></label>
                <textarea value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder={copy.replyActionPlaceholder} style={{ minHeight: 90 }} disabled={submitted} />
              </div>

              <div className="replyGridRow">
                <div>
                  <label>{copy.replyStatusLabel}</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={submitted}>
                    <option value="Replied">{copy.filterReplied}</option>
                    <option value="Closed">{copy.filterClosed}</option>
                  </select>
                </div>
                <div>
                  <label>{copy.replyAttachmentsLabel} <span className="replyOptional">({copy.replyActionHint})</span></label>
                  <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} disabled={submitted} />
                  <div className="replyHint">{filesHint}</div>
                </div>
              </div>
            </div>

            <div className="replySubmitWrap">
              <button type="button" className="loginSubmitBtn replySubmitBtn" onClick={submitReply} disabled={submitting || submitted}>
                {submitted ? `${copy.replySubmittedBtn} ✅` : submitting ? copy.replySubmitting : copy.replySubmit}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ReplyPage;
