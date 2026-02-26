import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '8rem auto',
        padding: '0 2rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--stone)',
          marginBottom: '1.5rem',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: '2.5rem',
          color: 'var(--charcoal)',
          marginBottom: '1rem',
        }}
      >
        Page Not Found
      </h1>
      <p style={{ color: 'var(--graphite)', marginBottom: '2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn btn-secondary">
        Return Home
      </Link>
    </div>
  )
}
