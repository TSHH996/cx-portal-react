function TicketsFiltersSidebar({ copy, filters, resultCount, onChange }) {
  return (
    <div className="ticket-sidebar-column">
      <section className="panel-card">
        <div className="panel-heading">{copy.filtersTitle}</div>
        <div className="filter-stack">
          <input value={filters.search} onChange={(e) => onChange("search", e.target.value)} placeholder={copy.searchPlaceholder} />
          <select value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="all">{copy.filterAllStatus}</option>
            <option value="Open">{copy.filterOpen}</option>
            <option value="In Progress">{copy.filterInProgress}</option>
            <option value="Replied">{copy.filterReplied}</option>
            <option value="Closed">{copy.filterClosed}</option>
          </select>
          <select value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}>
            <option value="all">{copy.filterAllPriority}</option>
            <option value="High">{copy.filterHigh}</option>
            <option value="Medium">{copy.filterMedium}</option>
            <option value="Low">{copy.filterLow}</option>
          </select>
          <input value={filters.branch} onChange={(e) => onChange("branch", e.target.value)} placeholder={copy.filterBranchPlaceholder} />
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
