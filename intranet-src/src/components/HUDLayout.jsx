import { useState, useEffect } from 'react'
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
  sun:       'M8 1v2M8 13v2M1 8H3m10 0h2M3.2 3.2l1.4 1.4m7 7l1.4 1.4M3.2 12.8l1.4-1.4m7-7l1.4-1.4M8 5a3 3 0 1 0 0 6A3 3 0 0 0 8 5z',
  moon:      'M6 2a6 6 0 1 0 8 8 4.5 4.5 0 0 1-8-8z',
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
  ecosystem: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 5v3l2 1.5M3 8h1M12 8h1M8 3v1M8 12v1',
  menu:      'M1 3h14M1 8h14M1 13h14',
  close:     'M2 2l12 12M14 2L2 14',
}

const NAV_ITEMS = [
  { path: '',            label: 'Ecosystem',  icon: 'ecosystem'  },
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

function navigate(path) {
  const href = `/intranet/${path ? path + '/' : ''}`
  window.history.pushState(null, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function NavItem({ path, label, icon, currentPath, steward, onClick }) {
  const active = currentPath === path
  const href = `/intranet/${path ? path + '/' : ''}`
  return (
    <a
      href={href}
      onClick={e => { e.preventDefault(); navigate(path); onClick && onClick() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '0.8rem',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-nav)',
        background: active ? 'var(--gold-12)' : 'transparent',
        borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
        transition: 'all 0.12s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-mid)'
          e.currentTarget.style.background = 'var(--hover-light)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-nav)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <span style={{ color: active ? 'var(--gold)' : 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <Icon d={ICONS[icon]} size={14} />
      </span>
      <span>{label}</span>
      {steward && (
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.6rem',
          color: 'var(--gold)',
          background: 'var(--gold-12)',
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

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

function getStoredTheme() {
  try {
    const s = localStorage.getItem('techne-theme')
    if (s === 'light' || s === 'dark') return s
  } catch (_) {}
  return document.documentElement.getAttribute('data-theme') || 'dark'
}

export function HUDLayout({ children }) {
  const { participant, displayName, signOut, isSteward } = useAuth()
  const isMobile = useIsMobile(768)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme)
  const currentPath = window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, '')

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('techne-theme', next) } catch (_) {}
    setTheme(next)
  }

  // Close sidebar when navigating on mobile
  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false)
  }

  // Close sidebar on outside click (mobile overlay)
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    const handler = (e) => {
      const sidebar = document.getElementById('hud-sidebar')
      if (sidebar && !sidebar.contains(e.target)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile, sidebarOpen])

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const sidebarVisible = !isMobile || sidebarOpen

  // Current page label for mobile status bar
  const allNavItems = [...NAV_ITEMS, ...STEWARD_ITEMS, ...INVESTOR_ITEMS]
  const currentNavLabel = allNavItems.find(item => item.path === currentPath)?.label || 'Dashboard'

  return (
    <div style={s.root}>
      {/* Status bar */}
      <div style={{ ...s.statusBar, ...(isMobile ? s.statusBarMobile : {}) }}>
        <div style={s.statusLeft}>
          {/* Hamburger toggle on mobile — 44×44px tap target, gold accent */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={sidebarOpen}
              style={{ ...s.hamburger, ...(sidebarOpen ? s.hamburgerOpen : {}) }}
            >
              <Icon d={sidebarOpen ? ICONS.close : ICONS.menu} size={18} />
              <span style={s.hamburgerLabel}>{sidebarOpen ? 'Close' : 'Nav'}</span>
            </button>
          )}
          <span style={s.wordmark}>Techne</span>
          {isMobile ? (
            <>
              <span style={s.statusSep}>·</span>
              <span style={{ ...s.statusLabel, color: 'var(--text-mid)' }}>{currentNavLabel}</span>
            </>
          ) : (
            <>
              <span style={s.statusSep}>·</span>
              <span style={s.statusLabel}>Intranet</span>
              <span style={s.statusSep}>·</span>
              <span style={s.statusDate}>{today}</span>
            </>
          )}
        </div>
        <div style={s.statusRight}>
          {displayName && (
            <a
              href="/intranet/profile/"
              onClick={e => { e.preventDefault(); navigate('profile') }}
              style={s.statusUser}
              title="My Profile"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-nav)'}
            >
              {displayName}
              {isSteward && <span style={s.stewardPip}>steward</span>}
            </a>
          )}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={s.themeBtn}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-nav)'}
          >
            <Icon d={theme === 'dark' ? ICONS.sun : ICONS.moon} size={14} />
          </button>
          <button
            onClick={signOut}
            style={s.signOutBtn}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-nav)'}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Body: sidebar + panel */}
      <div style={s.body}>
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            style={s.backdrop}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        {sidebarVisible && (
          <nav
            id="hud-sidebar"
            style={{
              ...s.sidebar,
              ...(isMobile ? s.sidebarMobile : {}),
            }}
          >
            <div style={s.navSection}>
              {NAV_ITEMS.map(item => (
                <NavItem
                  key={item.path}
                  {...item}
                  currentPath={currentPath}
                  onClick={handleNavClick}
                />
              ))}
            </div>

            {(isSteward || (participant?.membership_class === 4)) && (
              <div style={{ ...s.navSection, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-nav)' }}>
                {isSteward && STEWARD_ITEMS.map(item => (
                  <NavItem
                    key={item.path}
                    {...item}
                    currentPath={currentPath}
                    steward
                    onClick={handleNavClick}
                  />
                ))}
                {participant?.membership_class === 4 && INVESTOR_ITEMS.map(item => (
                  <NavItem
                    key={item.path}
                    {...item}
                    currentPath={currentPath}
                    onClick={handleNavClick}
                  />
                ))}
              </div>
            )}

            {/* Sidebar footer */}
            <div style={s.sidebarFooter}>
              <div style={s.sidebarFooterText}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.7rem' }}>◈</span>
                {' '}RegenHub, LCA
              </div>
            </div>
          </nav>
        )}

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
    background: 'var(--app-bg)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
    overflow: 'hidden',
  },
  statusBar: {
    height: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    background: 'var(--hud-bar)',
    borderBottom: '1px solid var(--hud-border)',
    flexShrink: 0,
    zIndex: 20,
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  statusBarMobile: {
    height: '48px',
    minHeight: '48px',
  },
  hamburger: {
    background: 'var(--gold-12)',
    border: '1px solid rgba(196,149,106,0.3)',
    color: 'var(--gold)',
    cursor: 'pointer',
    padding: '0 10px',
    height: '36px',
    minWidth: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    borderRadius: '6px',
    transition: 'background 0.12s, color 0.12s',
    marginRight: '0.5rem',
    flexShrink: 0,
  },
  hamburgerOpen: {
    background: 'rgba(196,149,106,0.2)',
    border: '1px solid rgba(196,149,106,0.5)',
  },
  hamburgerLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--hud-mono)',
  },
  wordmark: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--gold)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: 'var(--hud-mono)',
  },
  statusSep: {
    color: 'var(--border-hud2)',
    fontSize: '0.75rem',
    fontFamily: 'var(--hud-mono)',
  },
  statusLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-nav)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--hud-mono)',
  },
  statusDate: {
    fontSize: '0.72rem',
    color: 'var(--text-nav)',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--hud-mono)',
  },
  statusRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statusUser: {
    fontSize: '0.72rem',
    color: 'var(--text-nav)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.12s',
    fontFamily: 'var(--hud-mono)',
  },
  stewardPip: {
    background: 'var(--gold-15)',
    color: 'var(--gold)',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  themeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-nav)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'color 0.12s',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-nav)',
    fontSize: '0.72rem',
    cursor: 'pointer',
    padding: '0',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'color 0.12s',
    fontFamily: 'var(--hud-mono)',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 15,
    top: '48px',
  },
  sidebar: {
    width: '172px',
    minWidth: '172px',
    background: 'var(--hud-surface)',
    borderRight: '1px solid var(--hud-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 0.5rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
  },
  sidebarMobile: {
    position: 'fixed',
    top: '48px',
    left: 0,
    bottom: 0,
    zIndex: 16,
    width: '200px',
    minWidth: '200px',
    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    borderRight: '1px solid var(--hud-border-deep)',
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
    color: 'var(--text-ghost)',
    letterSpacing: '0.02em',
    fontFamily: 'var(--hud-mono)',
  },
  panel: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'var(--app-bg)',
  },
}
