import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [participant, setParticipant] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadParticipant(session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          loadParticipant(session.user.id)
        } else {
          setParticipant(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadParticipant(authUserId) {
    // First: try direct auth_user_id link
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, email, participant_type, account_type, auth_user_id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (!error && data) {
      setParticipant(data)
      return
    }

    // Fallback: look up by email alias (supports multiple emails per account)
    const { data: session } = await supabase.auth.getSession()
    const userEmail = session?.session?.user?.email
    if (!userEmail) { setParticipant(null); return }

    const { data: alias } = await supabase
      .from('participant_email_aliases')
      .select('participant_id')
      .eq('email', userEmail.toLowerCase())
      .maybeSingle()

    if (!alias) { setParticipant(null); return }

    const { data: p2, error: e2 } = await supabase
      .from('participants')
      .select('id, name, email, participant_type, account_type, auth_user_id')
      .eq('id', alias.participant_id)
      .maybeSingle()

    if (!e2 && p2) {
      setParticipant(p2)
    } else {
      setParticipant(null)
    }
  }

  async function signInWithEmail(email) {
    // Check allowlist before sending OTP — only authorized organizers may log in
    const { data: allowed, error: allowlistError } = await supabase
      .from('techne_allowed_organizers')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (allowlistError) {
      return { error: { message: 'Could not verify email authorization. Try again.' } }
    }
    if (!allowed) {
      return { error: { message: 'This email is not on the authorized organizer list. Contact a steward to request access.' } }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/intranet/`,
      },
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setParticipant(null)
    setSession(null)
  }

  const value = {
    session,
    participant,
    loading: session === undefined,
    signInWithEmail,
    signOut,
    isAuthenticated: !!session,
    isSteward: participant?.participant_type === 'steward',
    isMember: participant?.participant_type === 'member',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
