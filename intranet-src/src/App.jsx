import { useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login from './pages/Login'
import Home from './pages/Home'
import NotLinked from './pages/NotLinked'

function Router() {
  const { loading, isAuthenticated, participant, session } = useAuth()

  // Determine current path within /intranet/
  const path = window.location.pathname.replace(/^\/intranet\/?/, '') || ''

  // Loading state
  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
      </div>
    )
  }

  // Not authenticated → login
  if (!isAuthenticated) {
    return <Login />
  }

  // Authenticated but no participant record linked
  if (isAuthenticated && !participant) {
    return <NotLinked />
  }

  // Authenticated + linked participant → route to page
  // Future routes for /account/, /patronage/, /documents/, /admin/
  // are added by P368, P369, P370
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
