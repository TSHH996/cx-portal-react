function TrendCard({ copy, bars, totalCount, systemMessage }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{copy.dashboardTrendTitle}</div>
      <div className="card-subheading">{copy.dashboardTrendSub}</div>
      <div className="chart-shell">
        <div className="chart-grid">
          {bars.map((bar) => (
            <div key={bar.key} className="chart-bar-wrap">
              <div className="chart-bar" style={{ height: `${bar.height}%`, animationDelay: bar.delay }} title={`${bar.key}: ${bar.count}`} />
              <span className="chart-xlabel">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="chart-label-row">
          <span>{copy.chartLeftLabel}</span>
          <span>{totalCount} {copy.chartRightSuffix}</span>
        </div>
      </div>
      <div className="footer-note">{systemMessage}</div>
    </article>
  );
}

export default TrendCard;
