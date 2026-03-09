function KpiGrid({ metrics }) {
  return (
    <section className="dashboard-stats-grid">
      {metrics.map((metric) => (
        <article key={metric.key} className={`stat-card tone-${metric.key}`}>
          <div className="stat-top-row">
            <div className="stat-label">{metric.label}</div>
            <div className="stat-icon-badge">{metric.icon}</div>
          </div>
          <div className="stat-value">{metric.value}</div>
          <div className="stat-meta">{metric.meta}</div>
        </article>
      ))}
    </section>
  );
}

export default KpiGrid;
