import { REPORT_TABS } from "../../features/reports/reportsUtils";

function ReportsTabs({ copy, activeTab, onSelect }) {
  const labels = {
    executive: copy.rptTabExecutive,
    period: copy.rptTabPeriod,
    sla: copy.rptTabSla,
    branch: copy.rptTabBranch,
    brand: copy.rptTabBrand,
    source: copy.rptTabSource,
    category: copy.rptTabCategory,
    aging: copy.rptTabAging,
    trend: copy.rptTabTrend,
    export: copy.rptTabExport,
  };

  return <nav className="rptNav">{REPORT_TABS.map((tab) => <button key={tab} type="button" className={`rptTab${activeTab === tab ? " active" : ""}${tab === "export" ? " rptTabExport" : ""}`} onClick={() => onSelect(tab)}>{labels[tab]}</button>)}</nav>;
}

export default ReportsTabs;
