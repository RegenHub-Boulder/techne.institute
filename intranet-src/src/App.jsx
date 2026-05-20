import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { HUDLayout } from './components/HUDLayout.jsx'
import OnboardingWizard from './components/OnboardingWizard.jsx'
import Login from './pages/Login'
import Home from './pages/Home'
import Cloud from './pages/Cloud'
import Admin from './pages/Admin'
import FAQ from './pages/FAQ'
import NotLinked from './pages/NotLinked'
import Ventures from './pages/Ventures'
import Profile from './pages/Profile'
import AccountGroup from './pages/AccountGroup'
import CooperativeGroup from './pages/CooperativeGroup'
import FinanceGroup from './pages/FinanceGroup'
import ReferenceGroup from './pages/ReferenceGroup'
import Ecosystem from './pages/Ecosystem'
import Messages from './pages/Messages'
import Enroll from './pages/Enroll'

// GitHub Pages SPA routing shim
// On 404, GH Pages redirects to 404.html which encodes the path as ?p=/path
// We read it here and push the correct route via history API
function resolveInitialPath() {
  const searchParams = new URLSearchParams(window.location.search)
  const redirectPath = searchParams.get('p')
  if (redirectPath) {
    const cleanURL = window.location.pathname + redirectPath
    window.history.replaceState(null, '', cleanURL)
  }
  return window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, '')
}

// localStorage key for suppressing repeat onboarding within a session
const ONBOARDING_DISMISSED_KEY = 'techne-onboarding-dismissed'

