const NAV_ITEMS = [
  { id: 'lab', label: 'Lab', marker: '01' },
  { id: 'genome', label: 'Genome', marker: '02' },
  { id: 'evolution', label: 'Evolution', marker: '03' },
  { id: 'courses', label: 'Courses', marker: '04' },
  { id: 'challenges', label: 'Challenges', marker: '05' },
  { id: 'sandbox', label: 'Sandbox', marker: '06' },
];

export default function LabShell({ activeView, onNavigate, theme, onToggleTheme, children }) {
  return (
    <div className="app-shell" data-theme={theme}>
      <header className="top-rail">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">G</div>
          <div>
            <p className="brand-name">GENESIS</p>
            <p className="brand-subtitle">Genetics &amp; evolution laboratory</p>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Primary laboratory areas">
          {NAV_ITEMS.map((item) => (
            <button
              className={`nav-item ${activeView === item.id ? 'is-active' : ''}`}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              <span className="nav-marker">{item.marker}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-actions">
          <span className="model-status"><span className="status-dot" aria-hidden="true" /> Educational model</span>
          <button className="icon-button" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
          </button>
        </div>
      </header>
      <div className="scope-strip">
        <span>GENESIS / SIMPLIFIED EDUCATIONAL MODEL</span>
        <span>Real genotype–phenotype relationships are more complex than this lab.</span>
      </div>
      <main className="workspace">{children}</main>
    </div>
  );
}
