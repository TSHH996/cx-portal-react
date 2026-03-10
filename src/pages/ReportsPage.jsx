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

function getReportsPageText(language) {
  if (language === "ar") {
    return {
      ticketStatusDistribution: "توزيع حالات التذاكر",
      priorityBreakdown: "توزيع الأولويات",
      complaintVolumeByCity: "حجم الشكاوى حسب المدينة",
      activeCities: "مدن نشطة",
      thisWeekVsLastWeek: "هذا الأسبوع مقابل الأسبوع الماضي",
      thisMonthVsLastMonth: "هذا الشهر مقابل الشهر الماضي",
      sevenDayWindows: "نافذة 7 أيام",
      thirtyDayWindows: "نافذة 30 يومًا",
      topCategoriesThisWeek: "أعلى التصنيفات - هذا الأسبوع",
      topCategoriesLastWeek: "أعلى التصنيفات - الأسبوع الماضي",
      slaStatusOverview: "نظرة عامة على حالات SLA",
      slaComplianceRate: "نسبة الالتزام بـ SLA",
      ticketsInScope: "تذكرة ضمن النطاق",
      slaByBrand: "أداء SLA حسب العلامة التجارية",
      slaPerformanceByBranch: "أداء SLA حسب الفرع",
      sortedByBreach: "مرتبة حسب عدد التجاوزات",
      complaintVolumeByBranch: "حجم الشكاوى حسب الفرع",
      top10: "أفضل 10",
      branchPerformanceSummary: "ملخص أداء الفروع",
      top15Branches: "أفضل 15 فرعًا حسب الحجم",
      complaintVolumeByBrand: "حجم الشكاوى حسب العلامة التجارية",
      total: "إجمالي",
      brandPerformanceSummary: "ملخص أداء العلامات التجارية",
      allBrands: "جميع العلامات التجارية",
      complaintVolumeBySource: "حجم الشكاوى حسب المصدر",
      categoryBreakdownByTopSources: "توزيع التصنيفات حسب أعلى المصادر",
      noSourceDataYet: "لا توجد بيانات للمصادر حاليًا",
      mainComplaintCategories: "التصنيفات الرئيسية للشكاوى",
      topSubCategories: "أعلى التصنيفات الفرعية",
      priorityBreakdownByCategory: "توزيع الأولوية حسب التصنيف",
      top5Categories: "أفضل 5 تصنيفات",
      oldestOpenTickets: "أقدم التذاكر المفتوحة",
      top10ByAge: "أفضل 10 حسب العمر",
      agingByBranch: "عمر التذاكر حسب الفرع",
      agingByCategory: "عمر التذاكر حسب التصنيف",
      dailyComplaintVolume: "حجم الشكاوى اليومي",
      days: "يومًا",
      weeklySummary: "الملخص الأسبوعي",
      last4Weeks: "آخر 4 أسابيع",
      risingComplaintCategories: "التصنيفات الأكثر تصاعدًا",
      thisWeekVsLastWeekShort: "هذا الأسبوع مقابل الأسبوع الماضي",
      topSourcesLast7Days: "أعلى المصادر - آخر 7 أيام",
      topBranchesLast7Days: "أعلى الفروع - آخر 7 أيام",
      exportOptions: "خيارات التصدير",
      exportOptionsMeta: "ملفات CSV بترميز UTF-8 ومتوافقة مع Excel",
      dataPreview: "معاينة البيانات - نطاق الفلاتر الحالي",
      rows: "صف",
      metric: "المؤشر",
      current: "الحالي",
      previous: "السابق",
      change: "التغير",
      brand: "العلامة التجارية",
      totalLabel: "الإجمالي",
      breached: "متجاوزة",
      compliance: "الالتزام",
      branch: "الفرع",
      atRisk: "معرضة للتجاوز",
      active: "نشطة",
      closed: "مغلقة",
      slaBreach: "تجاوز SLA",
      topCategory: "أعلى تصنيف",
      topIssue: "أعلى مشكلة",
      source: "المصدر",
      category: "التصنيف",
      age: "العمر",
      week: "الأسبوع",
      complaints: "الشكاوى",
      delta: "الفرق",
      ticket: "التذكرة",
      status: "الحالة",
      priority: "الأولوية",
      city: "المدينة",
      created: "تاريخ الإنشاء",
      allTickets: "جميع التذاكر",
      openTickets: "التذاكر المفتوحة",
      slaBreachReport: "تقرير تجاوز SLA",
      highPriority: "أولوية عالية",
      filteredReport: "التقرير المفلتر",
      slaSummary: "ملخص SLA",
      branchReport: "تقرير الفروع",
      brandReport: "تقرير العلامات التجارية",
      categoryReport: "تقرير التصنيفات",
    };
  }

  return {
    ticketStatusDistribution: "Ticket Status Distribution",
    priorityBreakdown: "Priority Breakdown",
    complaintVolumeByCity: "Complaint Volume by City",
    activeCities: "active cities",
    thisWeekVsLastWeek: "This Week vs Last Week",
    thisMonthVsLastMonth: "This Month vs Last Month",
    sevenDayWindows: "7-day windows",
    thirtyDayWindows: "30-day windows",
    topCategoriesThisWeek: "Top Categories - This Week",
    topCategoriesLastWeek: "Top Categories - Last Week",
    slaStatusOverview: "SLA Status Overview",
    slaComplianceRate: "SLA Compliance Rate",
    ticketsInScope: "tickets in scope",
    slaByBrand: "SLA by Brand",
    slaPerformanceByBranch: "SLA Performance by Branch",
    sortedByBreach: "Sorted by breach count",
    complaintVolumeByBranch: "Complaint Volume by Branch",
    top10: "Top 10",
    branchPerformanceSummary: "Branch Performance Summary",
    top15Branches: "Top 15 branches by volume",
    complaintVolumeByBrand: "Complaint Volume by Brand",
    total: "total",
    brandPerformanceSummary: "Brand Performance Summary",
    allBrands: "All brands",
    complaintVolumeBySource: "Complaint Volume by Source",
    categoryBreakdownByTopSources: "Category Breakdown by Top Sources",
    noSourceDataYet: "No source data yet",
    mainComplaintCategories: "Main Complaint Categories",
    topSubCategories: "Top Sub-Categories",
    priorityBreakdownByCategory: "Priority Breakdown by Category",
    top5Categories: "Top 5 categories",
    oldestOpenTickets: "Oldest Open Tickets",
    top10ByAge: "Top 10 by age",
    agingByBranch: "Aging by Branch",
    agingByCategory: "Aging by Category",
    dailyComplaintVolume: "Daily Complaint Volume",
    days: "days",
    weeklySummary: "Weekly Summary",
    last4Weeks: "Last 4 weeks",
    risingComplaintCategories: "Rising Complaint Categories",
    thisWeekVsLastWeekShort: "This week vs last week",
    topSourcesLast7Days: "Top Sources - Last 7 Days",
    topBranchesLast7Days: "Top Branches - Last 7 Days",
    exportOptions: "Export Options",
    exportOptionsMeta: "CSV format - UTF-8 with BOM for Excel compatibility",
    dataPreview: "Data Preview - Current Filter Scope",
    rows: "rows",
    metric: "Metric",
    current: "Current",
    previous: "Previous",
    change: "Change",
    brand: "Brand",
    totalLabel: "Total",
    breached: "Breached",
    compliance: "Compliance",
    branch: "Branch",
    atRisk: "At Risk",
    active: "Active",
    closed: "Closed",
    slaBreach: "SLA Breach",
    topCategory: "Top Category",
    topIssue: "Top Issue",
    source: "Source",
    category: "Category",
    age: "Age",
    week: "Week",
    complaints: "Complaints",
    delta: "Delta",
    ticket: "Ticket",
    status: "Status",
    priority: "Priority",
    city: "City",
    created: "Created",
    allTickets: "All Tickets",
    openTickets: "Open Tickets",
    slaBreachReport: "SLA Breach Report",
    highPriority: "High Priority",
    filteredReport: "Filtered Report",
    slaSummary: "SLA Summary",
    branchReport: "Branch Report",
    brandReport: "Brand Report",
    categoryReport: "Category Report",
  };
}

