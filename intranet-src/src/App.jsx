import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login from './pages/Login'
import Home from './pages/Home'
import Account from './pages/Account'
import Patronage from './pages/Patronage'
import Documents from './pages/Documents'
import Ventures from './pages/Ventures'
import Admin from './pages/Admin'
import FAQ from './pages/FAQ'
import NotLinked from './pages/NotLinked'
import Directory from './pages/Directory'
import Treasury from './pages/Treasury'
import Projects from './pages/Projects'
import Labor from './pages/Labor'
import Guide from './pages/Guide'

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

function Router() {
  const { loading, isAuthenticated, participant } = useAuth()
  const [path, setPath] = useState(resolveInitialPath)

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handler = () => {
      setPath(window.location.pathname.replace(/^\/intranet\/?/, '').replace(/\/$/, ''))
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

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

  // Route to page
  if (path === 'account') return <Account />
  if (path === 'capital') return <Account />
  if (path === 'patronage') return <Patronage />
  if (path === 'documents') return <Documents />
  if (path === 'ventures') return <Ventures />
  if (path === 'admin') return <Admin />
  if (path === 'directory') return <Directory />
  if (path === 'treasury') return <Treasury />
  if (path === 'projects') return <Projects />
  if (path === 'labor') return <Labor />
  if (path === 'guide') return <Guide />

  // Default: home
  return <Home />
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
  borderTopColor: 'var(--color-copper, #c87533)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
