import { useState, useEffect, useCallback, useRef } from 'react'
import EcosystemView from './EcosystemView.jsx'

const CHANNEL_ID = import.meta.env.VITE_TENANT_CHANNEL_ID || '882613fe-a43f-4468-a18f-43e592e5f28d'
const LOBBY_URL = `https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1/lobby-data?channel_id=${CHANNEL_ID}`
const POLL_INTERVAL = 15000 // 15 seconds

// Scope this view to sprints/roadmap related to the techne.institute repo.
// Set VITE_REPO_FILTER at build time to change; empty string = show all.
export const REPO_FILTER = import.meta.env.VITE_REPO_FILTER ?? 'techne.institute'

// Phase → CSS accent color
const PHASE_COLORS = {
  gathering: '#d97706',     // amber
  deliberating: '#3b82f6',  // blue
  executing: '#22c55e',     // green
  synthesizing: '#eab308',  // gold
  open: '#d97706',
}

function usePhaseAccent(phase) {
  useEffect(() => {
    const color = PHASE_COLORS[phase] || PHASE_COLORS.gathering
    document.documentElement.style.setProperty('--phase-accent', color)
  }, [phase])
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)
  const timerRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(LOBBY_URL)
      const json = await res.json()
      if (json.ok) {
        setData(json.data)
        setError(null)
        setLastFetch(new Date())
      } else {
        setError(json.error?.message || 'Unknown error')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetchData])

  const phase = data?.floor?.phase || 'gathering'
  usePhaseAccent(phase)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      loading workshop…
    </div>
  )

  if (error && !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      <div>could not reach workshop</div>
      <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>{error}</div>
      <button onClick={fetchData} style={{ marginTop: 8, padding: '6px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12 }}>retry</button>
    </div>
  )

  return <EcosystemView data={data} lastFetch={lastFetch} onRefresh={fetchData} repoFilter={REPO_FILTER} />
}
