export default function StatsRail({ stats, environment }) {
  const items = [
    ['Generation', stats.generation.toLocaleString()],
    ['Population', stats.population.toLocaleString()],
    ['Avg fitness', `${Math.round(stats.averageFitness * 100)}%`],
    ['Survival / gen', `${Math.round(stats.survivalRate * 100)}%`],
  ];
  return (
    <section className="stats-rail" aria-label="Population statistics">
      {items.map(([label, value]) => <div className="stat-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      <div className="stat-cell stat-cell-wide"><span>Current pressure</span><strong>{environment.temperature}°C · food {Math.round(environment.food * 100)}% · predation {Math.round(environment.predation * 100)}%</strong></div>
    </section>
  );
}
