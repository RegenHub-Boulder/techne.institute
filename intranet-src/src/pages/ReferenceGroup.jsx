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

// ─── Plan documents ───────────────────────────────────────────────────────────

const PLAN_DOCS = [
  {
    id: 'prd',
    title: 'Intranet Refinement PRD',
    subtitle: '18-month product roadmap · 1,847 lines',
    path: '/intranet/TECHNE_INTRANET_REFINEMENT_PRD.md',
  },
  {
    id: 'github-board',
    title: 'GitHub Project Board',
    subtitle: 'Sprint structure and project tracking',
    path: '/intranet/GITHUB_PROJECT_BOARD_STRUCTURE.md',
  },
]

// ─── Roadmap data ─────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  complete:      'Complete',
  'in-progress': 'In Progress',
  blocked:       'Blocked',
  pending:       'Pending',
}
const STATUS_COLOR = {
  complete:      { bg: 'rgba(52,199,89,0.12)',   text: '#34c759',          border: 'rgba(52,199,89,0.25)' },
  'in-progress': { bg: 'rgba(196,149,106,0.15)', text: 'var(--gold)',      border: 'rgba(196,149,106,0.35)' },
  blocked:       { bg: 'rgba(255,69,58,0.12)',   text: '#ff453a',          border: 'rgba(255,69,58,0.3)' },
  pending:       { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-subdim)', border: 'rgba(255,255,255,0.08)' },
}
const URGENCY_COLOR = {
  urgent: { bg: 'rgba(255,69,58,0.12)',   text: '#ff453a' },
  high:   { bg: 'rgba(196,149,106,0.15)', text: 'var(--gold)' },
  medium: { bg: 'rgba(100,130,200,0.15)', text: '#7aa2f7' },
}

const FLOOR_PHASES = [
  {
    id: 'p0', label: 'Phase 0', name: 'Foundation Decisions', status: 'complete',
    summary: 'All key design decisions recorded: which database, which vendors, how cooperative law encodes into the database, and how to resist censorship. The full specification exists as documents; no database code has run yet.',
    deliverables: [
      'Stack & vendor selection · CROPS posture documented',
      'Chokepoint analysis: 8 vendors, exit paths, Glide explicitly excluded',
      'REA ontology: agents · agreements · events · resources',
      'Stable bylaw addressing (bylaws:v1.3:art-1.sec-4)',
      'Unified audit event stream design',
      '15-role access model (11 cooperative + 4 Hub)',
      'Schema naming conventions — PRD Shape v0.1',
    ],
  },
  {
    id: 'p1', label: 'Phase 1', name: 'Raw Schema Deployment', status: 'blocked',
    summary: 'Database tables are designed and ready to install. Three setup steps from Todd unblock this. Once deployed, the cooperative has a live database — empty but wired — ready to receive member records.',
    deliverables: [
      'Supabase project wdrsmhwtdwdfyvlbugdq provisioned ✓',
      'Core tables: agents · agreements · agreement_sections · events · resources',
      'citext + pgvector extensions enabled',
      'audit schema + append-only immutability trigger',
      'Bootstrap seed: RegenHub · Nou · Dianoia',
      'Migration runner ready (cis/migrate.js)',
    ],
    blockers: [
      'Generate PAT from LCA Supabase account → app.supabase.com/account/tokens',
      'Enable connection pooler → Dashboard · Settings · Database · Connection Pooling',
      'Enable pgvector → Dashboard · Database · Extensions · search "vector"',
    ],
  },
  {
    id: 'p2', label: 'Phase 2', name: 'Bylaws Loader', status: 'pending',
    summary: 'The bylaws loaded as structured, searchable sections — each stamped with a stable address that survives amendments. Nou cannot cite the bylaws until this phase is complete.',
    deliverables: [
      'Bylaws v1.3 in markdown with frontmatter (address · ordinal · heading)',
      'Idempotent loader: parse → insert → diff → emit amendment events',
      'Vector embeddings per section (1,536-dimensional)',
      'superseded_by chain for amendment history',
      'All bylaws sections in agreement_sections table',
    ],
    blockers: [
      'Todd confirms: does bylaws v1.3 have lettered sub-subsections? (e.g. §5.3.2.a)',
      'Bylaws v1.3 source document in markdown format',
    ],
  },
  {
    id: 'p3', label: 'Phase 3', name: 'RLS Policy Layer', status: 'pending',
    summary: 'The database enforces who can see what — not just the application layer. Every rule cites the specific bylaw section that authorizes it. When bylaws are amended, affected policies surface for review automatically.',
    deliverables: [
      '15-role model as Postgres Row-Level Security policies',
      'Every policy cites its bylaw stable address in comments',
      'Scoped impersonation: Nou inherits user JWT, never elevates',
      'RLS on all primitive tables',
    ],
  },
  {
    id: 'p4', label: 'Phase 4', name: 'Nou Harness', status: 'pending',
    summary: "Nou's knowledge grounding — connecting AI responses to the actual bylaws, member agreements, and cooperative records. Three rules: impersonation by permission only; every legal claim cites a source; refusals follow a defined protocol.",
    deliverables: [
      'Three-section system prompt: standing · user context · retrieved context',
      'Citation contract: structured output with stable bylaw addresses',
      'Four refusal shapes: out-of-scope · insufficient-basis · privacy · impersonation-denied',
      'Grounding harness tests against bylaws retrieval',
    ],
  },
  {
    id: 'p5', label: 'Phase 5', name: 'Validation Gate', status: 'pending',
    summary: 'Before the system goes live: a walkaway rehearsal — can the cooperative rebuild from every vendor export? The board signs off on the chokepoint analysis as a prerequisite for this gate.',
    deliverables: [
      'Walkaway rehearsal: pg_dump → fresh Postgres → verify 10 event records',
      'CROPS audit: 8 vendors, postures confirmed',
      'Board approval: chokepoint analysis reviewed and signed',
      'Phase 5 gate check passed · document filed in CIS repo',
    ],
    blockers: [
      'Board review and sign-off on chokepoint analysis',
    ],
  },
]

