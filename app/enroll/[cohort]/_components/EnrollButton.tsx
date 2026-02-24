'use client'

import { useState } from 'react'

interface Props {
  cohortSlug: string
  cohortName: string
}

export default function EnrollButton({ cohortSlug, cohortName }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnroll() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortSlug }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      <button
        onClick={handleEnroll}
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', fontSize: '0.8rem' }}
      >
        {loading ? 'Redirecting to checkout...' : `Enroll in ${cohortName}`}
      </button>
    </>
  )
}
