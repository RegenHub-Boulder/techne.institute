// ReferenceGroup.jsx
// Tabs: Guide | Documents

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { TabShell } from '../components/TabShell.jsx'

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => window.innerWidth < bp)
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [bp])
  return m
}

// ─── Document definitions (same as Guide.jsx) ─────────────────────────────────

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

// ─── Root component ───────────────────────────────────────────────────────────

export default function ReferenceGroup({ initialTab = 'guide' }) {
  const [tab, setTab] = useState(initialTab)

  const openTab = (key) => {
    setTab(key)
    const paths = {
      guide:     '/intranet/guide/',
      documents: '/intranet/documents/',
    }
    window.history.pushState(null, '', paths[key] || '/intranet/guide/')
  }

  const tabs = [
    { key: 'guide',     label: 'Guide' },
    { key: 'documents', label: 'Documents' },
  ]

  return (
    <TabShell
      title="Reference"
      subtitle="Founding documents · member guide · K-1 vault"
      tabs={tabs}
      active={tab}
      onTab={openTab}
    >
      {tab === 'guide'     && <GuideTab />}
      {tab === 'documents' && <DocumentsTab />}
    </TabShell>
  )
}

// ─── Guide Tab ────────────────────────────────────────────────────────────────
// Full doc-browser layout: left sidebar (doc selection + ToC) + right content pane