const CIS_WAVES = [
  {
    id: 'w1', label: 'Wave 1', name: 'Agent & Agreement', status: 'pending',
    prereq: 'Floor Phases 1–3',
    summary: 'The member registry: who is in the cooperative, which agreements they have signed, and what roles they hold. Every other CIS module depends on this.',
    capabilities: [
      'Member onboarding: application → approval → role assignment',
      'Agreement signing and version history',
      'Member directory (access-controlled by role)',
      'Role lifecycle tracking with audit trail',
    ],
  },
  {
    id: 'w2', label: 'Wave 2', name: 'Capital Accounts', status: 'pending',
    prereq: 'Wave 1 · patronage formula defined',
    summary: "The patronage ledger: contributions, allocations, distributions. The LCA's Subchapter T compliance layer — the legal requirement for cooperative accounting. K-1s are generated from this data.",
    capabilities: [
      'Capital account module: contributions · allocations · distributions',
      'Patronage formula implementation (after board defines)',
      'K-1 generation for member tax reporting',
      'Mercury webhook → capital event pipeline',
      'Xero sync for accounting and tax reporting',
    ],
  },
  {
    id: 'w3', label: 'Wave 3', name: 'Governance & Events', status: 'pending',
    prereq: 'Wave 1',
    summary: 'Meeting records, voting, and the formal governance layer. Board and member decisions recorded as immutable events — the cooperative institutional memory.',
    capabilities: [
      'Meeting records: agenda · attendance · minutes',
      'Voting events with eligibility enforcement',
      'Resolution tracking and full audit trail',
      'Director and officer role lifecycle',
      'On-chain attestation scaffold (Base EVM, CROPS Stage 03)',
    ],
  },
  {
    id: 'w4', label: 'Wave 4', name: 'Hub Operations', status: 'pending',
    prereq: 'Wave 1 · application form host decided',
    summary: 'The physical space layer: Hub Member applications, coworking, attendance, and KPI tracking. Hub Operations Phase 1 has started — this wave operationalizes it in CIS.',
    capabilities: [
      'Hub Member application intake (Formbricks or managed form)',
      'Attendance and coworking event records',
      'KPI snapshot scheduling (Make.com)',
      'EE Liaison role and Enterprise Engagement module',
      'Monthly Hub Operations reports (Nou)',
    ],
  },
  {
    id: 'w5', label: 'Wave 5', name: 'Watershed', status: 'pending',
    prereq: 'Wave 3+ · bioregional coordination protocol',
    summary: "The ecological intelligence layer: connecting the cooperative's records to watershed rhythms and bioregional data networks. Foundation for Nou's environmental grounding.",
    capabilities: [
      'Ecological event stream integration',
      'Seasonal and watershed state grounding',
      'Bioregional coordination network participation',
      'On-chain grant compliance verification (CROPS Stage 03)',
    ],
  },
]

