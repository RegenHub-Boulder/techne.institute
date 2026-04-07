import EcosystemWindow from './EcosystemWindow.jsx'

const STATUS_COLORS = {
  active: '#22c55e',
  executing: '#3b82f6',
  idle: '#777',
  offline: '#444',
}

export default function AgentWindow({ agent, sprintById = {} }) {
  const currentSprint = agent.current_sprint ? sprintById[agent.current_sprint] : null
  const statusColor = STATUS_COLORS[agent.status] || '#777'

  const subtitle = agent.craft_primary
    ? `${agent.craft_primary}${agent.functional_mode ? ' · ' + agent.functional_mode : ''}`
    : agent.functional_mode || null

  return (
    <EcosystemWindow
      title={agent.name || agent.agent_id.slice(0, 8)}
      subtitle={subtitle}
      tag={agent.status}
      defaultOpen={!!currentSprint}
      headerRight={
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: statusColor,
          display: 'inline-block',
          flexShrink: 0,
        }} />
      }
      style={{ background: 'var(--surface2)' }}
    >
      {/* Capacity bar */}
      <CapacityBar capacity={agent.capacity} />

      {/* Context */}
      {agent.context && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', lineHeight: 1.4 }}>
          {agent.context}
        </div>
      )}

      {/* Capabilities */}
      {agent.capabilities && agent.capabilities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {agent.capabilities.map(cap => (
            <span key={cap} style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: '1px 5px',
            }}>{cap}</span>
          ))}
        </div>
      )}

      {/* Claimed sprint (nested) */}
      {currentSprint && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 4 }}>
            claimed sprint
          </div>
          <SprintInline sprint={currentSprint} />
        </div>
      )}
    </EcosystemWindow>
  )
}

function CapacityBar({ capacity }) {
  const pct = Math.max(0, Math.min(100, capacity || 0))
  const color = pct > 60 ? '#22c55e' : pct > 30 ? '#d97706' : '#ef4444'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function SprintInline({ sprint }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '6px 9px',
    }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text)', lineHeight: 1.3 }}>
        {sprint.title}
      </div>
      <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
        <StatusBadge status={sprint.status} />
        {sprint.claimer && (
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            {sprint.claimer.name}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    proposed: '#d97706',
    in_progress: '#3b82f6',
    submitted: '#8b5cf6',
    completed: '#22c55e',
    cancelled: '#ef4444',
    withdrawn: '#777',
  }
  return (
    <span style={{
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      color: colors[status] || '#777',
    }}>{status}</span>
  )
}
