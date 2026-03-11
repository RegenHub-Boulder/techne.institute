import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Essays and notes from Techne Institute.',
}

export default function WritingPage() {
  return (
    <div className="writing-container">
      <div className="page-header">
        <p className="section-mark">Writing</p>
        <h1>Essays &amp; Notes</h1>
      </div>

      <p className="writing-tagline">
        Thinking in public about technology, capability, and what it means to build well.
      </p>

      <div className="empty-state">
        <p>Essays coming soon.</p>
        <p style={{ marginTop: '0.5rem' }}>
          <Link href="/" style={{ color: 'var(--ember)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  )
}
