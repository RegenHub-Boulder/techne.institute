import { useMemo, useState } from 'react'
import EcosystemWindow from './EcosystemWindow.jsx'

const EVENT_LABELS = {
  task_proposed: 'proposed',
  task_accepted: 'accepted',
  task_claimed: 'claimed',
  task_completed: 'completed',
  task_cancelled: 'cancelled',
  task_withdrawn: 'withdrawn',
  task_progress: 'progress',
  task_submitted: 'submitted',
  capability_matched: 'capability match',
  floor_signal: 'floor signal',
}

export default function StreamPanel({ messages = [], events = [] }) {
  // Merge messages and events into a unified time-ordered stream
  const stream = useMemo(() => {
    const items = [
      ...messages.map(m => ({ ...m, _type: 'message' })),
      ...events.map(e => ({ ...e, _type: 'event' })),
    ]
    // Sort chronological (oldest → newest), then reverse for display (newest at top)
    items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    items.reverse()
    return items
  }, [messages, events])

  return (
    <EcosystemWindow
      title="Stream"
      subtitle="Messages & protocol events"
      defaultOpen={true}
      badge={stream.length}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
        {stream.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>
            no activity
          </div>
        ) : (
          stream.map(item =>
            item._type === 'message'
              ? <MessageItem key={item.id} item={item} />
              : <EventItem key={item.id} item={item} />
          )
        )}
      </div>
    </EcosystemWindow>
  )
}

function MessageItem({ item }) {
  const [expanded, setExpanded] = useState(false)
  const senderName = item.sender?.name || 'unknown'
  const isAgent = item.is_agent || item.sender?.is_agent
  const text = item.content || ''
  const truncated = text.length > 120 && !expanded

  return (
    <div style={{
      padding: '6px 0',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: isAgent ? 'var(--phase-accent)' : 'var(--text)',
          fontWeight: 500,
        }}>{senderName}</span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {formatTime(item.created_at)}
        </span>
      </div>
      <div
        style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45, fontFamily: 'var(--font-sans)', cursor: truncated ? 'pointer' : 'default' }}
        onClick={() => truncated && setExpanded(true)}
      >
        {truncated ? text.slice(0, 120) + '…' : text}
      </div>
    </div>
  )
}

function EventItem({ item }) {
  const label = EVENT_LABELS[item.event_type] || item.event_type
  const agentName = item.agent?.name || null

  return (
    <div style={{
      padding: '5px 0',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-dim)',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        padding: '1px 5px',
        flexShrink: 0,
      }}>{label}</span>
      {agentName && (
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {agentName}
        </span>
      )}
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        {formatTime(item.created_at)}
      </span>
    </div>
  )
}

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
