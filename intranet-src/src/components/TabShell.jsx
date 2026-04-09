// Shared tab shell for grouped views
// Usage:
//   <TabShell tabs={['Overview','Labor','Patronage']} active={tab} onTab={setTab}>
//     {tab === 'Overview' && <.../>}
//   </TabShell>

export function TabShell({ title, subtitle, tabs, active, onTab, action, children }) {
  return (
    <div style={s.container}>
      {/* Panel header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{title}</h1>
          {subtitle && <p style={s.subtitle}>{subtitle}</p>}
        </div>
        {action && <div style={s.headerAction}>{action}</div>}
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map((t) => {
          const isActive = t.key === active || t === active
          const key = t.key || t
          const label = t.label || t
          return (
            <button
              key={key}
              onClick={() => onTab(key)}
              style={{
                ...s.tab,
                ...(isActive ? s.tabActive : {}),
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#9090b0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#52526a' }}
            >
              {label}
              {t.badge != null && (
                <span style={{
                  ...s.badge,
                  background: t.badgeColor ? `${t.badgeColor}20` : 'rgba(255,255,255,0.06)',
                  color: t.badgeColor || '#8888a8',
                }}>{t.badge}</span>
              )}
            </button>
          )
        })}
        <div style={s.tabBarFill} />
      </div>

      {/* Tab content */}
      <div style={s.content}>
        {children}
      </div>
    </div>
  )
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.75rem 2rem 0',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: '#e0e0f0',
    margin: 0,
    lineHeight: 1.15,
  },
  subtitle: {
    fontSize: '0.78rem',
    color: '#52526a',
    margin: '0.3rem 0 0',
  },
  headerAction: {
    marginTop: '0.15rem',
  },
  tabBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    padding: '0 2rem',
    marginTop: '1.25rem',
    borderBottom: '1px solid #1a1a2e',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem 0.7rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#52526a',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.1s',
    letterSpacing: '0.01em',
    marginBottom: '-1px',
    fontFamily: 'inherit',
  },
  tabActive: {
    color: '#e0e0f0',
    borderBottomColor: '#c2512a',
    fontWeight: 600,
  },
  tabBarFill: {
    flex: 1,
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '10px',
    letterSpacing: '0.02em',
  },
  content: {
    flex: 1,
    padding: '1.75rem 2rem 2rem',
  },
}
