import { useMemo, useState } from "react";
import AlertsCard from "../components/dashboard/AlertsCard";
import BreakdownCard from "../components/dashboard/BreakdownCard";
import CompactCard from "../components/dashboard/CompactCard";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import KpiGrid from "../components/dashboard/KpiGrid";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import SmartInsightsPanel from "../components/dashboard/SmartInsightsPanel";
import TrendCard from "../components/dashboard/TrendCard";
import { useAppShell } from "../contexts/AppShellContext";
import { buildDashboardMetrics, buildOperationalAlerts, buildRecentActivity, buildVolumeBars, filterDashboardTickets, getDashboardCollections } from "../features/dashboard/dashboardUtils";
import { CITIES } from "../features/portal/newTicketConfig";
import { usePortalData } from "../features/portal/usePortalData";

function DashboardPage() {
  const { copy, language, searchQuery } = useAppShell();
  const { tickets, branches, repliesByTicketId, loading, error } = usePortalData(language);
  const [filters, setFilters] = useState({ range: "7d", status: "all", brand: "all", city: "all", priority: "all", branchQuery: "" });

  const brandOptions = useMemo(
    () => [...new Set(tickets.map((ticket) => ticket.brand).filter(Boolean).filter((value) => value !== "--"))].sort(),
    [tickets]
  );

  const filteredTickets = useMemo(() => filterDashboardTickets(tickets, { ...filters, search: searchQuery }), [tickets, filters, searchQuery]);
  const metrics = useMemo(() => buildDashboardMetrics(filteredTickets, language), [filteredTickets, language]);
  const collections = useMemo(() => getDashboardCollections(filteredTickets), [filteredTickets]);
  const alerts = useMemo(() => buildOperationalAlerts(filteredTickets, language), [filteredTickets, language]);
  const recentActivity = useMemo(() => buildRecentActivity(filteredTickets), [filteredTickets]);
  const bars = useMemo(() => buildVolumeBars(filteredTickets), [filteredTickets]);

  const systemMessage = error
    ? `${copy.ticketLoadError}: ${error}`
    : loading
      ? copy.dashboardLoading
      : language === "ar"
        ? `تم الاتصال. تم تحميل ${tickets.length} تذكرة.`
        : `Connected. Loaded ${tickets.length} ticket(s).`;

  return (
    <div className="dashboard-page-grid">
      <section className="hero-card">
        <div>
          <div className="eyebrow-text">{copy.overviewTitle}</div>
          <h2 className="section-title">{copy.kpiSub}</h2>
        </div>
        <div className="status-row">
          <span className="status-badge good">{copy.connectedBadge}</span>
          <span className="status-badge">{copy.dashboardAsOfLabel} {new Date().toLocaleString()}</span>
        </div>
      </section>

      <DashboardFilters
        copy={copy}
        filters={filters}
        brandOptions={brandOptions}
        cityOptions={CITIES}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ range: "7d", status: "all", brand: "all", city: "all", priority: "all", branchQuery: "" })}
      />

      <KpiGrid metrics={metrics} />

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <TrendCard copy={copy} bars={bars} totalCount={filteredTickets.length} systemMessage={systemMessage} />

          <div className="analytics-split">
            <BreakdownCard title={copy.breakdownSourceTitle} subtitle={copy.breakdownSourceSub} rows={collections.source} emptyText={copy.noData} />
            <BreakdownCard title={copy.breakdownBrandTitle} subtitle={copy.breakdownBrandSub} rows={collections.brand} emptyText={copy.noData} />
            <BreakdownCard title={copy.breakdownCityTitle} subtitle={copy.breakdownCitySub} rows={collections.city} emptyText={copy.noData} />
            <BreakdownCard title={copy.breakdownFeedbackTypeTitle} subtitle={copy.breakdownFeedbackTypeSub} rows={collections.feedbackType} emptyText={copy.noData} />
          </div>

          <div className="analytics-split two-cards">
            <CompactCard title={copy.topCategoriesTitle} subtitle={copy.topCategoriesSub} rows={collections.categories} emptyText={copy.noData} metaFormatter={(row) => `${row.pct}%`} />
            <CompactCard title={copy.topBranchesTitle} subtitle={copy.topBranchesSub} rows={collections.branches} emptyText={copy.noData} metaFormatter={(row) => `${row.pct}%`} />
          </div>
        </div>

        <div className="dashboard-side-col">
          <SmartInsightsPanel copy={copy} language={language} tickets={tickets} branches={branches} repliesByTicketId={repliesByTicketId} />
          <AlertsCard title={copy.alertsTitle} subtitle={copy.alertsSub} alerts={alerts} emptyText={copy.alertsEmpty} />
          <RecentActivityCard title={copy.activityTitle} subtitle={copy.activitySub} rows={recentActivity} emptyText={copy.activityEmpty} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
