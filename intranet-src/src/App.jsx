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
  // Cooperative group: projects, directory, governance
  else if (['projects', 'directory', 'governance'].includes(path)) {
    const tab = path === 'directory' ? 'members' : path
    PageComponent = <CooperativeGroup initialTab={tab} />
  }
  // Finance group: journal, ledger, treasury, verify
  else if (['journal', 'ledger', 'treasury', 'verify'].includes(path)) {
    PageComponent = <FinanceGroup initialTab={path} />
  }
  // Reference group: guide, documents
  else if (['guide', 'documents'].includes(path)) {
    PageComponent = <ReferenceGroup initialTab={path} />
  }
  // Standalone pages
  else if (path === 'ecosystem')  PageComponent = <Ecosystem />
  else if (path === 'cloud')      PageComponent = <Cloud />
  else if (path === 'admin')      PageComponent = <Admin />
  else if (path === 'ventures')   PageComponent = <Ventures />
  else if (path === 'profile')    PageComponent = <Profile onRerunOnboarding={() => {
    try { localStorage.removeItem(ONBOARDING_DISMISSED_KEY) } catch (_) {}
    setShowOnboarding(true)
  }} />
  else                            PageComponent = <Home />

  // Wrap all authenticated pages in HUD shell
  return <HUDLayout>{PageComponent}</HUDLayout>
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
  background: 'var(--color-void, #0a0a0f)',
}

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid rgba(200, 117, 51, 0.2)',
  borderTopColor: 'var(--ember, #c4956a)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
