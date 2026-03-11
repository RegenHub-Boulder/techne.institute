'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  cohortId: string
  resource?: {
    id: string
    title: string
    url: string
    resource_type: string
  }
  onCancel: () => void
}

export default function ResourceForm({ cohortId, resource, onCancel }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(resource?.title ?? '')
  const [url, setUrl] = useState(resource?.url ?? '')
  const [resourceType, setResourceType] = useState(resource?.resource_type ?? 'link')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = { cohort_id: cohortId, title, url, resource_type: resourceType }

    let dbError
    if (resource) {
      const result = await supabase.from('resources').update(payload).eq('id', resource.id)
      dbError = result.error
    } else {
      const result = await supabase.from('resources').insert(payload)
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
        {resource ? 'Edit Resource' : 'Add Resource'}
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select id="type" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          <option value="tool">Tool</option>
          <option value="document">Document</option>
          <option value="link">Link</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="res-title">Title</label>
        <input
          id="res-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Claude Code"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="res-url">URL</label>
        <input
          id="res-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : resource ? 'Save Changes' : 'Add Resource'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
