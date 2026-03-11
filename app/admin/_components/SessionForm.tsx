'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  cohortId: string
  session?: {
    id: string
    week_number: number
    title: string
    youtube_url: string | null
    notes: string | null
    published_at: string | null
  }
  onCancel: () => void
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1)
    return parsed.searchParams.get('v')
  } catch { return null }
}

export default function SessionForm({ cohortId, session, onCancel }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(session?.title ?? '')
  const [weekNumber, setWeekNumber] = useState(session?.week_number ?? 1)
  const [youtubeUrl, setYoutubeUrl] = useState(session?.youtube_url ?? '')
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [published, setPublished] = useState(!!session?.published_at)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewVideoId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validate YouTube URL if provided
    if (youtubeUrl && !extractYouTubeId(youtubeUrl)) {
      setError('Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...')
      setSaving(false)
      return
    }

    const payload = {
      cohort_id: cohortId,
      title,
      week_number: weekNumber,
      youtube_url: youtubeUrl || null,
      notes: notes || null,
      published_at: published ? (session?.published_at ?? new Date().toISOString()) : null,
    }

    let dbError
    if (session) {
      const result = await supabase.from('sessions').update(payload).eq('id', session.id)
      dbError = result.error
    } else {
      const result = await supabase.from('sessions').insert(payload)
      dbError = result.error
    }

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    router.refresh()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        {session ? 'Edit Session' : 'Add Session'}
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="week">Week #</label>
          <input
            id="week"
            type="number"
            min={1}
            max={20}
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value))}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduction to AI-Assisted Building"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="youtube">YouTube URL</label>
        <input
          id="youtube"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      {previewVideoId && (
        <div style={{ marginBottom: '1rem', aspectRatio: '16/9', background: 'var(--charcoal)' }}>
          <iframe
            src={`https://www.youtube.com/embed/${previewVideoId}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Preview"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="notes">Notes (shown below the video)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Key topics, links, timestamps..."
          style={{ minHeight: '100px' }}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          style={{ width: 'auto', cursor: 'pointer' }}
        />
        <label htmlFor="published" style={{ margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--graphite)', cursor: 'pointer' }}>
          Published (visible to enrolled students)
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : session ? 'Save Changes' : 'Add Session'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