function ReportsPage() {
  const { copy, language, searchQuery } = useAppShell();
  const { tickets, branches, loading, error } = usePortalData(language);
  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [tab, setTab] = useState("executive");
  const text = useMemo(() => getReportsPageText(language), [language]);

  const filteredTickets = useMemo(() => getReportTickets(tickets, { ...filters, search: searchQuery }), [tickets, filters, searchQuery]);
  const options = useMemo(() => getReportOptions(tickets, branches), [tickets, branches]);
  const executive = useMemo(() => buildExecutiveSection(filteredTickets, language), [filteredTickets, language]);
  const period = useMemo(() => buildPeriodSection(tickets, language), [tickets, language]);
  const sla = useMemo(() => buildSlaSection(filteredTickets, language), [filteredTickets, language]);
  const branch = useMemo(() => buildBranchSection(filteredTickets), [filteredTickets]);
  const brand = useMemo(() => buildBrandSection(filteredTickets), [filteredTickets]);
  const source = useMemo(() => buildSourceSection(filteredTickets), [filteredTickets]);
  const category = useMemo(() => buildCategorySection(filteredTickets), [filteredTickets]);
  const aging = useMemo(() => buildAgingSection(filteredTickets, language), [filteredTickets, language]);
  const trend = useMemo(() => buildTrendSection(filteredTickets, language), [filteredTickets, language]);
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
            <ReportCard title={text.ticketStatusDistribution} meta={`${executive.total} ${text.total}`.trim()}>
              <ReportBreakdownRows entries={executive.statusRows} total={executive.total} />
            </ReportCard>
            <ReportCard title={text.priorityBreakdown} meta={`${executive.total} ${text.total}`.trim()}>
              <ReportBreakdownRows entries={executive.priorityRows} total={executive.total} colorClass="bar-warn" />
            </ReportCard>
            <ReportCard title={text.complaintVolumeByCity} meta={`${executive.cityRows.length} ${text.activeCities}`.trim()}>
              <ReportBreakdownRows entries={executive.cityRows} total={executive.total} colorClass="bar-blue" />
            </ReportCard>
          </div>
        </div>
      );
    }

    if (tab === "period") {
      const compareTable = (rows) => (
        <table className="rptCompareTable">
          <thead><tr><th>{text.metric}</th><th>{text.current}</th><th>{text.previous}</th><th>{text.change}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]}><td className="metric-label">{row[0]}</td><td className="val-current">{row[1]}</td><td className="val-prev">{row[2]}</td><td>{deltaBadge(row[1], row[2], row[0] !== text.closed)}</td></tr>)}</tbody>
        </table>
      );
      return (
        <div className="rptSection">
          <div className="rptSectionTitle">{copy.rptTabPeriod}</div>
          <div className="rptGrid2">
            <ReportCard title={text.thisWeekVsLastWeek} meta={text.sevenDayWindows}>{compareTable(period.weekRows)}</ReportCard>
            <ReportCard title={text.thisMonthVsLastMonth} meta={text.thirtyDayWindows}>{compareTable(period.monthRows)}</ReportCard>
          </div>
          <div className="rptGrid2">
            <ReportCard title={text.topCategoriesThisWeek} meta={`${period.thisWeekCount} ${copy.ticketCount}`.trim()}><ReportBreakdownRows entries={period.thisWeekCategories} total={period.thisWeekCount} /></ReportCard>
            <ReportCard title={text.topCategoriesLastWeek} meta={`${period.lastWeekCount} ${copy.ticketCount}`.trim()}><ReportBreakdownRows entries={period.lastWeekCategories} total={period.lastWeekCount} /></ReportCard>
          </div>
        </div>
      );
    }

    if (tab === "sla") {
      return (
        <div className="rptSection">
          <div className="rptSectionTitle">{copy.rptTabSla}</div>
          <div className="rptGrid3">
            <ReportCard title={text.slaStatusOverview} meta={`${sla.total} ${copy.ticketCount}`.trim()}>
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
            <ReportCard title={text.slaComplianceRate}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}><div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{sla.compliance}%</div><div className="rptCardMeta">{sla.total} {text.ticketsInScope}</div></div></ReportCard>
            <ReportCard title={text.slaByBrand}><ReportTable headers={[text.brand, text.totalLabel, text.breached, text.compliance]} rows={sla.brandRows.map((row) => [row.brand, row.total, row.breached, `${row.compliance}%`])} /></ReportCard>
          </div>
          <ReportCard title={text.slaPerformanceByBranch} meta={text.sortedByBreach}><ReportTable headers={[text.branch, text.totalLabel, text.breached, text.atRisk, text.compliance]} rows={sla.branchRows.map((row) => [row.branch, row.total, row.breached, row.atRisk, `${row.compliance}%`])} /></ReportCard>
        </div>
      );
    }

    if (tab === "branch") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabBranch}</div><div className="rptGrid2"><ReportCard title={text.complaintVolumeByBranch} meta={text.top10}><ReportBreakdownRows entries={branch.breakdown} total={filteredTickets.length} colorClass="bar-blue" /></ReportCard><ReportCard title={text.branchPerformanceSummary} meta={text.top15Branches}><ReportTable headers={[text.branch, text.totalLabel, text.active, text.closed, text.slaBreach, text.topCategory]} rows={branch.rows.map((row) => [row.branch, row.total, row.active, row.closed, row.breached, row.topCategory])} /></ReportCard></div></div>;
    }

    if (tab === "brand") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabBrand}</div><div className="rptGrid2"><ReportCard title={text.complaintVolumeByBrand} meta={`${filteredTickets.length} ${text.total}`.trim()}><ReportBreakdownRows entries={brand.breakdown} total={filteredTickets.length} colorClass="bar-blue" /></ReportCard><ReportCard title={text.brandPerformanceSummary} meta={text.allBrands}><ReportTable headers={[text.brand, text.totalLabel, text.active, text.closed, text.breached, text.compliance, text.topIssue]} rows={brand.rows.map((row) => [row.brand, row.total, row.open, row.closed, row.breached, `${row.compliance}%`, row.topIssue])} /></ReportCard></div></div>;
    }

    if (tab === "source") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabSource}</div><ReportCard title={text.complaintVolumeBySource} meta={`${source.total} ${text.total}`.trim()}><ReportBreakdownRows entries={source.sources} total={source.total} /></ReportCard><div className="rptSectionTitle">{text.categoryBreakdownByTopSources}</div><div className="rptGrid3">{source.topCards.length ? source.topCards.map((card) => <ReportCard key={card.source} title={card.source} meta={`${card.count} ${copy.ticketCount} · ${card.pct}%`}><ReportBreakdownRows entries={card.categories} total={card.categoryTotal} colorClass="bar-good" /></ReportCard>) : <div className="rptEmpty">{text.noSourceDataYet}</div>}</div></div>;
    }

    if (tab === "category") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabCategory}</div><div className="rptGrid2"><ReportCard title={text.mainComplaintCategories} meta={`${category.total} ${text.total}`.trim()}><ReportBreakdownRows entries={category.mainCategories} total={category.total} colorClass="bar-warn" /></ReportCard><ReportCard title={text.topSubCategories} meta={text.top10}><ReportBreakdownRows entries={category.subCategories} total={category.total} colorClass="bar-good" /></ReportCard></div><ReportCard title={text.priorityBreakdownByCategory} meta={text.top5Categories}><ReportTable headers={[text.category, text.totalLabel, copy.filterHigh, copy.filterMedium, copy.filterLow]} rows={category.priorityRows.map((row) => [row.category, row.total, row.high, row.medium, row.low])} /></ReportCard></div>;
    }

    if (tab === "aging") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabAging}</div><div className="rptAgingGrid">{aging.buckets.map((bucket) => <div key={bucket.label} className={`rptAgingBucket age-${bucket.tone}`}><div className="rptAgingBucketCount">{bucket.count}</div><div className="rptAgingBucketLabel">{bucket.label}</div></div>)}</div><ReportCard title={text.oldestOpenTickets} meta={text.top10ByAge}><ReportTable headers={[text.ticket, text.branch, text.priority, text.age, text.category]} rows={aging.oldestRows.map((row) => [row.ticket, row.branch, row.priority, row.age, row.category])} /></ReportCard><div className="rptGrid2"><ReportCard title={text.agingByBranch}><ReportBreakdownRows entries={aging.byBranch} total={aging.activeCount} colorClass="bar-warn" /></ReportCard><ReportCard title={text.agingByCategory}><ReportBreakdownRows entries={aging.byCategory} total={aging.activeCount} colorClass="bar-bad" /></ReportCard></div></div>;
    }

    if (tab === "trend") {
      return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabTrend}</div><ReportCard title={text.dailyComplaintVolume} meta={`${trend.days} ${text.days}`.trim()}><div className="rptTrendChart">{trend.bars.map((bar) => <div key={bar.label} className="rptTrendBar" style={{ height: `${bar.height}%` }} title={`${bar.label}: ${bar.count} ${copy.ticketCount}`} />)}</div><div className="rptTrendLabels"><span>{trend.bars[0]?.label}</span><span>{trend.bars[Math.floor(trend.bars.length / 2)]?.label}</span><span>{trend.bars[trend.bars.length - 1]?.label}</span></div></ReportCard><div className="rptGrid2"><ReportCard title={text.weeklySummary} meta={text.last4Weeks}><ReportTable headers={[text.week, text.complaints, text.slaBreach]} rows={trend.weeklyRows.map((row) => [row.week, row.complaints, row.breached])} /></ReportCard><ReportCard title={text.risingComplaintCategories} meta={text.thisWeekVsLastWeekShort}><ReportTable headers={[text.category, text.current, text.previous, text.delta]} rows={trend.risers.map((row) => [row.category, row.current, row.previous, row.delta])} /></ReportCard></div><div className="rptGrid2"><ReportCard title={text.topSourcesLast7Days}><ReportBreakdownRows entries={trend.topSources} total={trend.thisWeekCount} colorClass="bar-blue" /></ReportCard><ReportCard title={text.topBranchesLast7Days}><ReportBreakdownRows entries={trend.topBranches} total={trend.thisWeekCount} colorClass="bar-warn" /></ReportCard></div></div>;
    }

    const exportButtons = [
      { label: text.allTickets, rows: bundles.all, file: "cx-all-tickets.csv" },
      { label: text.openTickets, rows: bundles.open, file: "cx-open-tickets.csv" },
      { label: text.slaBreachReport, rows: bundles.breached, file: "cx-sla-breached.csv" },
      { label: text.highPriority, rows: bundles.high, file: "cx-high-priority.csv" },
      { label: text.filteredReport, rows: bundles.filtered, file: "cx-filtered-report.csv" },
      { label: text.slaSummary, rows: bundles.slaSummary, file: "cx-sla-summary.csv" },
      { label: text.branchReport, rows: bundles.branchReport, file: "cx-branch-report.csv" },
      { label: text.brandReport, rows: bundles.brandReport, file: "cx-brand-report.csv" },
      { label: text.categoryReport, rows: bundles.categoryReport, file: "cx-category-report.csv" },
    ];
    return <div className="rptSection"><div className="rptSectionTitle">{copy.rptTabExport}</div><ReportCard title={text.exportOptions} meta={text.exportOptionsMeta}><div className="rptExportGrid">{exportButtons.map((button) => <button key={button.file} type="button" className="rptExportBtn" onClick={() => downloadCsv(button.rows, button.file)}><div className="rptExportBtnTitle">{button.label}</div><div className="rptExportBtnSub">{button.rows.length} {text.rows}</div></button>)}</div></ReportCard><ReportCard title={text.dataPreview} meta={`${filteredTickets.length} ${copy.ticketCount}`.trim()}><ReportTable headers={[text.ticket, text.status, text.priority, text.branch, text.city, text.brand, text.category, text.source, text.created]} rows={filteredTickets.slice(0, 15).map((ticket) => [ticket.id, ticket.statusLabel || ticket.status, ticket.priorityLabel || ticket.priority, ticket.branch, ticket.cityLabel || ticket.city, ticket.brand, ticket.categoryLabel || ticket.category, ticket.sourceLabel || ticket.source, rptTicketToRow(ticket).Created])} /></ReportCard></div>;
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
      <ReportsFiltersBar copy={copy} filters={filters} options={options} onChange={handleFilterChange} onReset={() => setFilters(DEFAULT_REPORT_FILTERS)} onQuickExport={() => downloadCsv(filteredTickets.map(rptTicketToRow), "cx-filtered-report.csv")} language={language} />
      <ReportsTabs copy={copy} activeTab={tab} onSelect={setTab} />
      <div className="rptContent">{renderSection()}</div>
    </div>
  );
}

export default ReportsPage;
