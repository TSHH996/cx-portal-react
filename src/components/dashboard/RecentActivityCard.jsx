import { fmtDate } from "../../features/dashboard/dashboardUtils";

function RecentActivityCard({ title, subtitle, rows, emptyText }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{title}</div>
      <div className="card-subheading">{subtitle}</div>
      <div className="activity-list">
        {rows.length ? rows.map((ticket) => (
          <div key={ticket.rowId} className="activity-row">
            <div className="activity-head"><span><bdi className="data-value">{ticket.id}</bdi> - <bdi className="data-value">{ticket.statusLabel || ticket.status}</bdi></span><span><bdi className="data-value">{ticket.priorityLabel || ticket.priority}</bdi></span></div>
            <div className="activity-branch"><bdi className="data-value">{ticket.branch}</bdi></div>
            <div className="activity-meta"><bdi className="data-value">{fmtDate(ticket.createdAt)}</bdi> {ticket.slaRemainingText ? `- ${ticket.slaRemainingText}` : ""}</div>
          </div>
        )) : <div className="empty-dash">{emptyText}</div>}
      </div>
    </article>
  );
}

export default RecentActivityCard;
