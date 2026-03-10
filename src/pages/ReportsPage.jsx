import { useMemo, useState } from "react";
import ReportsFiltersBar from "../components/reports/ReportsFiltersBar";
import ReportsTabs from "../components/reports/ReportsTabs";
import { ReportBreakdownRows, ReportCard, ReportMetricGrid, ReportTable } from "../components/reports/ReportsCommon";
import { useAppShell } from "../contexts/AppShellContext";
import { usePortalData } from "../features/portal/usePortalData";
import { buildAgingSection, buildBranchSection, buildBrandSection, buildCategorySection, buildExecutiveSection, buildExportBundles, buildPeriodSection, buildSlaSection, buildSourceSection, buildTrendSection, DEFAULT_REPORT_FILTERS, downloadCsv, getReportOptions, getReportTickets, rptTicketToRow } from "../features/reports/reportsUtils";

function deltaBadge(current, previous, higherIsBad = true) {
  if (previous === 0 && current === 0) return <span className="rptDelta neutral">= 0%</span>;
  const diff = current - previous;
  if (diff === 0) return <span className="rptDelta neutral">= 0%</span>;
  const pct = previous > 0 ? Math.abs(Math.round((diff / previous) * 100)) : "∞";
  const up = diff > 0;
  const bad = higherIsBad ? up : !up;
  const cls = up ? (bad ? "up-bad" : "up-good") : (bad ? "down-bad" : "down-good");
  return <span className={`rptDelta ${cls}`}>{up ? "▲" : "▼"} {pct}%</span>;
}

