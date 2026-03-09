import { useMemo, useState } from "react";
import {
  buildCustomerLookup,
  buildInsightResult,
  getInsightPlainText,
  getInsightPresets,
  getInsightsFilteredTickets,
  insightRowsToCsv,
} from "../../features/dashboard/dashboardUtils";

const initialFilters = { range: "30d", branch: "all", brand: "all" };

function downloadCsv(rows, fileName) {
  const csv = insightRowsToCsv(rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

function SmartInsightsPanel({ copy, language, tickets, branches, repliesByTicketId }) {
  const [filters, setFilters] = useState(initialFilters);
  const [phone, setPhone] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const brandOptions = useMemo(
    () => [...new Set(tickets.map((ticket) => ticket.brand).filter(Boolean).filter((value) => value !== "--"))].sort(),
    [tickets]
  );

  const scopedTickets = useMemo(() => getInsightsFilteredTickets(tickets, filters), [tickets, filters]);
  const presets = useMemo(() => getInsightPresets(copy), [copy]);

  const meta = `${copy.insightsUpdated} • ${copy.insightsScopeLabel}: ${[
    filters.range === "all" ? copy.insightsRangeAll : filters.range === "7d" ? copy.insightsRange7d : filters.range === "90d" ? copy.insightsRange90d : filters.range === "month" ? copy.insightsRangeMonth : copy.insightsRange30d,
    filters.branch !== "all" ? filters.branch : null,
    filters.brand !== "all" ? filters.brand : null,
  ].filter(Boolean).join(" • ")}`;

  const result = useMemo(() => {
    if (!activeRequest) return null;
    if (activeRequest.mode === "lookup") {
      const nextResult = buildCustomerLookup(scopedTickets, activeRequest.phone, copy, language);
      return nextResult ? { ...nextResult, meta } : null;
    }
    if (activeRequest.mode === "preset") {
      return { ...buildInsightResult(activeRequest.key, scopedTickets, repliesByTicketId, copy, language), meta };
    }
    return null;
  }, [activeRequest, copy, language, meta, repliesByTicketId, scopedTickets]);

  const applyResult = (nextRequest) => {
    setLoading(false);
    setError("");
    setActiveRequest(nextRequest);
  };

  const handlePreset = (key) => {
    setLoading(true);
    setError("");
    Promise.resolve().then(() => applyResult({ mode: "preset", key }));
  };

  const handleLookup = () => {
    if (!phone.trim()) {
      setError(copy.lookupPhoneRequired);
      setActiveRequest(null);
      return;
    }
    setLoading(true);
    setError("");
    Promise.resolve().then(() => {
      const nextResult = buildCustomerLookup(scopedTickets, phone, copy, language);
      if (!nextResult) {
        setLoading(false);
        setError(copy.lookupNoResults);
        setActiveRequest(null);
        return;
      }
      applyResult({ mode: "lookup", phone });
    });
  };

  const handleCopy = async () => {
    const text = getInsightPlainText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
  };

  const handleExport = () => {
    if (!result?.exportRows?.length) return;
    downloadCsv(result.exportRows, `cx-insight-${result.activeKey || result.mode || "result"}.csv`);
  };

  return (
    <article className="surface-card smart-insights-card">
      <div className="smart-insights-head">
        <div>
          <div className="card-heading">{copy.insightsTitle}</div>
          <div className="card-subheading">{copy.insightsSub}</div>
        </div>
        <span className="status-badge">{copy.insightsBadge}</span>
      </div>

      <div className="insights-controls-grid">
        <label className="filter-block"><span>{copy.insightsRangeLabel}</span><select value={filters.range} onChange={(e) => setFilters((current) => ({ ...current, range: e.target.value }))}><option value="30d">{copy.insightsRange30d}</option><option value="7d">{copy.insightsRange7d}</option><option value="90d">{copy.insightsRange90d}</option><option value="month">{copy.insightsRangeMonth}</option><option value="all">{copy.insightsRangeAll}</option></select></label>
        <label className="filter-block"><span>{copy.insightsBranchLabel}</span><select value={filters.branch} onChange={(e) => setFilters((current) => ({ ...current, branch: e.target.value }))}><option value="all">{copy.insightsAllBranches}</option>{branches.map((branch) => <option key={branch.id || branch.branch_name} value={branch.branch_name}>{branch.branch_name}</option>)}</select></label>
        <label className="filter-block"><span>{copy.insightsBrandLabel}</span><select value={filters.brand} onChange={(e) => setFilters((current) => ({ ...current, brand: e.target.value }))}><option value="all">{copy.insightsAllBrands}</option>{brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
      </div>

      <div className="insights-lookup-box">
        <div className="insights-block-label">{copy.lookupTitle}</div>
        <div className="lookup-row">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={copy.lookupPlaceholder} />
          <button type="button" className="primary-btn" onClick={handleLookup}>🔎 {copy.btnCustomerLookupTxt}</button>
        </div>
        <div className="panel-note">{copy.lookupHint}</div>
      </div>

      <div>
        <div className="insights-block-label">{copy.presetQuestionsTitle}</div>
        <div className="insight-grid">
          {presets.map((preset) => (
            <button key={preset.key} type="button" className={`insight-chip${activeRequest?.key === preset.key ? " active" : ""}`} onClick={() => handlePreset(preset.key)}>
              <div className="insight-chip-title">{preset.title}</div>
              <div className="insight-chip-sub">{preset.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="insights-result-panel">
        <div className="insights-result-head">
          <div className="card-heading small">{copy.resultsTitle}</div>
          <div className="insights-actions">
            <button type="button" className="ghost-btn" onClick={handleCopy} disabled={!result?.summary}>⎘ {copy.btnCopyInsightTxt}</button>
            <button type="button" className="ghost-btn" onClick={handleExport} disabled={!result?.exportRows?.length}>⬇ {copy.btnExportInsightTxt}</button>
          </div>
        </div>
        <div className="panel-note">{loading ? copy.insightsLoading : error ? copy.insightsErrorTitle : result?.meta || copy.insightsReady}</div>
        <div className={`insights-result-content${loading ? " loading" : error ? " error" : !result?.summary ? " empty" : ""}`}>
          {loading ? copy.insightsLoading : error ? error : !result?.summary ? copy.insightsEmpty : (
            <>
              {result.title ? <div className="insights-block-label">{result.title}</div> : null}
              <div className="insights-summary">{result.summary}</div>
              {!!result.metrics?.length && <div className="insights-metrics">{result.metrics.map((entry) => <div key={entry.label} className="insights-metric"><div className="insights-metric-label">{entry.label}</div><div className="insights-metric-value">{entry.value}</div></div>)}</div>}
              {!!result.items?.length && <div className="insights-list">{result.items.map((entry, index) => <div key={`${entry.title}-${index}`} className="insights-list-item"><div className="insights-list-head"><span>{entry.title}</span><span>{entry.value}</span></div>{entry.meta ? <div className="compact-meta">{entry.meta}</div> : null}</div>)}</div>}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default SmartInsightsPanel;