const OPEN_DECISIONS = [
  {
    id: 'd1', urgency: 'urgent', owner: 'Todd', blocks: 'Wave 4 intake flow',
    title: 'Application form host',
    context: 'Hub Operations Phase 1 started May 22. Member application intake needs a host before the first applicant arrives.',
    options: [
      'Formbricks self-hosted on Coolify — Stage 02 CROPS posture, no vendor dependency on form data',
      'Tally or Typeform managed SaaS — Stage 01, faster setup, applicant data visible to vendor',
    ],
    recommendation: 'Formbricks (recommendation from chokepoint analysis)',
  },
  {
    id: 'd2', urgency: 'urgent', owner: 'Todd', blocks: 'All substrate phases',
    title: 'Phase 1 database setup (3 steps)',
    context: 'The migration is written and tested. Three steps in the Supabase dashboard unblock Phase 1 deployment.',
    options: [
      'Step 1: Generate PAT at app.supabase.com/account/tokens (must be LCA account, not personal)',
      'Step 2: Enable connection pooler → Dashboard → Settings → Database → Connection Pooling',
      'Step 3: Enable pgvector → Dashboard → Database → Extensions → search "vector" → Enable',
    ],
  },
  {
    id: 'd3', urgency: 'medium', owner: 'Todd', blocks: 'Phase 2 bylaws loader',
    title: 'Bylaws v1.3 sub-subsection format',
    context: 'Does bylaws v1.3 contain lettered sub-subsections (e.g. §5.3.2.a)? Determines the addressing format before the loader is built.',
    options: [
      'No lettered sub-subsections → addressing stays at art-N.sec-M.sub-P (current scheme)',
      'Yes, lettered clauses exist → extend to art-N.sec-M.sub-P.clause-A',
    ],
  },
  {
    id: 'd4', urgency: 'medium', owner: 'Todd + Board', blocks: 'Wave 2 capital accounts',
    title: 'Patronage formula',
    context: 'Wave 2 capital accounts require a patronage allocation formula. The database schema is ready; the formula has not been defined yet.',
    options: [
      'Hours-based: patronage proportional to hours worked × rate',
      'Revenue-based: patronage proportional to revenue invoiced through cooperative',
      'Hybrid: board sets weights and factors each year',
    ],
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
      roadmap:   '/intranet/roadmap/',
    }
    window.history.pushState(null, '', paths[key] || '/intranet/guide/')
  }

  const tabs = [
    { key: 'guide',     label: 'Guide' },
    { key: 'documents', label: 'Documents' },
    { key: 'roadmap',   label: 'Roadmap' },
  ]

  return (
    <TabShell
      title="Reference"
      subtitle="Founding documents · member guide · K-1 vault · roadmap"
      tabs={tabs}
      active={tab}
      onTab={openTab}
    >
      {tab === 'guide'     && <GuideTab />}
      {tab === 'documents' && <DocumentsTab />}
      {tab === 'roadmap'   && <RoadmapTab />}
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

// ─── Roadmap Tab ──────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.pending
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.62rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '0.2em 0.65em', borderRadius: 4,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      flexShrink: 0,
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function RoadmapTab() {
  const [selected, setSelected] = useState(null)
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function loadDoc(doc) {
    setSelected(doc)
    setLoading(true)
    setError(null)
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

  function renderMd(md) {
    if (!md) return ''
    let text = md.replace(/<!--[\s\S]*?-->/g, '')
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>')
      .replace(/`([^`]+)`/g,         '<code style="font-family:monospace;background:rgba(255,255,255,0.06);padding:0.1em 0.35em;border-radius:3px;font-size:0.88em">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--gold)">$1</a>')
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^---+$/gm, '<hr>')
      .replace(/^> (.+)$/gm, '<blockquote style="margin:0.75rem 0;padding:0.5rem 0.5rem 0.5rem 1rem;border-left:2px solid rgba(255,255,255,0.12);color:var(--text-muted);font-size:0.88rem">$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
    html = html.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')
    html = `<p>${html}</p>`
      .replace(/<p><h/g, '<h').replace(/<\/h([1-4])><\/p>/g, '</h$1>')
      .replace(/<p><hr><\/p>/g, '<hr>')
      .replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>')
      .replace(/<p><blockquote/g, '<blockquote').replace(/<\/blockquote><\/p>/g, '</blockquote>')
    return html
  }

  const floorDone  = FLOOR_PHASES.filter(p => p.status === 'complete').length
  const floorTotal = FLOOR_PHASES.length
  const urgentCount = OPEN_DECISIONS.filter(d => d.urgency === 'urgent').length

  return (
    <div>

      {/* ── Context banner ── */}
      <div style={r.banner}>
        <div style={r.bannerBody}>
          <p style={r.bannerText}>
            The <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Common Information System</strong> is
            the cooperative's book of record: member registry, capital accounts,
            agreements, and governance events. It is built in layers — first the{' '}
            <em>floor</em> (substrate infrastructure), then five CIS modules on top.
            Phase 0 specification is complete. Phase 1 deployment is ready to run
            pending three setup steps.
          </p>
          <div style={r.bannerStats}>
            <div style={r.statPill}>
              <span style={r.statNum}>{floorDone}/{floorTotal}</span>
              <span style={r.statLabel}>Floor phases complete</span>
            </div>
            <div style={{ ...r.statPill, borderColor: 'rgba(255,69,58,0.25)', background: 'rgba(255,69,58,0.06)' }}>
              <span style={{ ...r.statNum, color: '#ff453a' }}>{urgentCount}</span>
              <span style={r.statLabel}>Urgent decisions open</span>
            </div>
            <div style={r.statPill}>
              <span style={r.statNum}>{CIS_WAVES.length}</span>
              <span style={r.statLabel}>CIS waves planned</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── The Floor: Substrate Phases ── */}
      <div style={r.section}>
        <div style={r.sectionHead}>
          <span style={r.sectionTag}>The Floor</span>
          <h2 style={r.sectionTitle}>Substrate Phases</h2>
          <p style={r.sectionDesc}>
            Six prerequisite phases. The floor is the database, cooperative law
            encoded as access policies, and Nou's citation harness. No CIS module
            can run before the floor is laid.
          </p>
        </div>
        <div style={r.phaseGrid}>
          {FLOOR_PHASES.map(phase => (
            <div key={phase.id} style={r.phaseCard}>
              <div style={r.phaseCardTop}>
                <div>
                  <div style={r.phaseLabel}>{phase.label}</div>
                  <div style={r.phaseName}>{phase.name}</div>
                </div>
                <StatusChip status={phase.status} />
              </div>
              <p style={r.phaseSummary}>{phase.summary}</p>
              {phase.deliverables && (
                <div style={r.itemGroup}>
                  <div style={r.itemGroupLabel}>Deliverables</div>
                  {phase.deliverables.map((d, i) => (
                    <div key={i} style={r.itemRow}>
                      <span style={r.itemDot}>·</span>
                      <span style={r.itemText}>{d}</span>
                    </div>
                  ))}
                </div>
              )}
              {phase.blockers && (
                <div style={{ ...r.itemGroup, ...r.blockerGroup }}>
                  <div style={{ ...r.itemGroupLabel, color: '#ff6b6b' }}>Blocked on</div>
                  {phase.blockers.map((b, i) => (
                    <div key={i} style={r.itemRow}>
                      <span style={{ ...r.itemDot, color: '#ff6b6b' }}>!</span>
                      <span style={{ ...r.itemText, color: 'var(--text-warm)' }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CIS Modules: Five Waves ── */}
      <div style={r.section}>
        <div style={r.sectionHead}>
          <span style={r.sectionTag}>CIS Modules</span>
          <h2 style={r.sectionTitle}>Five Waves</h2>
          <p style={r.sectionDesc}>
            Capability layers built on the floor. Waves begin once Floor Phases 1–3 are
            complete. Wave 1 is the prerequisite for all others.
          </p>
        </div>
        <div style={r.phaseGrid}>
          {CIS_WAVES.map(wave => (
            <div key={wave.id} style={r.phaseCard}>
              <div style={r.phaseCardTop}>
                <div>
                  <div style={r.phaseLabel}>{wave.label}</div>
                  <div style={r.phaseName}>{wave.name}</div>
                </div>
                <StatusChip status={wave.status} />
              </div>
              {wave.prereq && (
                <div style={r.prereqNote}>Prereq: {wave.prereq}</div>
              )}
              <p style={r.phaseSummary}>{wave.summary}</p>
              {wave.capabilities && (
                <div style={r.itemGroup}>
                  <div style={r.itemGroupLabel}>Capabilities</div>
                  {wave.capabilities.map((c, i) => (
                    <div key={i} style={r.itemRow}>
                      <span style={r.itemDot}>·</span>
                      <span style={r.itemText}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Open Decisions (Board Action) ── */}
      <div style={r.section}>
        <div style={r.sectionHead}>
          <span style={{ ...r.sectionTag, background: 'rgba(255,69,58,0.08)', color: '#ff6b6b', borderColor: 'rgba(255,69,58,0.2)' }}>Board Action</span>
          <h2 style={r.sectionTitle}>Open Decisions</h2>
          <p style={r.sectionDesc}>
            Phase 0 items that require input before work can proceed.
            Urgent items are blocking active phases today.
          </p>
        </div>
        <div style={r.decisionList}>
          {OPEN_DECISIONS.map(dec => {
            const uc = URGENCY_COLOR[dec.urgency] || URGENCY_COLOR.medium
            return (
              <div key={dec.id} style={r.decisionCard}>
                <div style={r.decisionTop}>
                  <h3 style={r.decisionTitle}>{dec.title}</h3>
                  <span style={{ ...r.urgencyChip, background: uc.bg, color: uc.text }}>
                    {dec.urgency}
                  </span>
                </div>
                <p style={r.decisionContext}>{dec.context}</p>
                <div style={r.decisionOptions}>
                  {dec.options.map((opt, i) => (
                    <div key={i} style={r.decisionOption}>
                      <span style={r.optionDot} />
                      <span style={r.optionText}>{opt}</span>
                    </div>
                  ))}
                </div>
                {dec.recommendation && (
                  <div style={r.recommendNote}>
                    Recommendation: {dec.recommendation}
                  </div>
                )}
                <div style={r.decisionFooter}>
                  <span style={r.decisionMeta}>Owner: {dec.owner}</span>
                  <span style={{ ...r.decisionMeta, color: 'var(--text-subdim)' }}>Blocks: {dec.blocks}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Reference Documents ── */}
      <div style={r.section}>
        <div style={r.sectionHead}>
          <span style={r.sectionTag}>Reference</span>
          <h2 style={r.sectionTitle}>Specification Documents</h2>
        </div>

        {/* Diagrams */}
        <div style={r.diagramGrid}>
          {[
            { src: '/intranet/diagrams/architecture-overview.svg', label: 'Architecture Overview' },
            { src: '/intranet/diagrams/roadmap-timeline.svg',      label: 'Roadmap Timeline' },
          ].map(({ src, label }) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" style={r.diagramCard}>
              <div style={r.diagramLabel}>{label} ↗</div>
              <img src={src} alt={label} style={r.diagramImg} />
            </a>
          ))}
        </div>

        {/* Document cards / reader */}
        {!selected && (
          <div style={r.docGrid}>
            {PLAN_DOCS.map(doc => (
              <button key={doc.id} onClick={() => loadDoc(doc)} style={r.docCard}>
                <div style={r.docCardTitle}>{doc.title}</div>
                <div style={r.docCardSub}>{doc.subtitle}</div>
                <div style={r.docCardCta}>Read →</div>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div>
            <div style={r.docHeader}>
              <div>
                <h2 style={r.docTitle}>{selected.title}</h2>
                <p style={r.docSubtitle}>{selected.subtitle}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setContent('') }}
                style={r.closeBtn}
              >← Back</button>
            </div>
            {loading && <div style={g.loading}>Loading…</div>}
            {error   && <div style={g.error}>{error}</div>}
            {!loading && !error && content && (
              <div style={g.mdBody} dangerouslySetInnerHTML={{ __html: renderMd(content) }} />
            )}
          </div>
        )}
      </div>

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

// ─── Roadmap tab styles ───────────────────────────────────────────────────────

const r = {
  // Context banner
  banner: {
    background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.12)',
    borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '2rem',
  },
  bannerBody: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  bannerText: { fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 },
  bannerStats: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  statPill: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
  },
  statNum: { fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)' },
  statLabel: { fontSize: '0.72rem', color: 'var(--text-ghost)' },

  // Section layout
  section: { marginBottom: '2.5rem' },
  sectionHead: { marginBottom: '1.25rem' },
  sectionTag: {
    display: 'inline-block', fontSize: '0.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '0.2em 0.65em', borderRadius: 4, marginBottom: '0.5rem',
    background: 'rgba(196,149,106,0.1)', color: 'var(--gold)',
    border: '1px solid rgba(196,149,106,0.2)',
  },
  sectionTitle: {
    fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.015em',
    margin: '0 0 0.4rem', color: 'var(--text-primary)',
  },
  sectionDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '600px' },

  // Phase / Wave cards
  phaseGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  phaseCard: {
    background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 10,
    padding: '1.1rem 1.25rem',
  },
  phaseCardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' },
  phaseLabel: { fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-ghost)', marginBottom: '0.15rem' },
  phaseName:  { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' },
  phaseSummary: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 0.75rem' },
  prereqNote: {
    fontSize: '0.72rem', color: 'var(--text-ghost)', marginBottom: '0.6rem',
    padding: '0.2rem 0.55rem', background: 'rgba(255,255,255,0.03)',
    borderRadius: 4, display: 'inline-block', border: '1px solid rgba(255,255,255,0.06)',
  },

  // Deliverables / capabilities list
  itemGroup: { marginTop: '0.15rem' },
  blockerGroup: {
    marginTop: '0.65rem', paddingTop: '0.65rem',
    borderTop: '1px solid rgba(255,69,58,0.12)',
  },
  itemGroupLabel: {
    fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--text-ghost)', marginBottom: '0.35rem',
  },
  itemRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.2rem', alignItems: 'flex-start' },
  itemDot: { fontSize: '0.85rem', color: 'var(--text-ghost)', flexShrink: 0, lineHeight: 1.55 },
  itemText: { fontSize: '0.78rem', color: 'var(--text-subdim)', lineHeight: 1.55 },

  // Open Decisions
  decisionList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  decisionCard: {
    background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 10,
    padding: '1.1rem 1.25rem',
  },
  decisionTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' },
  decisionTitle: { fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' },
  urgencyChip: {
    display: 'inline-block', fontSize: '0.6rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '0.2em 0.6em', borderRadius: 4, flexShrink: 0,
  },
  decisionContext: { fontSize: '0.81rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.75rem' },
  decisionOptions: { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.65rem' },
  decisionOption: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start' },
  optionDot: {
    width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
    flexShrink: 0, marginTop: '0.45rem',
  },
  optionText: { fontSize: '0.78rem', color: 'var(--text-subdim)', lineHeight: 1.55 },
  recommendNote: {
    fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(196,149,106,0.07)',
    border: '1px solid rgba(196,149,106,0.18)', borderRadius: 5,
    padding: '0.35rem 0.65rem', marginBottom: '0.65rem',
  },
  decisionFooter: { display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
  decisionMeta: { fontSize: '0.72rem', color: 'var(--text-ghost)' },

  // Reference / diagrams section
  diagramGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem', marginBottom: '1.25rem',
  },
  diagramCard: {
    display: 'block', background: 'var(--ink)', border: '1px solid #1a1a2e',
    borderRadius: 10, padding: '0.75rem', textDecoration: 'none',
    transition: 'border-color 0.15s',
  },
  diagramLabel: {
    fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em',
    color: 'var(--text-ghost)', marginBottom: '0.6rem',
  },
  diagramImg: { width: '100%', height: 'auto', borderRadius: 6, display: 'block' },
  docGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem', marginBottom: '1.5rem',
  },
  docCard: {
    background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 9,
    padding: '1rem 1.1rem', cursor: 'pointer', textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: '0.2rem',
    transition: 'border-color 0.15s',
  },
  docCardTitle: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' },
  docCardSub:   { fontSize: '0.75rem', color: 'var(--text-subdim)', lineHeight: 1.4 },
  docCardCta:   { marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gold)' },
  docHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  docTitle:   { fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.2rem' },
  docSubtitle:{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 },
  closeBtn: {
    background: 'none', border: '1px solid #1a1a2e', color: 'var(--text-muted)',
    borderRadius: 6, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem',
    flexShrink: 0,
  },
}
