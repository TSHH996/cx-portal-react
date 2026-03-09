import { fmtDate } from "../../features/dashboard/dashboardUtils";

function RecentActivityCard({ title, subtitle, rows, emptyText }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{title}</div>
      <div className="card-subheading">{subtitle}</div>
      <div className="activity-list">
        {rows.length ? rows.map((ticket) => (
          <div key={ticket.rowId} className="activity-row">
            <div className="activity-head"><span>{ticket.id} - {ticket.status}</span><span>{ticket.priority}</span></div>
            <div className="activity-branch">{ticket.branch}</div>
            <div className="activity-meta">{fmtDate(ticket.createdAt)} {ticket.slaRemainingText ? `- ${ticket.slaRemainingText}` : ""}</div>
          </div>
        )) : <div className="empty-dash">{emptyText}</div>}
      </div>
    </article>
  );
}

export default RecentActivityCard;
