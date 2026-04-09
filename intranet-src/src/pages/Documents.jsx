import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Documents() {
  const { participant } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Document vault not yet populated — show empty state
    setLoading(false)
  }, [])

  const docTypeLabel = { k1: 'K-1', bylaws: 'Bylaws', formation: 'Formation', other: 'Other' }

  // Group by type
  const k1docs = docs.filter((d) => d.document_type === 'k1').sort((a, b) => (b.tax_year || 0) - (a.tax_year || 0))
  const otherDocs = docs.filter((d) => d.document_type !== 'k1')

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Documents</span>
        </nav>

        <h1 style={styles.h1}>Document Vault</h1>
        <p style={styles.subtitle}>Your K-1 tax documents and cooperative filings.</p>

        {loading && <div style={styles.loading}>Loading documents…</div>}
        {!loading && error && <div style={styles.error}>Error: {error}</div>}

        {!loading && !error && docs.length === 0 && (
          <div style={styles.emptyNotice}>
            <div style={styles.emptyTitle}>No documents yet</div>
            <p style={styles.emptyBody}>
              Your K-1 documents will appear here once they've been uploaded by
              the steward. K-1s are typically uploaded in February or March for
              the prior tax year.
            </p>
            <p style={styles.emptyContact}>
              Need a document immediately?{' '}
              <a href="mailto:steward@techne.studio" style={styles.link}>
                Contact a steward
              </a>
              .
            </p>
          </div>
        )}

        {!loading && !error && docs.length > 0 && (
          <>
            {k1docs.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.h2}>K-1 Tax Documents</h2>
                <div style={styles.docList}>
                  {k1docs.map((doc) => (
                    <DocRow key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            )}

            {otherDocs.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.h2}>Other Documents</h2>
                <div style={styles.docList}>
                  {otherDocs.map((doc) => (
                    <DocRow key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={styles.infoBox}>
          <strong style={styles.infoTitle}>About K-1 documents</strong>
          <p style={styles.infoText}>
            Schedule K-1 (Form 1065) reports your share of the cooperative's
            income, deductions, and credits for the tax year. You'll need it to
            complete your federal tax return. K-1s are issued by March 15
            following the tax year.
          </p>
          <p style={styles.infoText}>
            Questions about your K-1?{' '}
            <a href="mailto:steward@techne.studio" style={styles.link}>
              Contact a steward
            </a>{' '}
            or consult your tax advisor.
          </p>
        </div>
      </div>
    </div>
  )
}

function DocRow({ doc }) {
  const label = { k1: 'K-1', bylaws: 'Bylaws', formation: 'Formation', other: 'Other' }
  const yearStr = doc.tax_year ? ` — Tax Year ${doc.tax_year}` : ''
  const size = doc.file_size_bytes
    ? ` · ${(doc.file_size_bytes / 1024).toFixed(0)} KB`
    : ''
  const uploadedDate = new Date(doc.uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div style={styles.docRow}>
      <div style={styles.docIcon}>PDF</div>
      <div style={styles.docInfo}>
        <div style={styles.docName}>
          {label[doc.document_type] || 'Document'}{yearStr}
        </div>
        <div style={styles.docMeta}>
          {doc.filename}{size} · Uploaded {uploadedDate}
        </div>
      </div>
      {doc.download_url ? (
        <a href={doc.download_url} download style={styles.downloadBtn}>
          Download
        </a>
      ) : (
        <div style={styles.downloadPending}>
          Contact steward
        </div>
      )}
    </div>
  )
}



const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  wordmark: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  headerNav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { fontSize: '0.875rem', color: 'var(--color-text-muted, #888)', textDecoration: 'none' },
  signOut: {
    background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px',
    padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
  },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  subtitle: { fontSize: '1rem', color: 'var(--color-text-muted, #888)', margin: '0 0 2rem' },
  loading: { color: 'var(--color-text-muted, #888)', padding: '2rem 0' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#c46a6a' },
  emptyNotice: {
    padding: '2rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '10px', marginBottom: '2rem',
  },
  emptyTitle: { fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' },
  emptyBody: { fontSize: '0.9rem', color: 'var(--color-text-muted, #aaa)', lineHeight: 1.6, margin: '0 0 0.5rem' },
  emptyContact: { fontSize: '0.875rem', color: 'var(--color-text-muted, #888)', margin: 0 },
  link: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  section: { marginBottom: '2rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' },
  docList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  docRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px',
  },
  docIcon: {
    width: '40px', height: '40px', borderRadius: '6px',
    background: 'rgba(196,149,106,0.15)', color: 'var(--ember, #c4956a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0,
  },
  docInfo: { flex: 1 },
  docName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  docMeta: { fontSize: '0.8rem', color: 'var(--color-text-muted, #888)' },
  downloadBtn: {
    padding: '0.4rem 0.9rem', background: 'var(--ember, #c4956a)',
    color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
  },
  downloadPending: {
    padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px', fontSize: '0.8rem',
  },
  infoBox: {
    marginTop: '2.5rem', padding: '1.25rem',
    background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.15)',
    borderRadius: '8px',
  },
  infoTitle: { display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' },
  infoText: { fontSize: '0.875rem', color: 'var(--color-text-muted, #aaa)', lineHeight: 1.6, margin: '0 0 0.5rem' },
}
