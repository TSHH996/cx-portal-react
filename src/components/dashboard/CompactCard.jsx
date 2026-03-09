function CompactCard({ title, subtitle, rows, emptyText, metaFormatter }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{title}</div>
      <div className="card-subheading">{subtitle}</div>
      <div className="compact-list">
        {rows.length ? rows.map((row) => (
          <div key={row.label} className="compact-row">
            <div className="compact-head"><span>{row.label}</span><span>{row.count}</span></div>
            <div className="compact-meta">{metaFormatter(row)}</div>
          </div>
        )) : <div className="empty-dash">{emptyText}</div>}
      </div>
    </article>
  );
}

export default CompactCard;
