import EcosystemWindow from './EcosystemWindow.jsx'

const STATUS_COLORS = {
  proposed: '#d97706',
  in_progress: '#3b82f6',
  submitted: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444',
  withdrawn: '#777',
}

export default function SprintWindow({ sprint, presence = [], defaultOpen = false }) {
  const statusColor = STATUS_COLORS[sprint.status] || '#777'

  // Find claimer agent in presence (for live capacity)
  const claimerPresence = sprint.claimer
    ? presence.find(a => a.agent_id === sprint.claimer.id || a.name === sprint.claimer.name)
    : null

  const tag = sprint.taxonomy?.scope || sprint.taxonomy?.domain || null

  return (
    <EcosystemWindow
      title={sprint.title}
      subtitle={sprint.proposer ? `by ${sprint.proposer.name}` : null}
      tag={tag}
      defaultOpen={defaultOpen}
      headerRight={
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: statusColor,
        }}>{sprint.status}</span>
      }
      style={{ background: 'var(--surface2)' }}
    >
      {/* Description */}
      {sprint.description && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
          {sprint.description.length > 280 ? sprint.description.slice(0, 280) + '…' : sprint.description}
        </div>
      )}

      {/* Claimer agent card (nested) */}
      {sprint.claimer && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '6px 9px',
        }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 4 }}>
            claimer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Online indicator */}
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: claimerPresence ? '#22c55e' : '#444',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
              {sprint.claimer.name}
            </span>
            {claimerPresence && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {claimerPresence.capacity}% cap
              </span>
            )}
          </div>
          {claimerPresence?.context && (
            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              {claimerPresence.context}
            </div>
          )}
          {/* Capacity bar */}
          {claimerPresence && (
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, claimerPresence.capacity || 0))}%`,
                  height: '100%',
                  background: '#3b82f6',
                  borderRadius: 1,
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        <span>{new Date(sprint.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        {sprint.updated_at && sprint.updated_at !== sprint.created_at && (
          <span>updated {new Date(sprint.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
    </EcosystemWindow>
  )
}
