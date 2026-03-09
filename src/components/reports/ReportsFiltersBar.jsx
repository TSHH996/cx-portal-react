function ReportsFiltersBar({ copy, filters, options, onChange, onReset, onQuickExport }) {
  return (
    <div className="rptFilterBar">
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptFrom}</label><input type="date" className="rptDateInput" value={filters.dateFrom} onChange={(e) => onChange("dateFrom", e.target.value)} /></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptTo}</label><input type="date" className="rptDateInput" value={filters.dateTo} onChange={(e) => onChange("dateTo", e.target.value)} /></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptBrand}</label><select className="rptSelect" value={filters.brand} onChange={(e) => onChange("brand", e.target.value)}><option value="all">{copy.insightsAllBrands}</option>{options.brands.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptStatus}</label><select className="rptSelect" value={filters.status} onChange={(e) => onChange("status", e.target.value)}><option value="all">{copy.filterAllStatus}</option><option value="Open">{copy.filterOpen}</option><option value="In Progress">{copy.filterInProgress}</option><option value="Replied">{copy.filterReplied}</option><option value="Closed">{copy.filterClosed}</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptSource}</label><select className="rptSelect" value={filters.source} onChange={(e) => onChange("source", e.target.value)}><option value="all">{copy.rptAllSources}</option>{options.sources.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptPriority}</label><select className="rptSelect" value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}><option value="all">{copy.filterAllPriority}</option><option value="High">{copy.filterHigh}</option><option value="Medium">{copy.filterMedium}</option><option value="Low">{copy.filterLow}</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptSla}</label><select className="rptSelect" value={filters.slaStatus} onChange={(e) => onChange("slaStatus", e.target.value)}><option value="all">{copy.rptAllSla}</option><option value="pending">Pending</option><option value="at_risk">At Risk</option><option value="breached">Breached</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptCategory}</label><select className="rptSelect" value={filters.category} onChange={(e) => onChange("category", e.target.value)}><option value="all">{copy.rptAllCategories}</option>{options.categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptBranch}</label><select className="rptSelect" value={filters.branch} onChange={(e) => onChange("branch", e.target.value)}><option value="all">{copy.insightsAllBranches}</option>{options.branches.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <button type="button" className="ghost-btn" onClick={onReset}>↺ {copy.dashboardReset}</button>
      <button type="button" className="ghost-btn" onClick={onQuickExport}>⬇ {copy.export}</button>
    </div>
  );
}

export default ReportsFiltersBar;
