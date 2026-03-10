import { useRef } from "react";
import { getLocalizedCategory, getLocalizedCity, getLocalizedPriority, getLocalizedSource, getLocalizedStatus } from "../../features/portal/newTicketConfig";

function ReportsDateField({ id, label, value, onChange, language }) {
  const inputRef = useRef(null);

  function handleOpenPicker() {
    if (typeof inputRef.current?.showPicker === "function") {
      inputRef.current.showPicker();
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.click();
  }

  return (
    <div className="rptFilterGroup rptFilterGroup-date">
      <label className="rptFilterLabel" htmlFor={id}>{label}</label>
      <div className="rptDateField">
        <button type="button" className={`rptDateTrigger${value ? " has-value" : ""}`} onClick={handleOpenPicker}>
          <span className={`rptDateText${value ? "" : " is-placeholder"}`}>{value || (language === "ar" ? "اختر التاريخ" : "YYYY-MM-DD")}</span>
          <span className="rptDateIcon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3.25" y="4.5" width="13.5" height="12.25" rx="2.25" />
              <path d="M6.5 2.75v3.5M13.5 2.75v3.5M3.25 8.25h13.5" />
            </svg>
          </span>
        </button>
        <input ref={inputRef} id={id} type="date" className="rptDateNativeInput" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={-1} aria-hidden="true" />
      </div>
    </div>
  );
}

function ReportsFiltersBar({ copy, filters, options, onChange, onReset, onQuickExport, language }) {
  const branchOptions = filters.city === "all"
    ? options.branches
    : options.branches.filter((branch) => options.branchCityByName?.[branch] === filters.city);

  return (
    <div className="rptFilterBar">
      <ReportsDateField id="reports-date-from" label={copy.rptFrom} value={filters.dateFrom} onChange={(value) => onChange("dateFrom", value)} language={language} />
      <ReportsDateField id="reports-date-to" label={copy.rptTo} value={filters.dateTo} onChange={(value) => onChange("dateTo", value)} language={language} />
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptBrand}</label><select className="rptSelect" value={filters.brand} onChange={(e) => onChange("brand", e.target.value)}><option value="all">{copy.insightsAllBrands}</option>{options.brands.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptCity}</label><select className="rptSelect" value={filters.city} onChange={(e) => onChange("city", e.target.value)}><option value="all">{copy.rptAllCities}</option>{options.cities.map((value) => <option key={value} value={value}>{getLocalizedCity(value, language)}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptBranch}</label><select className="rptSelect" value={filters.branch} onChange={(e) => onChange("branch", e.target.value)}><option value="all">{copy.insightsAllBranches}</option>{branchOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptStatus}</label><select className="rptSelect" value={filters.status} onChange={(e) => onChange("status", e.target.value)}><option value="all">{copy.filterAllStatus}</option><option value="Open">{copy.filterOpen}</option><option value="In Progress">{copy.filterInProgress}</option><option value="Replied">{copy.filterReplied}</option><option value="Closed">{copy.filterClosed}</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptSource}</label><select className="rptSelect" value={filters.source} onChange={(e) => onChange("source", e.target.value)}><option value="all">{copy.rptAllSources}</option>{options.sources.map((value) => <option key={value} value={value}>{getLocalizedSource(value, language)}</option>)}</select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptPriority}</label><select className="rptSelect" value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}><option value="all">{copy.filterAllPriority}</option><option value="High">{getLocalizedPriority("High", language)}</option><option value="Medium">{getLocalizedPriority("Medium", language)}</option><option value="Low">{getLocalizedPriority("Low", language)}</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptSla}</label><select className="rptSelect" value={filters.slaStatus} onChange={(e) => onChange("slaStatus", e.target.value)}><option value="all">{copy.rptAllSla}</option><option value="pending">{copy.rptSlaPending || "Pending"}</option><option value="at_risk">{copy.rptSlaAtRisk || "At Risk"}</option><option value="breached">{copy.rptSlaBreached || "Breached"}</option></select></div>
      <div className="rptFilterGroup"><label className="rptFilterLabel">{copy.rptCategory}</label><select className="rptSelect" value={filters.category} onChange={(e) => onChange("category", e.target.value)}><option value="all">{copy.rptAllCategories}</option>{options.categories.map((value) => <option key={value} value={value}>{getLocalizedCategory(value, language)}</option>)}</select></div>
      <button type="button" className="ghost-btn" onClick={onReset}>↺ {copy.dashboardReset}</button>
      <button type="button" className="ghost-btn" onClick={onQuickExport}>⬇ {copy.export}</button>
    </div>
  );
}

export default ReportsFiltersBar;
