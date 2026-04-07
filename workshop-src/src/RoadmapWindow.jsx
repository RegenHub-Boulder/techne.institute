import { useState } from 'react'
import EcosystemWindow from './EcosystemWindow.jsx'

const STATUS_COLORS = {
  proposed: '#d97706',
  planned: '#6b7280',
  active: '#3b82f6',
  completed: '#22c55e',
  deferred: '#777',
}

export default function RoadmapWindow({ roadmap = [] }) {
  if (roadmap.length === 0) return null

  // Group by phase
  const phases = {}
  for (const item of roadmap) {
    const phase = item.phase || 'General'
    if (!phases[phase]) phases[phase] = []
    phases[phase].push(item)
  }

  const phaseNames = Object.keys(phases).sort()

  return (
    <EcosystemWindow
      title={`Roadmap (${roadmap.length})`}
      subtitle="Strategic items"
      defaultOpen={false}
      badge={roadmap.length}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {phaseNames.map(phase => (
          <PhaseGroup key={phase} phase={phase} items={phases[phase]} />
        ))}
      </div>
    </EcosystemWindow>
  )
}

function PhaseGroup({ phase, items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        paddingBottom: 3,
        borderBottom: '1px solid var(--border)',
      }}>
        {phase}
      </div>
      {items.map(item => (
        <RoadmapItem key={item.roadmap_id} item={item} />
      ))}
    </div>
  )
}

function RoadmapItem({ item }) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = STATUS_COLORS[item.status] || '#777'
  const total = item.sprint_count || 0
  const done = item.completed_sprint_count || 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 9px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          minHeight: 0,
        }}
      >
        {/* Roadmap ID badge */}
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: statusColor,
          border: `1px solid ${statusColor}`,
          borderRadius: 3,
          padding: '1px 5px',
          flexShrink: 0,
          opacity: 0.85,
        }}>{item.roadmap_id}</span>

        {/* Title */}
        <span style={{
          flex: 1,
          fontSize: 12,
          fontFamily: 'var(--font-sans)',
          color: 'var(--text)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{item.title}</span>

        {/* Progress */}
        {total > 0 && (
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}>{done}/{total}</span>
        )}

        {/* Chevron */}
        <span style={{
          fontSize: 10,
          color: 'var(--text-dim)',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
          flexShrink: 0,
        }}>▶</span>
      </button>

      {/* Progress bar (always shown) */}
      {total > 0 && (
        <div style={{ height: 2, background: 'var(--border)', margin: '0 9px 6px' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: done === total ? '#22c55e' : '#3b82f6',
            borderRadius: 1,
          }} />
        </div>
      )}

      {/* Expanded: deliverables */}
      {expanded && item.deliverables && (
        <div style={{ padding: '4px 9px 8px', borderTop: '1px solid var(--border)' }}>
          {Object.entries(item.deliverables).map(([key, vals]) => (
            <div key={key} style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 3 }}>
                {key}
              </div>
              {Array.isArray(vals) && vals.map((v, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', paddingLeft: 8 }}>
                  — {v}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {expanded && !item.deliverables && (
        <div style={{ padding: '4px 9px 8px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {item.status} · no deliverables listed
        </div>
      )}
    </div>
  )
}
