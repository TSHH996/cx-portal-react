export function ReportMetricGrid({ rows }) {
  return (
    <div className="rptMetricGrid">
      {rows.map((row) => (
        <div key={row.label} className={`rptMetric${row.tone ? ` accent-${row.tone}` : ""}`}>
          <div className="rptMetricLabel">{row.label}</div>
          <div className="rptMetricValue">{row.value}</div>
          <div className="rptMetricSub">{row.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function ReportBreakdownRows({ entries, total, colorClass = "" }) {
  const emptyText = document.documentElement.lang === "ar" ? "لا توجد بيانات للفلاتر المحددة" : "No data for selected filters";
  if (!entries.length) return <div className="rptEmpty">{emptyText}</div>;
  const max = entries[0][1];
  return (
    <div className="rptBarRows">
      {entries.map(([label, count]) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        const width = max > 0 ? ((count / max) * 100).toFixed(1) : 0;
        return (
          <div key={label} className="rptBarRow">
            <div className="rptBarLabel" title={label}>{label}</div>
            <div className="rptBarTrack"><div className={`rptBar ${colorClass}`} style={{ width: `${width}%` }} /></div>
            <div className="rptBarCount">{count}</div>
            <div className="rptBarPct">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportTable({ headers, rows }) {
  const emptyText = document.documentElement.lang === "ar" ? "لا توجد بيانات للفلاتر المحددة" : "No data for selected filters";
  if (!rows.length) return <div className="rptEmpty">{emptyText}</div>;
  return (
    <div className="rptTableWrap">
      <table className="rptTable">
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function ReportCard({ title, meta, children }) {
  return (
    <div className="rptCard">
      <div className="rptCardHead">
        <div className="rptCardTitle">{title}</div>
        {meta ? <div className="rptCardMeta">{meta}</div> : null}
      </div>
      <div className="rptCardBody">{children}</div>
    </div>
  );
}
