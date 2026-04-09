import { useAuth } from '../hooks/useAuth.jsx'

const FAQ_ITEMS = [
  {
    q: 'How do I sign in?',
    a: 'Enter your email address on the sign-in page. We\'ll send you a magic link — click it and you\'re in. No password needed. Links expire after 1 hour, but you can always request a new one.',
  },
  {
    q: 'What is a capital account?',
    a: 'Your capital account records your economic stake in the cooperative. It starts at zero and grows through patronage allocations — your share of the cooperative\'s surplus distributed quarterly. The Account page shows two balances: book balance (GAAP) and tax basis (IRC 704b / Subchapter K). They start the same and may diverge over time due to tax adjustments.',
  },
  {
    q: 'What is patronage? How is my allocation calculated?',
    a: 'Patronage is your share of the cooperative\'s quarterly surplus. Allocations follow the 40/30/20/10 formula: 40% based on labor contributed, 30% on revenue generated, 20% on capital contributed, and 10% on community participation. Your Patronage History page shows each allocation broken down by component.',
  },
  {
    q: 'When are allocations made?',
    a: 'Quarterly. The Management Accountant confirms figures, the steward enters them, and your balance updates. The Patronage History page shows all historical allocations. If you expect a quarterly allocation and don\'t see it yet, check back after the steward has confirmed the MA sign-off.',
  },
  {
    q: 'Where is my K-1?',
    a: 'K-1 documents are in the Documents section at /intranet/documents/. K-1s for the prior tax year are typically uploaded by March 15. If you don\'t see yours by March 20, contact steward@techne.studio.',
  },
  {
    q: 'What is a K-1? What do I do with it?',
    a: 'Schedule K-1 (Form 1065) reports your share of the cooperative\'s income, deductions, and credits for the tax year. Because Techne is taxed as a partnership under Subchapter K, you receive a K-1 instead of a W-2 or 1099. Give it to your tax preparer. If you prepare your own taxes, enter the values from the K-1 on your federal return. Partnership K-1 treatment can be complex — if you\'re unsure, consult a CPA familiar with partnership taxation.',
  },
  {
    q: 'My balance looks wrong. What do I do?',
    a: 'Contact steward@techne.studio with your name, the balance you see, and what you believe it should be. Include the relevant tax year or quarter. The steward will cross-reference the allocation_events records and the Management Accountant\'s figures. If there was a data entry error, it will be corrected and you\'ll be notified.',
  },
  {
    q: 'Can I transfer or withdraw my capital account balance?',
    a: 'Not directly. Capital accounts represent your equity stake in the cooperative, not a cash balance. Distributions (cash payments) are separate from allocations and are decided by the Board based on cooperative financial position. Check the Patronage History page for any recorded distributions. For questions about redemption or withdrawal rights, contact steward@techne.studio.',
  },
  {
    q: 'I\'m a Class 4 investor. Where is my portfolio view?',
    a: 'The Venture Basket is at /intranet/ventures/ — it shows your committed capital, current value, MOIC, and individual positions. It is only visible to Class 4 members. If you can\'t access it, contact a steward.',
  },
  {
    q: 'What is the Venture Basket?',
    a: 'The Venture Basket tracks Class 4 investor positions in cooperative ventures. It shows each venture\'s name, instrument (SAFE, equity, note, etc.), committed vs. deployed capital, current fair value, and status. MOIC (Multiple on Invested Capital) is shown when both committed and current value are available. Positions are updated by the steward periodically.',
  },
  {
    q: 'I need to update my email or name. How do I do that?',
    a: 'Contact steward@techne.studio. Email changes require manual update of both your participant record and your auth account. This process involves steward verification — it cannot be self-served through the portal.',
  },
  {
    q: 'Can I download my patronage history?',
    a: 'Yes — on the Patronage History page, click "Export CSV" to download all your allocation records. The CSV includes period, component breakdown, and running balance.',
  },
  {
    q: 'My magic link didn\'t arrive. What should I try?',
    a: 'Check your spam folder first. Magic links come from the Supabase email service — look for an email with "Sign in to" in the subject. If it\'s not there after 5 minutes, try again from the sign-in page. Links expire after 1 hour, so don\'t click a link from an older email. If the problem persists, contact steward@techne.studio.',
  },
  {
    q: 'Is this portal secure?',
    a: 'Yes. Sign-in uses magic links — no passwords to guess or steal. Sessions use PKCE OAuth flow with 7-day token expiry. All data is fetched through authenticated API calls that enforce row-level security — you can only see your own records. Documents are served via signed URLs that expire after 1 hour.',
  },
]

export default function FAQ() {
  const { isAuthenticated, signOut } = useAuth()
  const [open, setOpen] = useState(null)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <a href="/intranet/" style={styles.wordmark}>Techne</a>
        {isAuthenticated && (
          <nav style={styles.headerNav}>
            <a href="/intranet/account/" style={styles.navLink}>Account</a>
            <a href="/intranet/patronage/" style={styles.navLink}>Patronage</a>
            <a href="/intranet/documents/" style={styles.navLink}>Documents</a>
            <button onClick={signOut} style={styles.signOut}>Sign out</button>
          </nav>
        )}
      </div>

      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>FAQ</span>
        </nav>

        <h1 style={styles.h1}>Frequently Asked Questions</h1>
        <p style={styles.subtitle}>
          About the portal, your capital account, K-1s, and the cooperative.
          Not answered here? Email <a href="mailto:steward@techne.studio" style={styles.link}>steward@techne.studio</a>.
        </p>

        <div style={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div style={styles.faqItem}>
      <button style={styles.faqQ} onClick={onToggle}>
        <span>{q}</span>
        <span style={{ ...styles.arrow, transform: open ? 'rotate(90deg)' : 'none' }}>›</span>
      </button>
      {open && <div style={styles.faqA}>{a}</div>}
    </div>
  )
}

// useState import — component needs it
import { useState } from 'react'

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
  main: { maxWidth: '760px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  subtitle: { fontSize: '1rem', color: 'var(--color-text-muted, #888)', margin: '0 0 2rem', lineHeight: 1.6 },
  link: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  faqList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  faqItem: {
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px', overflow: 'hidden',
  },
  faqQ: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', background: 'none', border: 'none', color: '#e8e8e8',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', gap: '1rem',
  },
  arrow: { fontSize: '1.2rem', color: 'var(--ember, #c4956a)', flexShrink: 0, transition: 'transform 0.15s' },
  faqA: {
    padding: '0 1.25rem 1rem', fontSize: '0.9rem', color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.65, borderTop: '1px solid var(--color-border, #2a2a35)',
    paddingTop: '0.875rem',
  },
}
