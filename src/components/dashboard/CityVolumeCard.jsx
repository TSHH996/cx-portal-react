function CityVolumeCard({ copy, rows, totalCount, systemMessage }) {
  const topCity = rows.find((row) => row.count > 0) || null;

  return (
    <article className="surface-card city-volume-card">
      <div className="city-volume-head">
        <div>
          <div className="card-heading">{copy.dashboardCityVolumeTitle}</div>
          <div className="card-subheading">{copy.dashboardCityVolumeSub}</div>
        </div>
        <div className="city-volume-summary">
          <div className="city-volume-total">{totalCount}</div>
          <div className="city-volume-meta">{copy.ticketCount}</div>
        </div>
      </div>

      <div className="city-volume-feature">
        <div className="city-volume-feature-label">{copy.dashboardCityVolumeTopLabel}</div>
        <div className="city-volume-feature-value"><bdi className="data-value">{topCity?.label || "--"}</bdi></div>
        <div className="city-volume-feature-meta">{topCity ? `${topCity.count} ${copy.ticketCount} • ${topCity.pct}%` : copy.noData}</div>
      </div>

      <div className="city-volume-list">
        {rows.map((row) => (
          <div key={row.label} className="city-volume-row">
            <div className="city-volume-row-head">
              <span><bdi className="data-value">{row.label}</bdi></span>
              <span><bdi className="data-value">{row.count}</bdi> ({row.pct}%)</span>
            </div>
            <div className="city-volume-track"><div className="city-volume-fill" style={{ width: `${Math.max(row.count > 0 ? 8 : 0, row.pct)}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="footer-note">{systemMessage}</div>
    </article>
  );
}

export default CityVolumeCard;
