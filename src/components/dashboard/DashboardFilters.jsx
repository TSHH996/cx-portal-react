import { getLocalizedCity } from "../../features/portal/newTicketConfig";

function DashboardFilters({ copy, filters, brandOptions, cityOptions, branchOptions, onChange, onReset }) {
  return (
    <section className="surface-card dashboard-filter-row">
      <div className="dashboard-filter-grid">
        <label className="filter-block">
          <span>{copy.dashboardFilterPeriod}</span>
          <select value={filters.range} onChange={(e) => onChange("range", e.target.value)}>
            <option value="all">{copy.dashboardRangeAll}</option>
            <option value="24h">{copy.dashboardRange24h}</option>
            <option value="7d">{copy.dashboardRange7d}</option>
            <option value="30d">{copy.dashboardRange30d}</option>
          </select>
        </label>

        <label className="filter-block">
          <span>{copy.dashboardFilterStatus}</span>
          <select dir="auto" value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="all">{copy.dashboardStatusAll}</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Replied">Replied</option>
            <option value="Closed">Closed</option>
          </select>
        </label>

        <label className="filter-block">
          <span>{copy.dashboardFilterBrand}</span>
          <select dir="auto" value={filters.brand} onChange={(e) => onChange("brand", e.target.value)}>
            <option value="all">{copy.insightsAllBrands}</option>
            {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </label>

        <label className="filter-block">
          <span>{copy.dashboardFilterCity}</span>
          <select dir="auto" value={filters.city} onChange={(e) => onChange("city", e.target.value)}>
            <option value="all">{copy.insightsAllCities}</option>
            {cityOptions.map((city) => <option key={city} value={city}>{getLocalizedCity(city, document.documentElement.lang)}</option>)}
          </select>
        </label>

        <label className="filter-block">
          <span>{copy.dashboardFilterPriority}</span>
          <select dir="auto" value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}>
            <option value="all">{copy.dashboardPriorityAll}</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>

        <label className="filter-block branch-block">
          <span>{copy.dashboardFilterBranch}</span>
          <select dir="auto" value={filters.branch} onChange={(e) => onChange("branch", e.target.value)}>
            <option value="all">{copy.insightsAllBranches}</option>
            {branchOptions.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
        </label>

        <div className="filter-block action-block">
          <button type="button" className="ghost-btn" onClick={onReset}>{copy.dashboardReset}</button>
        </div>
      </div>
    </section>
  );
}

export default DashboardFilters;
