function BreakdownCard({ title, subtitle, rows, emptyText }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{title}</div>
      <div className="card-subheading">{subtitle}</div>
      <div className="breakdown-list">
        {rows.length ? rows.map((row) => (
          <div key={row.label} className="breakdown-row">
            <div className="breakdown-head"><span>{row.label}</span><span>{row.count} ({row.pct}%)</span></div>
            <div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${Math.max(4, row.pct)}%` }} /></div>
          </div>
        )) : <div className="empty-dash">{emptyText}</div>}
      </div>
    </article>
  );
}

export default BreakdownCard;
