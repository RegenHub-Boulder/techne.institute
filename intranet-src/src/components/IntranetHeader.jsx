import { useAuth } from '../hooks/useAuth.jsx'

export function IntranetHeader() {
  const { signOut, isSteward } = useAuth()
  const path = window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, '')

  const navLinks = [
    { href: '/intranet/account/', label: 'Account', match: 'account' },
    { href: '/intranet/patronage/', label: 'Patronage', match: 'patronage' },
    { href: '/intranet/directory/', label: 'Directory', match: 'directory' },
    { href: '/intranet/treasury/', label: 'Treasury', match: 'treasury', steward: true },
    { href: '/intranet/projects/', label: 'Projects', match: 'projects' },
    { href: '/intranet/labor/', label: 'Labor', match: 'labor' },
    { href: '/intranet/documents/', label: 'Documents', match: 'documents' },
    { href: '/intranet/guide/', label: 'Guide', match: 'guide' },
    { href: '/intranet/cloud/', label: 'Cloud', match: 'cloud' },
    { href: '/intranet/journal/', label: 'Journal', match: 'journal' },
    { href: '/intranet/ledger/', label: 'Ledger', match: 'ledger' },
    { href: '/intranet/governance/', label: 'Governance', match: 'governance' },
    { href: '/intranet/verify/', label: 'Verify', match: 'verify' },
  ]

  const visible = navLinks.filter((l) => !l.steward || isSteward)

  return (
    <div style={styles.header}>
      <a href="/intranet/" style={styles.wordmark}>Techne</a>
      <nav style={styles.nav}>
        {visible.map((l) => (
          <a
            key={l.match}
            href={l.href}
            style={{
              ...styles.navLink,
              ...(path === l.match ? styles.navLinkActive : {}),
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <button onClick={signOut} style={styles.signOut}>Sign out</button>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    padding: '0.85rem 2rem', borderBottom: '1px solid #2a2a35',
    background: '#141418', flexWrap: 'wrap',
  },
  wordmark: {
    fontSize: '1rem', fontWeight: 700, color: 'var(--ember, #c2512a)',
    textDecoration: 'none', letterSpacing: '-0.02em', flexShrink: 0,
  },
  nav: { display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, flexWrap: 'wrap' },
  navLink: {
    fontSize: '0.8rem', color: '#888', textDecoration: 'none',
    padding: '0.3rem 0.6rem', borderRadius: '5px',
  },
  navLinkActive: { color: '#e8e8e0', background: 'rgba(255,255,255,0.06)' },
  signOut: {
    background: 'none', border: '1px solid #2a2a35',
    color: '#888', borderRadius: '6px', padding: '0.3rem 0.65rem',
    fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0,
  },
}
