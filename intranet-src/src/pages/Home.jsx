import { useAuth } from '../hooks/useAuth.jsx'

export default function Home() {
  const { participant, signOut, isSteward } = useAuth()

  const greeting = participant?.name
    ? `Welcome, ${participant.name.split(' ')[0]}.`
    : 'Welcome.'

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.wordmark}>Techne</div>
        <div style={styles.headerRight}>
          <span style={styles.participantType}>
            {participant?.participant_type || 'member'}
          </span>
          <button onClick={signOut} style={styles.signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <h1 style={styles.greeting}>{greeting}</h1>
        <p style={styles.subtitle}>
          {isSteward
            ? 'You have steward access.'
            : 'Member intranet — your cooperative account.'}
        </p>

        <div style={styles.nav}>
          <NavCard
            href="/intranet/account/"
            title="Capital Account"
            description="Your book balance, tax capital account, and YTD summary."
            available={false}
          />
          <NavCard
            href="/intranet/patronage/"
            title="Patronage History"
            description="Quarterly allocation events, component breakdown, CSV export."
            available={false}
          />
          <NavCard
            href="/intranet/documents/"
            title="Document Vault"
            description="Your K-1 tax documents and cooperative filings."
            available={false}
          />
          {isSteward && (
            <NavCard
              href="/intranet/admin/"
              title="Admin"
              description="Allocation entry, document upload, member management."
              available={false}
              stewardOnly
            />
          )}
        </div>

        <div style={styles.notice}>
          Portal is launching soon. Capital accounts and documents will appear
          here once the steward completes data backfill and review.
        </div>
      </div>
    </div>
  )
}

function NavCard({ title, description, href, available, stewardOnly }) {
  return (
    <a
      href={available ? href : undefined}
      style={{
        ...styles.card,
        opacity: available ? 1 : 0.5,
        cursor: available ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      {stewardOnly && <div style={styles.stewardBadge}>Steward</div>}
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{description}</div>
      {!available && <div style={styles.comingSoon}>Coming soon</div>}
    </a>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-void, #0a0a0f)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  wordmark: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-copper, #c87533)',
    letterSpacing: '-0.02em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  participantType: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #888)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  signOut: {
    background: 'none',
    border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  greeting: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '0 0 0.5rem',
    color: 'var(--color-text, #e8e8e8)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--color-text-muted, #888)',
    margin: '0 0 2.5rem',
  },
  nav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    display: 'block',
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '10px',
    padding: '1.5rem',
    position: 'relative',
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '1rem',
    color: 'var(--color-text, #e8e8e8)',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted, #888)',
    lineHeight: 1.5,
  },
  comingSoon: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #666)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  stewardBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    background: 'rgba(200, 117, 51, 0.15)',
    color: 'var(--color-copper, #c87533)',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  notice: {
    padding: '1rem 1.25rem',
    background: 'rgba(200, 117, 51, 0.07)',
    border: '1px solid rgba(200, 117, 51, 0.2)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.6,
  },
}