function GuideTab() {
  const isMobile = useIsMobile()
  const [selected, setSelected] = useState(null)
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function loadDoc(doc) {
    setSelected(doc)
    setLoading(true)
    setError(null)
    setSearch('')
    setSidebarOpen(false) // collapse selector on mobile after picking a doc
    try {
      const res = await fetch(doc.path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setContent(await res.text())
    } catch (e) {
      setError(`Could not load document: ${e.message}`)
      setContent('')
    }
    setLoading(false)
  }

  // Markdown → HTML
  // Handles: HTML comments (strip), %%GOLD%%/%%HIGHLIGHT%% blockquotes, plain blockquotes,
  // headings, bold/italic, links [text](url), lists, hr, paragraphs.
  function renderMarkdown(md) {
    if (!md) return ''

    // 1. Strip HTML comments (<!-- PROPOSED: ... -->, <!-- DECIDE: ... -->, etc.)
    let text = md.replace(/<!--[\s\S]*?-->/g, '')

    // 2. Capture blockquote groups before > gets HTML-escaped.
    //    U+E000 (private-use) used as a safe delimiter — won't appear in markdown content.
    const BQ = '\uE000'
    const bqStore = []
    text = text.replace(/(?:^>[ \t]?[^\n]*(?:\n|$))+/gm, match => {
      const lines = match.replace(/\n$/, '').split('\n').map(l => l.replace(/^>[ \t]?/, ''))
      const first = lines[0] || ''
      let type = 'plain', contentLines = lines
      if (first.startsWith('%%GOLD%%')) {
        type = 'gold'
        contentLines = [first.replace(/^%%GOLD%%\s*/, ''), ...lines.slice(1)]
      } else if (first.startsWith('%%HIGHLIGHT%%')) {
        type = 'highlight'
        contentLines = [first.replace(/^%%HIGHLIGHT%%\s*/, ''), ...lines.slice(1)]
      }
      const i = bqStore.length
      bqStore.push({ type, content: contentLines.join('\n') })
      return `${BQ}${i}${BQ}\n`
    })

    // 3. HTML escape + block/inline transforms
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--gold)">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^---+$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')

    html = html.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')

    html = `<p>${html}</p>`
      .replace(/<p><h/g, '<h').replace(/<\/h([1-4])><\/p>/g, '</h$1>')
      .replace(/<p><hr><\/p>/g, '<hr>')
      .replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>')

    if (!bqStore.length) return html

    // 4. Inline markdown for blockquote content (re-runs bold/italic/links on inner text)
    function inlineMd(raw) {
      return raw
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">$1</a>')
        .replace(/\n/g, '<br>')
    }

    // Unwrap placeholders from <p> tags, then render each blockquote
    html = html.replace(new RegExp('<p>\\s*' + BQ + '(\\d+)' + BQ + '\\s*</p>', 'g'), BQ + '$1' + BQ)

    return html.replace(new RegExp(BQ + '(\\d+)' + BQ, 'g'), (_, i) => {
      const { type, content } = bqStore[+i]
      const inner = inlineMd(content)
      if (type === 'gold') {
        return `<div style="margin:1.5rem 0;padding:1.1rem 1.4rem;background:rgba(196,149,106,0.08);border-left:3px solid var(--gold);border-radius:0 6px 6px 0;font-size:0.95rem;color:var(--text-warm);line-height:1.75">${inner}</div>`
      }
      if (type === 'highlight') {
        return `<div style="margin:0.85rem 0;padding:0.85rem 1.1rem;background:rgba(255,255,255,0.04);border-left:2px solid rgba(255,255,255,0.15);border-radius:0 4px 4px 0;font-size:0.9rem;color:var(--text-soft);line-height:1.65">${inner}</div>`
      }
      return `<blockquote style="margin:1rem 0;padding:0.6rem 0.6rem 0.6rem 1rem;border-left:2px solid rgba(255,255,255,0.12);color:var(--text-muted);font-size:0.9rem;line-height:1.6">${inner}</blockquote>`
    })
  }

  function getHeadings(md) {
    const lines = md.split('\n')
    return lines
      .filter(l => /^#{1,3} /.test(l))
      .slice(0, 20)
      .map(l => {
        const m = l.match(/^(#{1,3}) (.+)$/)
        return m ? {
          level: m[1].length,
          text:  m[2],
          id:    m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        } : null
      })
      .filter(Boolean)
  }

  function highlight(html) {
    if (!search.trim()) return html
    const esc = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return html.replace(
      new RegExp(`(${esc})`, 'gi'),
      '<mark style="background:rgba(196,149,106,0.3);color:inherit">$1</mark>'
    )
  }

  const rendered  = selected && content ? highlight(renderMarkdown(content)) : ''
  const headings  = selected && content ? getHeadings(content) : []

  const showSidebar = !isMobile || sidebarOpen

  return (
    // Negative margin cancels TabShell's content padding so the inner layout runs edge-to-edge
    <div style={isMobile
      ? { margin: '-1.75rem -2rem', display: 'flex', flexDirection: 'column', minHeight: 0 }
      : { margin: '-1.75rem -2rem', display: 'flex', height: 'calc(100vh - 36px - 48px - 2.5rem)', overflow: 'hidden' }
    }>
      {/* Mobile: doc selector toggle */}
      {isMobile && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'var(--gold-15)', border: '1px solid rgba(196,149,106,0.3)', color: 'var(--gold)', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '0.35rem 0.75rem', fontFamily: 'inherit' }}
          >
            {selected ? selected.title : 'Select Document'} {sidebarOpen ? '▲' : '▼'}
          </button>
          {selected && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-nav)' }}>{selected.subtitle}</span>
          )}
        </div>
      )}
      {/* Left sidebar: doc selection + ToC */}
      {showSidebar && <div style={isMobile ? { ...g.sidebar, width: '100%', borderRight: 'none', borderBottom: '1px solid #1a1a2e', maxHeight: '240px' } : g.sidebar}>
        <div style={g.sidebarTitle}>Documents</div>
        <nav style={g.docNav}>
          {DOCS.map(doc => (
            <button
              key={doc.id}
              style={{ ...g.docBtn, ...(selected?.id === doc.id ? g.docBtnActive : {}) }}
              onClick={() => loadDoc(doc)}
            >
              <div style={g.docBtnTitle}>{doc.title}</div>
              <div style={g.docBtnSub}>{doc.subtitle}</div>
            </button>
          ))}
        </nav>

        {headings.length > 0 && (
          <div style={g.tocSection}>
            <div style={g.tocLabel}>On this page</div>
            {headings.map((h, i) => (
              <a
                key={i}
                href={`#${h.id}`}
                style={{
                  ...g.tocLink,
                  paddingLeft: `${(h.level - 1) * 0.65 + 0.5}rem`,
                  fontSize: h.level === 1 ? '0.78rem' : '0.72rem',
                }}
              >
                {h.text}
              </a>
            ))}
          </div>
        )}
      </div>}

      {/* Right: document content — hidden on mobile when sidebar is open */}
      {(!isMobile || !sidebarOpen) && <div style={isMobile ? { ...g.contentPane, overflowY: 'auto' } : g.contentPane}>
        {!selected && (
          <div style={g.placeholder}>
            <div style={g.placeholderIcon}>§</div>
            <h2 style={g.placeholderTitle}>Member Guide</h2>
            <p style={g.placeholderText}>
              Select a document from the sidebar to read the cooperative's founding documents,
              member agreement, and operating procedures.
            </p>
            <div style={g.docGrid}>
              {DOCS.map(doc => (
                <button key={doc.id} style={g.docCard} onClick={() => loadDoc(doc)}>
                  <div style={g.docCardTitle}>{doc.title}</div>
                  <div style={g.docCardSub}>{doc.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <>
            <div style={g.docHeader}>
              <div>
                <h1 style={g.docTitle}>{selected.title}</h1>
                <p style={g.docSubtitle}>{selected.subtitle}</p>
              </div>
              <input
                type="search"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={g.searchInput}
              />
            </div>
            {loading && <div style={g.loading}>Loading document…</div>}
            {error   && <div style={g.error}>{error}</div>}
            {!loading && !error && (
              <div
                style={g.mdBody}
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            )}
          </>
        )}
      </div>}
    </div>
  )
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const { participant } = useAuth()
  const [docs, setDocs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Document vault not yet populated — show empty state
    setLoading(false)
  }, [])

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Your K-1 tax documents and cooperative filings.
      </p>

      {loading && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading documents…</div>}

      {!loading && docs.length === 0 && (
        <div style={d.emptyCard}>
          <div style={d.emptyTitle}>No documents yet</div>
          <p style={d.emptyBody}>
            Your K-1 documents will appear here once they've been uploaded by the steward.
            K-1s are typically uploaded in February or March for the prior tax year.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Need a document immediately?{' '}
            <a href="mailto:steward@techne.studio" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              Contact a steward
            </a>
            .
          </p>
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {docs.map(doc => <DocRow key={doc.id} doc={doc} />)}
        </div>
      )}

      <div style={d.infoBox}>
        <div style={d.infoTitle}>About K-1 documents</div>
        <p style={d.infoText}>
          Schedule K-1 (Form 1065) reports your share of the cooperative's income,
          deductions, and credits for the tax year. You'll need it to complete your
          federal tax return. K-1s are issued by March 15 following the tax year.
        </p>
        <p style={{ ...d.infoText, margin: 0 }}>
          Questions?{' '}
          <a href="mailto:steward@techne.studio" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Contact a steward
          </a>{' '}
          or consult your tax advisor.
        </p>
      </div>
    </div>
  )
}