// Enrollment banner — shown on dashboard when enrollment is incomplete
function EnrollmentBanner({ participantId }) {
  const [dismissed, setDismissed] = useState(false)
  const [enrollmentState, setEnrollmentState] = useState(null)

  useEffect(() => {
    if (!participantId) return
    try {
      const raw = localStorage.getItem(`techne-enrollment-${participantId}`)
      if (raw) setEnrollmentState(JSON.parse(raw))
    } catch (_) {}
  }, [participantId])

  if (dismissed) return null
  // Don't show if enrollment is complete or not yet started (step 0, nothing touched)
  if (!enrollmentState) return null
  if (enrollmentState.enrollmentComplete) return null
  if (enrollmentState.step === 0 && !enrollmentState.profileSaved) return null

  const stepLabels = ['Identity', 'Bylaws — Read', 'Bylaws — Vote',
    'Agreement — Read', 'Agreement — Vote', 'Orientation', 'Complete']
  const stepLabel = stepLabels[enrollmentState.step] || 'in progress'

  return (
    <div style={bannerStyle.wrap}>
      <div style={bannerStyle.inner}>
        <span style={bannerStyle.pip}>enrollment</span>
        <span style={bannerStyle.text}>
          Enrollment in progress — paused at <strong style={{ color: 'var(--gold)' }}>{stepLabel}</strong>
        </span>
        <a
          href="/intranet/enroll/"
          onClick={e => {
            e.preventDefault()
            window.history.pushState(null, '', '/intranet/enroll/')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
          style={bannerStyle.resumeBtn}
        >
          Resume →
        </a>
        <button style={bannerStyle.dismissBtn} onClick={() => setDismissed(true)} aria-label="Dismiss">✕</button>
      </div>
    </div>
  )
}

const bannerStyle = {
  wrap: {
    width: '100%',
    background: 'rgba(196,149,106,0.06)',
    borderBottom: '1px solid rgba(196,149,106,0.18)',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0.55rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  pip: {
    fontSize: '0.58rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--gold)',
    background: 'rgba(196,149,106,0.12)',
    border: '1px solid rgba(196,149,106,0.25)',
    padding: '2px 6px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  text: {
    fontSize: '0.8rem',
    color: 'var(--text-nav)',
    flex: 1,
  },
  resumeBtn: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--gold)',
    textDecoration: 'none',
    background: 'rgba(196,149,106,0.1)',
    border: '1px solid rgba(196,149,106,0.25)',
    padding: '0.25rem 0.7rem',
    borderRadius: '4px',
    flexShrink: 0,
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    padding: '0 0.25rem',
    flexShrink: 0,
  },
}

function Router() {
  const { loading, isAuthenticated, participant, needsOnboarding } = useAuth()
  const [path, setPath] = useState(resolveInitialPath)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Listen for popstate (browser back/forward + pushState nav)
  useEffect(() => {
    const handler = () => {
      setPath(window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, ''))
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Once auth finishes loading and we have a participant, check if onboarding is needed.
  // Guard with localStorage so the wizard can't reappear after being dismissed,
  // even if the DB update hasn't propagated yet or a full page reload occurs.
  useEffect(() => {
    if (!loading && participant && !onboardingChecked) {
      setOnboardingChecked(true)
      const alreadyDismissed = (() => {
        try { return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === participant.id } catch (_) { return false }
      })()
      if (needsOnboarding && !alreadyDismissed) {
        setShowOnboarding(true)
      }
    }
  }, [loading, participant, needsOnboarding, onboardingChecked])

  // Loading spinner
  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
      </div>
    )
  }

  // FAQ is public — accessible without login
  if (path === 'faq') return <FAQ />

  // Not authenticated → login page
  if (!isAuthenticated) return <Login />

  // Authenticated but no participant record linked
  if (!participant) return <NotLinked />

  // Show onboarding wizard (first-login or re-run)
  if (showOnboarding) {
    const handleOnboardingDone = () => {
      // Stamp localStorage so the wizard won't reappear even on full reload
      try { localStorage.setItem(ONBOARDING_DISMISSED_KEY, participant.id) } catch (_) {}
      setShowOnboarding(false)
    }
    return <OnboardingWizard onComplete={handleOnboardingDone} />
  }

  // Resolve page component — grouped views
  let PageComponent
  // Account group: account, capital, labor, patronage
  if (['account', 'capital', 'labor', 'patronage'].includes(path)) {
    const tab = path === 'labor' ? 'labor' : path === 'patronage' ? 'patronage' : 'overview'
    PageComponent = <AccountGroup initialTab={tab} />
  }
  // Cooperative group: projects, directory, governance, bulletin
  else if (['projects', 'directory', 'governance', 'bulletin'].includes(path)) {
    const tab = path === 'directory' ? 'members' : path
    PageComponent = <CooperativeGroup initialTab={tab} />
  }
  // Finance group: journal, ledger, treasury, verify
  else if (['journal', 'ledger', 'treasury', 'verify'].includes(path)) {
    PageComponent = <FinanceGroup initialTab={path} />
  }
  // Reference group: guide, documents, roadmap
  else if (['guide', 'documents', 'roadmap'].includes(path)) {
    PageComponent = <ReferenceGroup initialTab={path} />
  }
  // Standalone pages
  else if (path === 'cloud')      PageComponent = <Cloud />
  else if (path === 'admin')      PageComponent = <Admin />
  else if (path === 'ventures')   PageComponent = <Ventures />
  else if (path === 'messages')   PageComponent = <Messages />
  else if (path === 'enroll')     PageComponent = <Enroll />
  else if (path === 'profile')    PageComponent = <Profile onRerunOnboarding={() => {
    try { localStorage.removeItem(ONBOARDING_DISMISSED_KEY) } catch (_) {}
    setShowOnboarding(true)
  }} />
  // Ecosystem is the primary landing — also handles 'ecosystem' path for direct links
  else                            PageComponent = <Ecosystem />

  // Wrap all authenticated pages in HUD shell
  // Show enrollment resume banner on all pages except enroll itself
  const showBanner = path !== 'enroll'
  return (
    <HUDLayout banner={showBanner ? <EnrollmentBanner participantId={participant?.id} /> : null}>
      {PageComponent}
    </HUDLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

const loadingStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--app-bg)',
}

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid rgba(200, 117, 51, 0.2)',
  borderTopColor: 'var(--gold)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
