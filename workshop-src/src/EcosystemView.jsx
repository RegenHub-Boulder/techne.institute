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

// Returns true if a sprint matches the repo filter string.
// Checks title, description, taxonomy, reference_urls, sprint_id.
function sprintMatchesFilter(sprint, filter) {
  if (!filter) return true
  const f = filter.toLowerCase()
  if (sprint.title?.toLowerCase().includes(f)) return true
  if (sprint.description?.toLowerCase().includes(f)) return true
  if (sprint.taxonomy?.scope?.toLowerCase().includes(f)) return true
  if (sprint.taxonomy?.domain?.toLowerCase().includes(f)) return true
  if (sprint.reference_urls?.some(u => u.toLowerCase().includes(f))) return true
  // Also match taxonomy scope = 'techne-site' for sprints scoped to this repo
  if (filter === 'techne.institute' && sprint.taxonomy?.scope === 'techne-site') return true
  return false
}

function roadmapMatchesFilter(item, filter, matchedSprintIds) {
  if (!filter) return true
  const f = filter.toLowerCase()
  if (item.title?.toLowerCase().includes(f)) return true
  if (item.roadmap_id?.toLowerCase().includes(f)) return true
  // Show if the roadmap item has sprints in the matched set
  if (matchedSprintIds.size > 0 && item.sprints?.some(s => matchedSprintIds.has(s.id))) return true
  return false
}

export default function EcosystemView({ data, lastFetch, onRefresh, repoFilter = '' }) {
  const { presence = [], sprints = {}, messages = [], events = [], floor = {}, roadmap = [] } = data || {}
  const { active = [], recent = [] } = sprints

  const phase = floor.phase || 'gathering'
  const phaseLabel = PHASE_LABELS[phase] || phase

  // Filter sprints to those related to the repo scope
  const filteredActive = useMemo(
    () => active.filter(s => sprintMatchesFilter(s, repoFilter)),
    [active, repoFilter]
  )
  const filteredRecent = useMemo(
    () => recent.filter(s => sprintMatchesFilter(s, repoFilter)),
    [recent, repoFilter]
  )

  // Build set of matched sprint IDs for cross-filtering events/roadmap
  const matchedSprintIds = useMemo(() => {
    const all = [...filteredActive, ...filteredRecent]
    return new Set(all.map(s => s.id))
  }, [filteredActive, filteredRecent])

  // Build a map of sprint id → sprint for agent window cross-references
  const sprintById = useMemo(() => {
    const all = [...filteredActive, ...filteredRecent]
    return Object.fromEntries(all.map(s => [s.id, s]))
  }, [filteredActive, filteredRecent])

  // Filter roadmap to this scope
  const filteredRoadmap = useMemo(
    () => roadmap.filter(item => roadmapMatchesFilter(item, repoFilter, matchedSprintIds)),
    [roadmap, repoFilter, matchedSprintIds]
  )

  // Filter events to matched sprints (or floor signals which are global)
  const filteredEvents = useMemo(() => {
    if (!repoFilter) return events
    return events.filter(e =>
      e.event_type === 'floor_signal' ||
      !e.sprint_id ||
      matchedSprintIds.has(e.sprint_id)
    )
  }, [events, repoFilter, matchedSprintIds])

  // Filter messages: keep if associated sprint is matched, or if message mentions the filter
  const filteredMessages = useMemo(() => {
    if (!repoFilter) return messages
    const f = repoFilter.toLowerCase()
    return messages.filter(m =>
      !m.sprint_id ||
      matchedSprintIds.has(m.sprint_id) ||
      m.content?.toLowerCase().includes(f)
    )
  }, [messages, repoFilter, matchedSprintIds])

  // Partition active sprints
  const proposedSprints = filteredActive.filter(s => s.status === 'proposed')
  const inProgressSprints = filteredActive.filter(s => s.status === 'in_progress' || s.status === 'submitted')

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

        {/* Scope filter badge */}
        {repoFilter && (
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: '#8bbfff',
            border: '1px solid rgba(139,191,255,0.4)',
            borderRadius: 3,
            padding: '2px 7px',
            background: 'rgba(139,191,255,0.08)',
          }}>
            scope: {repoFilter}
          </span>
        )}

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
          <StreamPanel messages={filteredMessages} events={filteredEvents} />
        </div>

        {/* ── Roadmap ── */}
        <RoadmapWindow roadmap={filteredRoadmap} />

        {/* ── Recent / Completed ── */}
        <EcosystemWindow
          title="Completed / Closed"
          subtitle={`Last ${filteredRecent.length} closed sprints`}
          defaultOpen={false}
          badge={filteredRecent.length}
        >
          {filteredRecent.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '4px 0' }}>none</div>
          ) : (
            filteredRecent.map(sprint => (
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
