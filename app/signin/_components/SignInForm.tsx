'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/cohort'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Sign In</h1>
        <p>Enter your email. We&apos;ll send a magic link — no password needed.</p>
      </div>

      {error === 'auth_failed' && (
        <div className="alert alert-error">
          Sign-in link expired or invalid. Please request a new one.
        </div>
      )}

      {submitted ? (
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</p>
          <p style={{ color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            Check your email.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--stone)', margin: 0 }}>
            We sent a sign-in link to <strong>{email}</strong>. Click it to access your cohort.
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              autoComplete="email"
            />
            {formError && <p className="form-error">{formError}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      )}

      <p className="auth-note">
        Not enrolled yet?{' '}
        <a href="/programs" style={{ color: 'var(--ember)' }}>
          View open cohorts →
        </a>
      </p>
    </div>
  )
}
