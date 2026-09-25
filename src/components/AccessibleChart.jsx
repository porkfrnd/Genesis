export default function AccessibleChart({ title, description, children, className = '' }) {
  return (
    <section className={`chart-module ${className}`} aria-label={title}>
      <div className="chart-heading"><div><p className="eyebrow">MEASURED TRACE</p><h3>{title}</h3></div><p>{description}</p></div>
      {children}
    </section>
  );
}
