import { fmtDate } from "../../features/dashboard/dashboardUtils";
import { priorityBadgeClass, statusBadgeClass } from "../../features/tickets/ticketUtils";

function TicketsListPane({ copy, tickets, selectedId, onSelect }) {
  return (
    <section className="tickets-list-card">
      <div className="list-head">
        <div>
          <div className="section-title">{copy.ticketsInboxTitle}</div>
          <div className="section-sub">{copy.ticketsInboxSub}</div>
        </div>
      </div>

      <div className="ticket-rows">
        {tickets.length ? tickets.map((ticket) => (
          <button key={ticket.rowId} type="button" className={`ticket-row${ticket.rowId === selectedId ? " active" : ""}`} onClick={() => onSelect(ticket.rowId)}>
            <div className="ticket-row-meta">
              <div className="ticket-row-title"><bdi className="data-value">{ticket.subject || `${ticket.id} • ${ticket.branch}`}</bdi></div>
              <div className="ticket-row-badges">
                <span className={`soft-badge ${priorityBadgeClass(ticket.priority)}`}><bdi className="data-value">{ticket.priorityLabel || ticket.priority}</bdi></span>
                <span className={`soft-badge ${statusBadgeClass(ticket.status)}`}><bdi className="data-value">{ticket.statusLabel || ticket.status}</bdi></span>
                <span className="soft-badge"><bdi className="data-value">{ticket.branch}</bdi></span>
              </div>
            </div>
            <div className="ticket-row-right">
              <div><bdi className="data-value">{ticket.id}</bdi></div>
              <div><bdi className="data-value">{fmtDate(ticket.createdAt)}</bdi></div>
            </div>
          </button>
        )) : <div className="empty-state-block">{copy.noTicketsFound}</div>}
      </div>
    </section>
  );
}

export default TicketsListPane;