function DocRow({ doc }) {
  const label  = { k1: 'K-1', bylaws: 'Bylaws', formation: 'Formation', other: 'Other' }
  const yearStr = doc.tax_year ? ` — Tax Year ${doc.tax_year}` : ''
  const size    = doc.file_size_bytes ? ` · ${(doc.file_size_bytes / 1024).toFixed(0)} KB` : ''
  const uploadedDate = new Date(doc.uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <div style={d.docRow}>
      <div style={d.docIcon}>PDF</div>
      <div style={{ flex: 1 }}>
        <div style={d.docName}>{label[doc.document_type] || 'Document'}{yearStr}</div>
        <div style={d.docMeta}>{doc.filename}{size} · Uploaded {uploadedDate}</div>
      </div>
      {doc.download_url ? (
        <a href={doc.download_url} download style={d.downloadBtn}>Download</a>
      ) : (
        <div style={d.downloadPending}>Contact steward</div>
      )}
    </div>
  )
}

// ─── Guide tab styles ─────────────────────────────────────────────────────────

const g = {
  sidebar: {
    width: '220px', flexShrink: 0, borderRight: '1px solid #1a1a2e',
    padding: '1.5rem 1rem', overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-ghost)', marginBottom: '0.75rem', paddingLeft: '0.5rem',
  },
  docNav: { display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.5rem' },
  docBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '0.55rem 0.65rem', borderRadius: 6, textAlign: 'left',
    width: '100%', transition: 'background 0.1s',
  },
  docBtnActive: { background: 'rgba(196,149,106,0.1)' },
  docBtnTitle:  { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' },
  docBtnSub:    { fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.3 },
  tocSection:   { borderTop: '1px solid #1a1a2e', paddingTop: '1rem' },
  tocLabel:     { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-ghost)', marginBottom: '0.4rem', paddingLeft: '0.5rem' },
  tocLink:      { display: 'block', color: 'var(--text-subdim)', textDecoration: 'none', padding: '0.18rem 0.5rem', borderRadius: 4, lineHeight: 1.4, fontSize: '0.72rem' },
  contentPane:  { flex: 1, padding: '1.75rem 2rem 2.5rem', overflowY: 'auto' },
  placeholder:  { paddingTop: '1rem' },
  placeholderIcon: { fontSize: '2.5rem', color: 'rgba(196,149,106,0.4)', marginBottom: '1rem' },
  placeholderTitle:{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' },
  placeholderText: { color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '480px' },
  docGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' },
  docCard:  { background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 9, padding: '1rem', cursor: 'pointer', textAlign: 'left' },
  docCardTitle: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' },
  docCardSub:   { fontSize: '0.75rem', color: 'var(--text-subdim)', lineHeight: 1.4 },
  docHeader:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  docTitle:     { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.2rem' },
  docSubtitle:  { color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 },
  searchInput:  {
    padding: '0.45rem 0.7rem', background: 'var(--ink)', border: '1px solid #1a1a2e',
    color: 'var(--text-primary)', borderRadius: 6, fontSize: '0.8rem', outline: 'none', width: '160px',
  },
  loading: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  error:   { padding: '0.75rem 1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 8, color: 'var(--status-err)', fontSize: '0.875rem' },
  mdBody:  { fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-ccc)' },
}

// ─── Documents tab styles ─────────────────────────────────────────────────────

const d = {
  emptyCard: {
    padding: '1.75rem', background: 'var(--ink)', border: '1px solid #1a1a2e',
    borderRadius: 10, marginBottom: '1.5rem',
  },
  emptyTitle: { fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--text-primary)' },
  emptyBody:  { fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.5rem' },
  docRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.9rem', background: 'var(--ink)',
    border: '1px solid #1a1a2e', borderRadius: 8,
  },
  docIcon: {
    width: 38, height: 38, borderRadius: 6,
    background: 'var(--gold-12)', color: 'var(--gold)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0,
  },
  docName:   { fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' },
  docMeta:   { fontSize: '0.78rem', color: 'var(--text-muted)' },
  downloadBtn: {
    padding: '0.4rem 0.85rem', background: 'var(--gold)',
    color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600,
    flexShrink: 0,
  },
  downloadPending: {
    padding: '0.4rem 0.85rem', border: '1px solid #1a1a2e',
    color: 'var(--text-subdim)', borderRadius: 6, fontSize: '0.78rem', flexShrink: 0,
  },
  infoBox: {
    marginTop: '1.75rem', padding: '1.25rem',
    background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.12)',
    borderRadius: 8,
  },
  infoTitle: { fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--text-primary)', display: 'block' },
  infoText:  { fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.5rem' },
}