function ReportsPage() {
  const { copy, language, searchQuery } = useAppShell();
  const { tickets, branches, loading, error } = usePortalData(language);
  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [tab, setTab] = useState("executive");

  const filteredTickets = useMemo(() => getReportTickets(tickets, { ...filters, search: searchQuery }), [tickets, filters, searchQuery]);
  const options = useMemo(() => getReportOptions(tickets, branches), [tickets, branches]);
  const executive = useMemo(() => buildExecutiveSection(filteredTickets), [filteredTickets]);
  const period = useMemo(() => buildPeriodSection(tickets), [tickets]);
  const sla = useMemo(() => buildSlaSection(filteredTickets), [filteredTickets]);
  const branch = useMemo(() => buildBranchSection(filteredTickets), [filteredTickets]);
  const brand = useMemo(() => buildBrandSection(filteredTickets), [filteredTickets]);
  const source = useMemo(() => buildSourceSection(filteredTickets), [filteredTickets]);
  const category = useMemo(() => buildCategorySection(filteredTickets), [filteredTickets]);
  const aging = useMemo(() => buildAgingSection(filteredTickets), [filteredTickets]);
  const trend = useMemo(() => buildTrendSection(filteredTickets), [filteredTickets]);
  const bundles = useMemo(() => buildExportBundles(tickets, filteredTickets), [tickets, filteredTickets]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => {
      if (key === "city") {
        const validBranches = value === "all"
          ? options.branches
          : options.branches.filter((branch) => options.branchCityByName?.[branch] === value);

        return {
          ...current,
          city: value,
          branch: current.branch === "all" || validBranches.includes(current.branch) ? current.branch : "all",
        };
      }

      return { ...current, [key]: value };
    });
  };

  const renderSection = () => {
    if (loading) return <div className="rptLoading">{copy.dashboardLoading}</div>;
    if (error) return <div className="rptLoading">{copy.ticketLoadError}: {error}</div>;

    if (tab === "executive") {
      return (
        <div className="rptSection">
          <div className="rptSectionTitle">{copy.rptTabExecutive}</div>
          <ReportMetricGrid rows={executive.metricsPrimary} />
          <ReportMetricGrid rows={executive.metricsSecondary} />
          <div className="rptGrid3">
            <ReportCard title="Ticket Status Distribution" meta={`${executive.total} total`}>
              <ReportBreakdownRows entries={executive.statusRows} total={executive.total} />
            </ReportCard>
            <ReportCard title="Priority Breakdown" meta={`${executive.total} total`}>
              <ReportBreakdownRows entries={executive.priorityRows} total={executive.total} colorClass="bar-warn" />
            </ReportCard>
            <ReportCard title="Complaint Volume by City" meta={`${executive.cityRows.length} active cities`}>
              <ReportBreakdownRows entries={executive.cityRows} total={executive.total} colorClass="bar-blue" />
            </ReportCard>
          </div>
        </div>
      );
    }

    if (tab === "period") {
      const compareTable = (rows) => (
        <table className="rptCompareTable">
          <thead><tr><th>Metric</th><th>Current</th><th>Previous</th><th>Change</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]}><td className="metric-label">{row[0]}</td><td className="val-current">{row[1]}</td><td className="val-prev">{row[2]}</td><td>{deltaBadge(row[1], row[2], row[0] !== "Closed")}</td></tr>)}</tbody>
        </table>
      );
      return (
        <div className="rptSection">
          <div className="rptSectionTitle">{copy.rptTabPeriod}</div>
          <div className="rptGrid2">
            <ReportCard title="This Week vs Last Week" meta="7-day windows">{compareTable(period.weekRows)}</ReportCard>
            <ReportCard title="This Month vs Last Month" meta="30-day windows">{compareTable(period.monthRows)}</ReportCard>
          </div>
          <div className="rptGrid2">
            <ReportCard title="Top Categories - This Week" meta={`${period.thisWeekCount} tickets`}><ReportBreakdownRows entries={period.thisWeekCategories} total={period.thisWeekCount} /></ReportCard>
            <ReportCard title="Top Categories - Last Week" meta={`${period.lastWeekCount} tickets`}><ReportBreakdownRows entries={period.lastWeekCategories} total={period.lastWeekCount} /></ReportCard>
          </div>
        </div>
      );
    }

    if (tab === "sla") {
      return (
        <div className="rptSection">
          <div className="rptSectionTitle">{copy.rptTabSla}</div>
          <div className="rptGrid3">
            <ReportCard title="SLA Status Overview" meta={`${sla.total} tickets`}>
              {sla.statusRows.map((row) => (
                <div key={row.label} className="rptSlaRow">
                  <div className="rptSlaDot" style={{ background: row.color }} />
                  <div className="rptSlaLabel">{row.label}</div>
                  <div className="rptSlaBar">
                    <div className="rptSlaBarFill" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <div className="rptSlaCount">{row.count}</div>
                  <div className="rptSlaPct">{row.pct}%</div>
                </div>
              ))}
            </ReportCard>
            <ReportCard title="SLA Compliance Rate"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}><div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{sla.compliance}%</div><div className="rptCardMeta">{sla.total} tickets in scope</div></div></ReportCard>
            <ReportCard title="SLA by Brand"><ReportTable headers={["Brand", "Total", "Breached", "Compliance"]} rows={sla.brandRows.map((row) => [row.brand, row.total, row.breached, `${row.compliance}%`])} /></ReportCard>
          </div>
          <ReportCard title="SLA Performance by Branch" meta="Sorted by breach count"><ReportTable headers={["Branch", "Total", "Breached", "At Risk", "Compliance"]} rows={sla.branchRows.map((row) => [row.branch, row.total, row.breached, row.atRisk, `${row.compliance}%`])} /></ReportCard>
        </div>
      );
    }

    if (tab === "branch") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabBranch}</div><div className="rptGrid2"><ReportCard title="Complaint Volume by Branch" meta="Top 10"><ReportBreakdownRows entries={branch.breakdown} total={filteredTickets.length} colorClass="bar-blue" /></ReportCard><ReportCard title="Branch Performance Summary" meta="Top 15 branches by volume"><ReportTable headers={["Branch", "Total", "Active", "Closed", "SLA Breach", "Top Category"]} rows={branch.rows.map((row) => [row.branch, row.total, row.active, row.closed, row.breached, row.topCategory])} /></ReportCard></div></div>;
    }

    if (tab === "brand") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabBrand}</div><div className="rptGrid2"><ReportCard title="Complaint Volume by Brand" meta={`${filteredTickets.length} total`}><ReportBreakdownRows entries={brand.breakdown} total={filteredTickets.length} colorClass="bar-blue" /></ReportCard><ReportCard title="Brand Performance Summary" meta="All brands"><ReportTable headers={["Brand", "Total", "Active", "Closed", "Breached", "SLA Comp.", "Top Issue"]} rows={brand.rows.map((row) => [row.brand, row.total, row.open, row.closed, row.breached, `${row.compliance}%`, row.topIssue])} /></ReportCard></div></div>;
    }

    if (tab === "source") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabSource}</div><ReportCard title="Complaint Volume by Source" meta={`${source.total} total`}><ReportBreakdownRows entries={source.sources} total={source.total} /></ReportCard><div className="rptSectionTitle">Category Breakdown by Top Sources</div><div className="rptGrid3">{source.topCards.length ? source.topCards.map((card) => <ReportCard key={card.source} title={card.source} meta={`${card.count} tickets · ${card.pct}%`}><ReportBreakdownRows entries={card.categories} total={card.categoryTotal} colorClass="bar-good" /></ReportCard>) : <div className="rptEmpty">No source data yet</div>}</div></div>;
    }

    if (tab === "category") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabCategory}</div><div className="rptGrid2"><ReportCard title="Main Complaint Categories" meta={`${category.total} total`}><ReportBreakdownRows entries={category.mainCategories} total={category.total} colorClass="bar-warn" /></ReportCard><ReportCard title="Top Sub-Categories" meta="Top 10"><ReportBreakdownRows entries={category.subCategories} total={category.total} colorClass="bar-good" /></ReportCard></div><ReportCard title="Priority Breakdown by Category" meta="Top 5 categories"><ReportTable headers={["Category", "Total", "High", "Medium", "Low"]} rows={category.priorityRows.map((row) => [row.category, row.total, row.high, row.medium, row.low])} /></ReportCard></div>;
    }

    if (tab === "aging") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabAging}</div><div className="rptAgingGrid">{aging.buckets.map((bucket) => <div key={bucket.label} className={`rptAgingBucket age-${bucket.tone}`}><div className="rptAgingBucketCount">{bucket.count}</div><div className="rptAgingBucketLabel">{bucket.label}</div></div>)}</div><ReportCard title="Oldest Open Tickets" meta="Top 10 by age"><ReportTable headers={["Ticket", "Branch", "Priority", "Age", "Category"]} rows={aging.oldestRows.map((row) => [row.ticket, row.branch, row.priority, row.age, row.category])} /></ReportCard><div className="rptGrid2"><ReportCard title="Aging by Branch"><ReportBreakdownRows entries={aging.byBranch} total={aging.activeCount} colorClass="bar-warn" /></ReportCard><ReportCard title="Aging by Category"><ReportBreakdownRows entries={aging.byCategory} total={aging.activeCount} colorClass="bar-bad" /></ReportCard></div></div>;
    }

    if (tab === "trend") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabTrend}</div><ReportCard title="Daily Complaint Volume" meta={`${trend.days} days`}><div className="rptTrendChart">{trend.bars.map((bar) => <div key={bar.label} className="rptTrendBar" style={{ height: `${bar.height}%` }} title={`${bar.label}: ${bar.count} tickets`} />)}</div><div className="rptTrendLabels"><span>{trend.bars[0]?.label}</span><span>{trend.bars[Math.floor(trend.bars.length / 2)]?.label}</span><span>{trend.bars[trend.bars.length - 1]?.label}</span></div></ReportCard><div className="rptGrid2"><ReportCard title="Weekly Summary" meta="Last 4 weeks"><ReportTable headers={["Week", "Complaints", "SLA Breach"]} rows={trend.weeklyRows.map((row) => [row.week, row.complaints, row.breached])} /></ReportCard><ReportCard title="Rising Complaint Categories" meta="This week vs last week"><ReportTable headers={["Category", "This Week", "Last Week", "Delta"]} rows={trend.risers.map((row) => [row.category, row.current, row.previous, row.delta])} /></ReportCard></div><div className="rptGrid2"><ReportCard title="Top Sources - Last 7 Days"><ReportBreakdownRows entries={trend.topSources} total={trend.thisWeekCount} colorClass="bar-blue" /></ReportCard><ReportCard title="Top Branches - Last 7 Days"><ReportBreakdownRows entries={trend.topBranches} total={trend.thisWeekCount} colorClass="bar-warn" /></ReportCard></div></div>;
    }

    const exportButtons = [
      { label: "All Tickets", rows: bundles.all, file: "cx-all-tickets.csv" },
      { label: "Open Tickets", rows: bundles.open, file: "cx-open-tickets.csv" },
      { label: "SLA Breach Report", rows: bundles.breached, file: "cx-sla-breached.csv" },
      { label: "High Priority", rows: bundles.high, file: "cx-high-priority.csv" },
      { label: "Filtered Report", rows: bundles.filtered, file: "cx-filtered-report.csv" },
      { label: "SLA Summary", rows: bundles.slaSummary, file: "cx-sla-summary.csv" },
      { label: "Branch Report", rows: bundles.branchReport, file: "cx-branch-report.csv" },
      { label: "Brand Report", rows: bundles.brandReport, file: "cx-brand-report.csv" },
      { label: "Category Report", rows: bundles.categoryReport, file: "cx-category-report.csv" },
    ];
    return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabExport}</div><ReportCard title="Export Options" meta="CSV format — UTF-8 with BOM for Excel compatibility"><div className="rptExportGrid">{exportButtons.map((button) => <button key={button.file} type="button" className="rptExportBtn" onClick={() => downloadCsv(button.rows, button.file)}><div className="rptExportBtnTitle">{button.label}</div><div className="rptExportBtnSub">{button.rows.length} rows</div></button>)}</div></ReportCard><ReportCard title="Data Preview - Current Filter Scope" meta={`${filteredTickets.length} tickets`}><ReportTable headers={["Ticket", "Status", "Priority", "Branch", "City", "Brand", "Category", "Source", "Created"]} rows={filteredTickets.slice(0, 15).map((ticket) => [ticket.id, ticket.status, ticket.priority, ticket.branch, ticket.city, ticket.brand, ticket.category, ticket.source, rptTicketToRow(ticket).Created])} /></ReportCard></div>;
  };

  return (
    <div className="rptPage">
      <div className="rptPageHeader">
        <div className="rptPageTitleArea">
          <div className="rptPageTitle">{copy.reportsTitle}</div>
          <div className="rptPageSub">{copy.reportsSub}</div>
        </div>
        <div className="rptPageActions">
          <span className="soft-badge">{filteredTickets.length} {copy.ticketCount}</span>
          <button type="button" className="ghost-btn" onClick={() => downloadCsv(filteredTickets.map(rptTicketToRow), "cx-filtered-report.csv")}>⬇ {copy.export}</button>
        </div>
      </div>
      <ReportsFiltersBar copy={copy} filters={filters} options={options} onChange={handleFilterChange} onReset={() => setFilters(DEFAULT_REPORT_FILTERS)} onQuickExport={() => downloadCsv(filteredTickets.map(rptTicketToRow), "cx-filtered-report.csv")} />
      <ReportsTabs copy={copy} activeTab={tab} onSelect={setTab} />
      <div className="rptContent">{renderSection()}</div>
    </div>
  );
}

export default ReportsPage;
