import { useAuth } from '../hooks/useAuth.jsx'

// Shown when a user has a valid auth session but no linked participant record
export default function NotLinked() {
  const { session, signOut } = useAuth()

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <div style={styles.wordmark}>Techne</div>
        <div style={styles.subtitle}>Member Intranet</div>

        <div style={styles.icon}>!</div>
        <h2 style={styles.title}>Account not linked</h2>
        <p style={styles.body}>
          You're signed in as <strong>{session?.user?.email}</strong>, but this
          email isn't linked to a cooperative member account.
        </p>
        <p style={styles.body}>
          This usually means your email address doesn't match what we have on
          file. Contact a steward to resolve this.
        </p>

        <a href="mailto:steward@techne.studio" style={styles.button}>
          Contact a steward
        </a>

        <button onClick={signOut} style={styles.signOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}

const styles = {
  outer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--color-void, #0a0a0f)',
  },
  card: {
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '12px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  wordmark: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-copper, #c87533)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(220, 150, 50, 0.15)',
    color: '#dc9632',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: '0 auto 1.25rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 600,
    margin: '0 0 1rem',
  },
  body: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.6,
    margin: '0 0 0.75rem',
  },
  button: {
    display: 'block',
    marginTop: '1.5rem',
    padding: '0.75rem 1rem',
    background: 'var(--color-copper, #c87533)',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  signOut: {
    display: 'block',
    marginTop: '1rem',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted, #666)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
    padding: '0.5rem',
  },
}
