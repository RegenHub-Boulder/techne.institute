import { useAuth } from '../hooks/useAuth.jsx'

// SVG icons at 16×16
function Icon({ d, size = 16, fill = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  dashboard: 'M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z',
  account:   'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0H3z',
  patronage: 'M8 1L9.8 5.6 15 6.1l-3.8 3.4 1.1 5.1L8 12.1l-4.3 2.5 1.1-5.1L1 5.9l5.2-.5z',
  labor:     'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2v5l3 2-1 1.7L7 9.5V3h1z',
  projects:  'M8 1l7 4-7 4-7-4 7-4zM1 9l7 4 7-4M1 13l7 4 7-4',
  directory: 'M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM1 15c0-2.2 1.8-4 4-4s4 1.8 4 4H1zm6 0c0-2.2 1.8-4 4-4s4 1.8 4 4H7z',
  documents: 'M3 1h7l3 3v11H3V1zm7 0v3h3M6 8h4M6 11h4M6 5h2',
  cloud:     'M11 9a3 3 0 0 0-2.8-4 4 4 0 0 0-7.2 2 2.5 2.5 0 0 0 .5 5h9.5z',
  journal:   'M2 2h12v12H2V2zm2 3h8M4 8h8M4 11h5',
  ledger:    'M8 1v14M3 4h10M3 12h10M1 8h14',
  governance:'M8 2l2 4h4l-3 2.5 1.2 4L8 10.5 3.8 12.5 5 8 2 5.5h4z',
  verify:    'M7 13L2 8l1.4-1.4L7 10.2 12.6 4 14 5.4z',
  treasury:  'M2 5h12v8H2V5zm5 0V3h2v2M1 5h14v2H1z',
  admin:     'M8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM1 15c0-3.3 3.1-6 7-6s7 2.7 7 6H1z',
  ventures:  'M3 13V6l5-5 5 5v7H9V9H7v4H3z',
}

const NAV_ITEMS = [
  { path: '',            label: 'Dashboard',  icon: 'dashboard'  },
  { path: 'account',     label: 'Account',    icon: 'account'    },
  { path: 'projects',    label: 'Cooperative',icon: 'projects'   },
  { path: 'journal',     label: 'Finance',    icon: 'ledger'     },
  { path: 'cloud',       label: 'Cloud',      icon: 'cloud'      },
  { path: 'guide',       label: 'Reference',  icon: 'documents'  },
]

const STEWARD_ITEMS = [
  { path: 'admin',      label: 'Admin',      icon: 'admin'      },
]

const INVESTOR_ITEMS = [
  { path: 'ventures',   label: 'Ventures',   icon: 'ventures'   },
]

function NavItem({ path, label, icon, currentPath, steward }) {
  const active = currentPath === path
  const href = `/intranet/${path ? path + '/' : ''}`
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '0.8rem',
        fontWeight: active ? 600 : 400,
        color: active ? '#e0e0f0' : '#52526a',
        background: active ? 'rgba(200,117,51,0.12)' : 'transparent',
        borderLeft: active ? '2px solid #c87533' : '2px solid transparent',
        transition: 'all 0.12s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = '#9090b0'
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = '#52526a'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <span style={{ color: active ? '#c87533' : 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <Icon d={ICONS[icon]} size={14} />
      </span>
      <span>{label}</span>
      {steward && (
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.6rem',
          color: '#c87533',
          background: 'rgba(200,117,51,0.1)',
          padding: '1px 4px',
          borderRadius: '3px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
          flexShrink: 0,
        }}>S</span>
      )}
    </a>
  )
}

export function HUDLayout({ children }) {
  const { participant, signOut, isSteward } = useAuth()
  const currentPath = window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, '')

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div style={s.root}>
      {/* Status bar */}
      <div style={s.statusBar}>
        <div style={s.statusLeft}>
          <span style={s.wordmark}>Techne</span>
          <span style={s.statusSep}>·</span>
          <span style={s.statusLabel}>Intranet</span>
          <span style={s.statusSep}>·</span>
          <span style={s.statusDate}>{today}</span>
        </div>
        <div style={s.statusRight}>
          {participant?.name && (
            <span style={s.statusUser}>
              {participant.name.split(' ')[0]}
              {isSteward && <span style={s.stewardPip}>steward</span>}
            </span>
          )}
          <button
            onClick={signOut}
            style={s.signOutBtn}
            onMouseEnter={e => e.currentTarget.style.color = '#e0e0f0'}
            onMouseLeave={e => e.currentTarget.style.color = '#52526a'}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Body: sidebar + panel */}
      <div style={s.body}>
        {/* Sidebar */}
        <nav style={s.sidebar}>
          <div style={s.navSection}>
            {NAV_ITEMS.map(item => (
              <NavItem key={item.path} {...item} currentPath={currentPath} />
            ))}
          </div>

          {(isSteward || (participant?.membership_class === 4)) && (
            <div style={{ ...s.navSection, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #1a1a28' }}>
              {isSteward && STEWARD_ITEMS.map(item => (
                <NavItem key={item.path} {...item} currentPath={currentPath} steward />
              ))}
              {participant?.membership_class === 4 && INVESTOR_ITEMS.map(item => (
                <NavItem key={item.path} {...item} currentPath={currentPath} />
              ))}
            </div>
          )}

          {/* Sidebar footer */}
          <div style={s.sidebarFooter}>
            <div style={s.sidebarFooterText}>
              <span style={{ color: '#c87533', fontWeight: 700, fontSize: '0.7rem' }}>◈</span>
              {' '}RegenHub, LCA
            </div>
          </div>
        </nav>

        {/* Panel content */}
        <main style={s.panel}>
          {children}
        </main>
      </div>
    </div>
  )
}

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#070712',
    color: '#e0e0f0',
    fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)',
    overflow: 'hidden',
  },
  statusBar: {
    height: '36px',
    minHeight: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    background: '#0c0c1a',
    borderBottom: '1px solid #1a1a2e',
    flexShrink: 0,
    zIndex: 10,
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  wordmark: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#c87533',
    letterSpacing: '-0.01em',
    textTransform: 'uppercase',
  },
  statusSep: {
    color: '#2a2a40',
    fontSize: '0.75rem',
  },
  statusLabel: {
    fontSize: '0.72rem',
    color: '#52526a',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statusDate: {
    fontSize: '0.72rem',
    color: '#52526a',
    fontVariantNumeric: 'tabular-nums',
  },
  statusRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statusUser: {
    fontSize: '0.75rem',
    color: '#8888a8',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  stewardPip: {
    background: 'rgba(200,117,51,0.15)',
    color: '#c87533',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: '#52526a',
    fontSize: '0.72rem',
    cursor: 'pointer',
    padding: '0',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'color 0.12s',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '172px',
    minWidth: '172px',
    background: '#0a0a18',
    borderRight: '1px solid #1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 0.5rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '1rem',
    paddingBottom: '0.25rem',
    paddingLeft: '0.5rem',
  },
  sidebarFooterText: {
    fontSize: '0.68rem',
    color: '#2a2a40',
    letterSpacing: '0.02em',
  },
  panel: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: '#070712',
  },
}
