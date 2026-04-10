import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

// Onboarding steps
const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Techne',
    icon: '🌿',
    body: [
      'You\'re entering the internal coordination space for RegenHub, LCA — a Colorado Limited Cooperative Association building regenerative infrastructure in Boulder.',
      'Techne is the studio brand. The intranet is where members track capital accounts, labor contributions, cooperative decisions, and shared resources.',
      'This brief orientation will help you find what you need.',
    ],
  },
  {
    id: 'cooperative',
    title: 'The Cooperative Structure',
    icon: '⬡',
    body: [
      'RegenHub operates as a worker cooperative. Membership is earned through contribution — labor, capital, and community participation all flow into your patronage account.',
      'Decisions are made through transparent governance. Proposals, ratification votes, and policy parameters are visible under the Cooperative section.',
      'The 40/30/20/10 patronage formula (labor / revenue / capital / community) is a proposed parameter — not yet ratified. You\'ll see it labeled as such throughout.',
    ],
  },
  {
    id: 'structure',
    title: 'Navigating the Intranet',
    icon: '◈',
    sections: [
      { label: 'Account', desc: 'Your capital account, patronage allocations, and labor hours. The primary record of your stake.' },
      { label: 'Cooperative', desc: 'Active projects, member directory, and governance proposals.' },
      { label: 'Finance', desc: 'Journals, ledger, treasury overview. The financial substrate.' },
      { label: 'Cloud', desc: 'Cloud credit balances (1 CLOUD ≈ $0.10) — the cooperative\'s unit of exchange for compute.' },
      { label: 'Reference', desc: 'Guides, documents, and onboarding materials for the cooperative.' },
    ],
  },
  {
    id: 'nextsteps',
    title: 'You\'re in',
    icon: '✦',
    body: [
      'Your profile and account are linked. You can update your bio, role, and contact information from the Profile page at any time.',
      'If something is missing or doesn\'t look right, reach out to a steward.',
      'You can re-run this orientation from your Profile page whenever you want a refresher.',
    ],
  },
]

export default function OnboardingWizard({ onComplete }) {
  const { markOnboardingComplete } = useAuth()
  const [step, setStep] = useState(0)
  const [completing, setCompleting] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  async function handleComplete() {
    setCompleting(true)
    await markOnboardingComplete()
    onComplete()
  }

  async function handleSkip() {
    await markOnboardingComplete()
    onComplete()
  }

  function handleNext() {
    if (isLast) {
      handleComplete()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.stepDots}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{ ...s.dot, ...(i === step ? s.dotActive : i < step ? s.dotDone : {}) }}
              />
            ))}
          </div>
          <button style={s.skipBtn} onClick={handleSkip}>
            Skip orientation
          </button>
        </div>

        {/* Content */}
        <div style={s.content}>
          <div style={s.icon}>{current.icon}</div>
          <h2 style={s.title}>{current.title}</h2>

          {current.body && (
            <div style={s.bodyWrap}>
              {current.body.map((para, i) => (
                <p key={i} style={s.para}>{para}</p>
              ))}
            </div>
          )}

          {current.sections && (
            <div style={s.sectionList}>
              {current.sections.map(sec => (
                <div key={sec.label} style={s.sectionItem}>
                  <span style={s.sectionLabel}>{sec.label}</span>
                  <span style={s.sectionDesc}>{sec.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          {step > 0 && (
            <button style={s.backBtn} onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            style={{ ...s.nextBtn, ...(completing ? s.nextBtnLoading : {}) }}
            onClick={handleNext}
            disabled={completing}
          >
            {completing ? 'Entering…' : isLast ? 'Enter the intranet' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 10, 15, 0.88)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(196, 149, 106, 0.18)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  stepDots: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    transition: 'all 0.2s',
  },
  dotActive: {
    width: '18px',
    borderRadius: '3px',
    background: 'var(--gold, #c4956a)',
  },
  dotDone: {
    background: 'rgba(196,149,106,0.4)',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dim, #666)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  content: {
    padding: '2rem 2rem 1.5rem',
    flex: 1,
  },
  icon: {
    fontSize: '2rem',
    lineHeight: 1,
    marginBottom: '0.75rem',
  },
  title: {
    margin: '0 0 1.25rem',
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text-primary, #e8e0d4)',
    letterSpacing: '-0.02em',
  },
  bodyWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  para: {
    margin: 0,
    fontSize: '0.875rem',
    lineHeight: 1.65,
    color: 'var(--text-secondary, #aaa)',
  },
  sectionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  sectionItem: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '0.75rem',
    alignItems: 'baseline',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--gold, #c4956a)',
    letterSpacing: '0.04em',
  },
  sectionDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary, #aaa)',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    gap: '0.75rem',
  },
  backBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)',
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  nextBtn: {
    background: 'var(--gold, #c4956a)',
    border: 'none',
    color: '#0a0a0f',
    fontSize: '0.85rem',
    fontWeight: 700,
    padding: '0.6rem 1.4rem',
    borderRadius: '6px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
  },
  nextBtnLoading: {
    opacity: 0.6,
    cursor: 'default',
  },
}
