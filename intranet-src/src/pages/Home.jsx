import { useAuth } from '../hooks/useAuth.jsx'

export default function Home() {
  const { participant, signOut, isSteward } = useAuth()

  const greeting = participant?.name
    ? `Welcome, ${participant.name.split(' ')[0]}.`
    : 'Welcome.'

  const membershipLabel = {
    1: 'Class 1 — Labor',
    2: 'Class 2 — Patron',
    3: 'Class 3 — Community',
    4: 'Class 4 — Investor',
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.wordmark}>Techne</div>
        <div style={styles.headerRight}>
          {participant?.membership_class && (
            <span style={styles.memberClass}>
              {membershipLabel[participant.membership_class]}
            </span>
          )}
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
        <p style={styles.subtitle}>Your cooperative account.</p>

        <div style={styles.nav}>
          <NavCard
            href="/intranet/account/"
            title="Capital Account"
            description="Your book balance, tax capital account (IRC 704b), last allocation date, and YTD summary."
            available={true}
          />
          <NavCard
            href="/intranet/patronage/"
            title="Patronage History"
            description="Quarterly allocation events by component (40/30/20/10), with CSV export."
            available={true}
          />
          <NavCard
            href="/intranet/labor/"
            title="Labor Contributions"
            description="Log hours, track FMV totals by category, and view your contribution history."
            available={true}
          />
          <NavCard
            href="/intranet/projects/"
            title="Projects & Ventures"
            description="Active cooperative projects, ventures, contributors, and milestones."
            available={true}
          />
          <NavCard
            href="/intranet/directory/"
            title="Member Directory"
            description="Organizer roster — names, roles, crafts, and membership class."
            available={true}
          />
          <NavCard
            href="/intranet/documents/"
            title="K-1 Documents"
            description="Your tax documents and cooperative filings."
            available={true}
          />
          <NavCard
            href="/intranet/guide/"
            title="Member Guide"
            description="Bylaws, member agreement, purpose statement, and articles of organization."
            available={true}
          />
          {isSteward && (
            <NavCard
              href="/intranet/treasury/"
              title="Treasury"
              description="Bank accounts, balances, and transaction history."
              available={true}
              stewardOnly
            />
          )}
          {isSteward && (
            <NavCard
              href="/intranet/admin/"
              title="Admin"
              description="Allocation entry, document upload, member management."
              available={true}
              stewardOnly
            />
          )}
          {participant?.membership_class === 4 && (
            <NavCard
              href="/intranet/ventures/"
              title="Venture Basket"
              description="Your Class 4 investor portfolio — basket composition, status, and returns."
              available={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function NavCard({ title, description, href, available, stewardOnly }) {
  const tag = available ? 'a' : 'div'
  const props = available ? { href } : {}

  return (
    <a
      href={available ? href : undefined}
      onClick={available ? undefined : (e) => e.preventDefault()}
      style={{
        ...styles.card,
        opacity: available ? 1 : 0.5,
        cursor: available ? 'pointer' : 'default',
        textDecoration: 'none',
        display: 'block',
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
  memberClass: {
    fontSize: '0.75rem',
    color: 'var(--color-copper, #c87533)',
    background: 'rgba(200,117,51,0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
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
  },
  card: {
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
}
