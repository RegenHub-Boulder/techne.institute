import { useMemo } from 'react'
import EcosystemWindow from './EcosystemWindow.jsx'
import AgentWindow from './AgentWindow.jsx'
import SprintWindow from './SprintWindow.jsx'
import StreamPanel from './StreamPanel.jsx'
import RoadmapWindow from './RoadmapWindow.jsx'

const PHASE_LABELS = {
  gathering: 'Gathering',
  deliberating: 'Deliberating',
  executing: 'Executing',
  synthesizing: 'Synthesizing',
  open: 'Open Floor',
}

export default function EcosystemView({ data, lastFetch, onRefresh }) {
  const { presence = [], sprints = {}, messages = [], events = [], floor = {}, roadmap = [] } = data || {}
  const { active = [], recent = [] } = sprints

  const phase = floor.phase || 'gathering'
  const phaseLabel = PHASE_LABELS[phase] || phase

  // Build a map of sprint id → sprint for agent window cross-references
  const sprintById = useMemo(() => {
    const all = [...active, ...recent]
    return Object.fromEntries(all.map(s => [s.id, s]))
  }, [active, recent])

  // Partition active sprints
  const proposedSprints = active.filter(s => s.status === 'proposed')
  const inProgressSprints = active.filter(s => s.status === 'in_progress' || s.status === 'submitted')

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* ── Top bar ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--surface)',
      }}>
        <a href="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          techne.institute
        </a>
        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>/</span>
        <span style={{ color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>workshop</span>

        <div style={{ flex: 1 }} />

        {/* Phase pill */}
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--phase-accent)',
          border: '1px solid var(--phase-accent)',
          borderRadius: 3,
          padding: '2px 7px',
          opacity: 0.85,
        }}>
          {phaseLabel}
        </span>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            fontSize: 14,
            padding: '2px 4px',
            lineHeight: 1,
            minHeight: 0,
          }}
        >↻</button>
      </header>

      {/* ── Body ── */}
      <main style={{
        flex: 1,
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 12,
        alignItems: 'start',
      }}>

        {/* ── Floor ── */}
        <EcosystemWindow
          title="Floor"
          subtitle={floor.current_speaker ? `Speaker: ${floor.current_speaker.name}` : 'No current speaker'}
          tag={phaseLabel}
          accent
        >
          <FloorDetails floor={floor} />
        </EcosystemWindow>

        {/* ── Agents ── */}
        <EcosystemWindow
          title={`Agents (${presence.length})`}
          subtitle="Active in last 15 min"
          defaultOpen={true}
        >
          {presence.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>no agents active</div>
          ) : (
            presence.map(agent => (
              <AgentWindow key={agent.agent_id} agent={agent} sprintById={sprintById} />
            ))
          )}
        </EcosystemWindow>

        {/* ── In-Progress Sprints ── */}
        <EcosystemWindow
          title={`In Progress (${inProgressSprints.length})`}
          subtitle="Claimed and executing"
          defaultOpen={true}
        >
          {inProgressSprints.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>nothing executing</div>
          ) : (
            inProgressSprints.map(sprint => (
              <SprintWindow key={sprint.id} sprint={sprint} presence={presence} defaultOpen={true} />
            ))
          )}
        </EcosystemWindow>

        {/* ── Proposed Sprints ── */}
        <EcosystemWindow
          title="Proposed"
          subtitle="Awaiting acceptance"
          defaultOpen={proposedSprints.length > 0}
          badge={proposedSprints.length}
        >
          {proposedSprints.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>no proposals</div>
          ) : (
            proposedSprints.map(sprint => (
              <SprintWindow key={sprint.id} sprint={sprint} presence={presence} defaultOpen={false} />
            ))
          )}
        </EcosystemWindow>

        {/* ── Stream ── */}
        <div style={{ gridColumn: 'span 1' }}>
          <StreamPanel messages={messages} events={events} />
        </div>

        {/* ── Roadmap ── */}
        <RoadmapWindow roadmap={roadmap} />

        {/* ── Recent / Completed ── */}
        <EcosystemWindow
          title="Completed / Closed"
          subtitle={`Last ${recent.length} closed sprints`}
          defaultOpen={false}
          badge={recent.length}
        >
          {recent.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>none</div>
          ) : (
            recent.map(sprint => (
              <SprintWindow key={sprint.id} sprint={sprint} presence={[]} defaultOpen={false} />
            ))
          )}
        </EcosystemWindow>

      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: 'var(--text-dim)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
      }}>
        <span>techne studio</span>
        <span style={{ flex: 1 }} />
        {lastFetch && (
          <span>updated {lastFetch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        )}
      </footer>
    </div>
  )
}

function FloorDetails({ floor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {floor.mode && (
        <Row label="mode" value={floor.mode} />
      )}
      {floor.phase_started_at && (
        <Row label="since" value={new Date(floor.phase_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
      )}
      {floor.queue && floor.queue.length > 0 && (
        <Row label="queue" value={floor.queue.map(q => q.name).join(', ')} />
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
      <span style={{ color: 'var(--text-muted)', width: 56, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
