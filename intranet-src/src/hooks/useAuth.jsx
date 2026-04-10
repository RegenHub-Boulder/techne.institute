import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [participant, setParticipant] = useState(undefined) // undefined = loading, null = loaded but not linked

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
    setParticipant(undefined) // mark as loading during fetch
    // First: try direct auth_user_id link
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, first_name, last_name, display_name, email, participant_type, account_type, auth_user_id, onboarding_completed, role, bio, location, membership_class, craft_primary, craft_secondary, affiliation, skills, interests')
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
      .select('id, name, first_name, last_name, display_name, email, participant_type, account_type, auth_user_id, onboarding_completed, role, bio, location, membership_class, craft_primary, craft_secondary, affiliation, skills, interests')
      .eq('id', alias.participant_id)
      .maybeSingle()

    if (!e2 && p2) {
      setParticipant(p2)
    } else {
      setParticipant(null)
    }
  }

  async function updateProfile(fields) {
    if (!participant?.id) return { error: 'No participant' }
    // Derive display_name from first/last if not explicitly provided
    const updates = { ...fields }
    if ((updates.first_name !== undefined || updates.last_name !== undefined) && updates.display_name === undefined) {
      const first = updates.first_name ?? participant.first_name ?? ''
      const last  = updates.last_name  ?? participant.last_name  ?? ''
      updates.display_name = [first, last].filter(Boolean).join(' ') || participant.display_name
      updates.name = updates.display_name // keep legacy name column in sync
    }
    const { error } = await supabase.from('participants').update(updates).eq('id', participant.id)
    if (!error) setParticipant(p => p ? { ...p, ...updates } : p)
    return { error }
  }

  async function markOnboardingComplete() {
    if (!participant?.id) return
    const { error } = await supabase
      .from('participants')
      .update({ onboarding_completed: true })
      .eq('id', participant.id)
    if (!error) {
      setParticipant(p => p ? { ...p, onboarding_completed: true } : p)
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
    // loading = true during session fetch OR while participant is loading after session resolves
    loading: session === undefined || (session !== null && participant === undefined),
    signInWithEmail,
    signOut,
    updateProfile,
    markOnboardingComplete,
    isAuthenticated: !!session,
    isSteward: participant?.participant_type === 'steward',
    isMember: participant?.participant_type === 'member',
    needsOnboarding: !!participant && participant.onboarding_completed === false,
    // Preferred display name: display_name → full name → email prefix
    displayName: participant?.display_name || participant?.name || participant?.email?.split('@')[0] || '',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
