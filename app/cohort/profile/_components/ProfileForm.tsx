'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [showInDirectory, setShowInDirectory] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, show_in_directory')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setShowInDirectory(profile.show_in_directory ?? true)
      }
      setLoading(false)
    }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signin'); return }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName || null, show_in_directory: showInDirectory })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>
  }

  return (
    <div className="page-container" style={{ maxWidth: '480px' }}>
      <div className="page-header">
        <p className="section-mark">Profile</p>
        <h1>Your Profile</h1>
      </div>

      {success && <div className="alert alert-success">Profile updated.</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you&apos;ll appear in the cohort directory"
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            id="showInDirectory"
            type="checkbox"
            checked={showInDirectory}
            onChange={(e) => setShowInDirectory(e.target.checked)}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          <label htmlFor="showInDirectory" style={{ margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--graphite)', cursor: 'pointer' }}>
            Show me in the cohort directory
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <a href="/cohort" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', textDecoration: 'none' }}>
            ← Back to Cohort
          </a>
        </div>
      </form>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--bone)' }}>
        <button onClick={handleSignOut} className="btn btn-secondary" style={{ fontSize: '0.65rem' }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
