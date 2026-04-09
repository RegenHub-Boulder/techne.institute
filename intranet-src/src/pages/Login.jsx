import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <div style={styles.wordmark}>Techne</div>
        <div style={styles.subtitle}>Member Intranet</div>

        {sent ? (
          <div style={styles.sent}>
            <div style={styles.sentIcon}>✓</div>
            <p style={styles.sentTitle}>Check your email</p>
            <p style={styles.sentBody}>
              We sent a login link to <strong>{email}</strong>. Click it to
              sign in. The link expires in 1 hour.
            </p>
            <p style={styles.sentHint}>
              No email? Check your spam folder, or{' '}
              <button style={styles.linkBtn} onClick={() => setSent(false)}>
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.instructions}>
              Enter your cooperative email address and we'll send you a secure
              login link — no password needed.
            </p>

            <label style={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              style={styles.input}
              disabled={loading}
            />

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send login link'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          Need access?{' '}
          <a href="mailto:steward@techne.studio" style={styles.footerLink}>
            Contact a steward
          </a>
        </div>
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
  },
  wordmark: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--ember, #c4956a)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  instructions: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.5,
    margin: '0 0 0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text, #e8e8e8)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--color-void, #0a0a0f)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '8px',
    color: 'var(--color-text, #e8e8e8)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.75rem 1rem',
    background: 'var(--ember, #c4956a)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  error: {
    padding: '0.75rem',
    background: 'rgba(220, 60, 60, 0.1)',
    border: '1px solid rgba(220, 60, 60, 0.3)',
    borderRadius: '6px',
    color: '#c46a6a',
    fontSize: '0.875rem',
  },
  sent: {
    textAlign: 'center',
    padding: '1rem 0',
  },
  sentIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(80, 180, 120, 0.15)',
    color: '#50b478',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 1rem',
  },
  sentTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem',
  },
  sentBody: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.6,
  },
  sentHint: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted, #888)',
    marginTop: '1rem',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--ember, #c4956a)',
    cursor: 'pointer',
    fontSize: 'inherit',
    padding: 0,
    textDecoration: 'underline',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid var(--color-border, #2a2a35)',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted, #888)',
    textAlign: 'center',
  },
  footerLink: {
    color: 'var(--ember, #c4956a)',
    textDecoration: 'none',
  },
}
