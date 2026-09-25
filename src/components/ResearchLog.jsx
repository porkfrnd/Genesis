export default function ResearchLog({ events }) {
  const recent = [...events].reverse().slice(0, 9);
  return (
    <section className="research-log" aria-labelledby="research-log-title">
      <div className="module-heading compact-heading"><div><p className="eyebrow">RESEARCH RECORD / CHRONOLOGY</p><h2 id="research-log-title">Event log</h2></div><span className="mono-label">{events.length} EVENTS</span></div>
      {recent.length ? <ol className="event-list">{recent.map((event, index) => <li key={`${event.generation}-${event.type}-${index}`}><span className="event-generation">GEN {event.generation}</span><span className={`event-dot event-${event.type}`} aria-hidden="true" /><div><strong>{event.type === 'selection' ? 'Selection event' : event.type === 'mutation' ? 'Mutation event' : event.type === 'extinction' ? 'Extinction' : event.type === 'edit' ? 'Genome edit' : event.type === 'clone' ? 'Specimen cloned' : 'Experiment event'}</strong><p>{event.message}</p></div></li>)}</ol> : <p className="empty-library">Run your first experiment to begin building a research record.</p>}
    </section>
  );
}
