function AlertsCard({ title, subtitle, alerts, emptyText }) {
  return (
    <article className="surface-card">
      <div className="card-heading">{title}</div>
      <div className="card-subheading">{subtitle}</div>
      <div className="alerts-list">
        {alerts.length ? alerts.map((alert) => (
          <div key={alert.title} className={`alert-row ${alert.cls}`}>
            <div className="compact-head"><span>{alert.title}</span></div>
            <div className="alert-meta">{alert.meta}</div>
          </div>
        )) : <div className="empty-dash">{emptyText}</div>}
      </div>
    </article>
  );
}

export default AlertsCard;
