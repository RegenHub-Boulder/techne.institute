import { useState, useEffect } from 'react'

const DOCS = [
  {
    id: 'bylaws',
    title: 'Bylaws',
    subtitle: 'RegenHub, LCA Operating Agreement',
    path: '/app/regenhub-proposed.md',
  },
  {
    id: 'member-agreement',
    title: 'Member Agreement',
    subtitle: 'Membership terms and obligations',
    path: '/app/ma-regenhub-proposed.md',
  },
  {
    id: 'purpose',
    title: 'Purpose Statement',
    subtitle: 'Public benefit and cooperative purpose',
    path: '/app/purpose-statement.md',
  },
  {
    id: 'articles',
    title: 'Articles of Organization',
    subtitle: 'Colorado LCA formation document',
    path: '/app/articles-of-organization.md',
  },
]

export default function Guide() {
  const [selected, setSelected] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  async function loadDoc(doc) {
    setSelected(doc)
    setLoading(true)
    setError(null)
    setSearch('')
    try {
      const res = await fetch(doc.path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const text = await res.text()
      setContent(text)
    } catch (e) {
      setError(`Could not load document: ${e.message}`)
      setContent('')
    }
    setLoading(false)
  }

  // Simple markdown → HTML (headings, bold, lists, paragraphs)
  function renderMarkdown(md) {
    if (!md) return ''

    let html = md
      // Escape HTML
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headers
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Horizontal rules
      .replace(/^---+$/gm, '<hr>')
      // Paragraphs (blank line separation)
      .replace(/\n\n/g, '</p><p>')

    // Wrap li groups
    html = html.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')

    return `<p>${html}</p>`
      .replace(/<p><h/g, '<h')
      .replace(/<\/h([1-4])><\/p>/g, '</h$1>')
      .replace(/<p><hr><\/p>/g, '<hr>')
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><\/p>/g, '</ul>')
  }

  // Extract headings for ToC
  function getHeadings(md) {
    const headings = []
    const lines = md.split('\n')
    for (const line of lines) {
      const m = line.match(/^(#{1,3}) (.+)$/)
      if (m) {
        headings.push({
          level: m[1].length,
          text: m[2],
          id: m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })
      }
    }
    return headings.slice(0, 20) // cap at 20
  }

  const highlightSearch = (html) => {
    if (!search.trim()) return html
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return html.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:rgba(196,149,106,0.3);color:inherit">$1</mark>')
  }

  const renderedHtml = selected && content ? highlightSearch(renderMarkdown(content)) : ''
  const headings = selected && content ? getHeadings(content) : []

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Member Guide</div>
          <nav style={styles.docNav}>
            {DOCS.map((doc) => (
              <button
                key={doc.id}
                style={{
                  ...styles.docBtn,
                  ...(selected?.id === doc.id ? styles.docBtnActive : {}),
                }}
                onClick={() => loadDoc(doc)}
              >
                <div style={styles.docBtnTitle}>{doc.title}</div>
                <div style={styles.docBtnSub}>{doc.subtitle}</div>
              </button>
            ))}
          </nav>

          {headings.length > 0 && (
            <div style={styles.tocSection}>
              <div style={styles.tocLabel}>On this page</div>
              {headings.map((h, i) => (
                <a
                  key={i}
                  href={`#${h.id}`}
                  style={{
                    ...styles.tocLink,
                    paddingLeft: `${(h.level - 1) * 0.75 + 0.5}rem`,
                    fontSize: h.level === 1 ? '0.8rem' : '0.75rem',
                  }}
                >
                  {h.text}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={styles.content}>
          {!selected && (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>§</div>
              <h2 style={styles.placeholderTitle}>Member Guide</h2>
              <p style={styles.placeholderText}>
                Select a document from the sidebar to read the cooperative's founding documents,
                member agreement, and operating procedures.
              </p>
              <div style={styles.docGrid}>
                {DOCS.map((doc) => (
                  <button key={doc.id} style={styles.docCard} onClick={() => loadDoc(doc)}>
                    <div style={styles.docCardTitle}>{doc.title}</div>
                    <div style={styles.docCardSub}>{doc.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected && (
            <>
              <div style={styles.docHeader}>
                <div>
                  <h1 style={styles.docTitle}>{selected.title}</h1>
                  <p style={styles.docSubtitle}>{selected.subtitle}</p>
                </div>
                <input
                  type="search"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {loading && <div style={styles.loading}>Loading document…</div>}
              {error && <div style={styles.error}>{error}</div>}
              {!loading && !error && (
                <div
                  style={styles.mdBody}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  layout: { display: 'flex', minHeight: 'calc(100vh - 60px)' },
  sidebar: {
    width: '240px', flexShrink: 0, borderRight: '1px solid #2a2a35',
    padding: '1.5rem 1rem', overflowY: 'auto',
  },
  sidebarTitle: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '1rem', paddingLeft: '0.5rem' },
  docNav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' },
  docBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '0.6rem 0.75rem', borderRadius: '6px', textAlign: 'left',
    width: '100%', transition: 'background 0.1s',
  },
  docBtnActive: { background: 'rgba(196,149,106,0.12)' },
  docBtnTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e0', marginBottom: '0.1rem' },
  docBtnSub: { fontSize: '0.72rem', color: '#888' },
  tocSection: { borderTop: '1px solid #2a2a35', paddingTop: '1rem' },
  tocLabel: { fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', marginBottom: '0.5rem', paddingLeft: '0.5rem' },
  tocLink: { display: 'block', color: '#888', textDecoration: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', lineHeight: 1.4 },
  content: { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto', maxWidth: '720px' },
  placeholder: { paddingTop: '2rem' },
  placeholderIcon: { fontSize: '2.5rem', color: 'rgba(196,149,106,0.4)', marginBottom: '1rem' },
  placeholderTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' },
  placeholderText: { color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '480px' },
  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' },
  docCard: {
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '10px', padding: '1.25rem', cursor: 'pointer',
    textAlign: 'left', transition: 'border-color 0.15s',
  },
  docCardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#e8e8e0', marginBottom: '0.25rem' },
  docCardSub: { fontSize: '0.78rem', color: '#888', lineHeight: 1.4 },
  docHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  docTitle: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  docSubtitle: { color: '#888', fontSize: '0.875rem', margin: 0 },
  searchInput: {
    padding: '0.5rem 0.75rem', background: '#141418', border: '1px solid #2a2a35',
    color: '#e8e8e0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', width: '180px',
  },
  loading: { color: '#888', fontSize: '0.875rem' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#c46a6a', fontSize: '0.875rem' },
  mdBody: {
    fontSize: '0.9rem', lineHeight: 1.8, color: '#ccc',
  },
}
