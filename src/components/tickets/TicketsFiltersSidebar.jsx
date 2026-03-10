function TicketsFiltersSidebar({ copy, filters, resultCount, onChange }) {
  return (
    <div className="ticket-sidebar-column">
      <section className="panel-card">
        <div className="panel-heading">{copy.filtersTitle}</div>
        <div className="filter-stack">
          <input dir="auto" value={filters.search} onChange={(e) => onChange("search", e.target.value)} placeholder={copy.searchPlaceholder} />
          <select dir="auto" value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="all">{copy.filterAllStatus}</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Replied">Replied</option>
            <option value="Closed">Closed</option>
          </select>
          <select dir="auto" value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}>
            <option value="all">{copy.filterAllPriority}</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input dir="auto" value={filters.branch} onChange={(e) => onChange("branch", e.target.value)} placeholder={copy.filterBranchPlaceholder} />
        </div>
        <div className="filter-footer"><span className="soft-badge">{resultCount} {copy.ticketCount}</span></div>
      </section>

      <section className="panel-card">
        <div className="panel-heading">{copy.slaFocusTitle}</div>
        <div className="panel-note">{copy.slaFocusText}</div>
      </section>
    </div>
  );
}

export default TicketsFiltersSidebar;
