'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ExistingProject {
  id: string
  title: string
  url: string | null
  description: string | null
}

interface Props {
  cohortId: string
  userId: string
  existingProject: ExistingProject | null
}

export default function ProjectSubmitForm({ cohortId, userId, existingProject }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(existingProject?.title ?? '')
  const [url, setUrl] = useState(existingProject?.url ?? '')
  const [description, setDescription] = useState(existingProject?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(!existingProject)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: dbError } = await supabase.from('projects').upsert(
      {
        cohort_id: cohortId,
        user_id: userId,
        title,
        url: url || null,
        description: description || null,
      },
      { onConflict: 'cohort_id,user_id' }
    )

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    router.refresh()
    setOpen(false)
  }

  async function handleDelete() {
    if (!existingProject) return
    if (!confirm('Remove your build from the showcase?')) return
    setDeleting(true)
    await supabase.from('projects').delete().eq('id', existingProject.id)
    router.refresh()
  }

  if (!open) {
    return (
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={() => setOpen(true)}
          className="btn btn-secondary"
          style={{ fontSize: '0.7rem' }}
        >
          {existingProject ? 'Edit Your Build' : '+ Share Your Build'}
        </button>
        {existingProject && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--stone)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {deleting ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        {existingProject ? 'Update Your Build' : 'Share Your Build'}
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="proj-title">What did you build?</label>
        <input
          id="proj-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AI-powered recipe app, Claude-integrated Notion clone..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="proj-url">Link (optional)</label>
        <input
          id="proj-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="proj-description">One or two sentences about it (optional)</label>
        <textarea
          id="proj-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What it does, what you learned, what you'd do differently..."
          style={{ minHeight: '80px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : existingProject ? 'Update Build' : 'Share Build'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
