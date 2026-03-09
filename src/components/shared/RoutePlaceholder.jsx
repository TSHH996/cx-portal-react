function RoutePlaceholder({ title, description, bullets }) {
  return (
    <section className="placeholder-page">
      <div className="surface-card tall-card">
        <div className="card-heading">{title}</div>
        <p className="card-subheading">{description}</p>
        <ul className="prep-list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RoutePlaceholder;
