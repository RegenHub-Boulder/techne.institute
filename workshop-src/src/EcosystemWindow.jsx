import { useState } from 'react'

/**
 * EcosystemWindow — collapsible, nestable entity window.
 *
 * Props:
 *   title       string
 *   subtitle    string (optional)
 *   tag         string (optional, small label on right)
 *   accent      boolean — highlight border with --phase-accent
 *   defaultOpen boolean
 *   badge       number | null — shown when collapsed
 *   children    ReactNode
 *   headerRight ReactNode — extra content in header row
 */
export default function EcosystemWindow({
  title,
  subtitle,
  tag,
  accent = false,
  defaultOpen = true,
  badge = null,
  children,
  headerRight,
  style = {},
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${accent ? 'var(--phase-accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? `1px solid var(--border)` : 'none',
          minHeight: 0,
        }}
      >
        {/* Chevron */}
        <span style={{
          fontSize: 10,
          color: 'var(--text-dim)',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
        }}>▶</span>

        {/* Title + subtitle */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: accent ? 'var(--phase-accent)' : 'var(--text)',
            fontFamily: 'var(--font-mono)',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{title}</span>
          {subtitle && (
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{subtitle}</span>
          )}
        </span>

        {/* Right side */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {headerRight}
          {tag && (
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: '1px 5px',
            }}>{tag}</span>
          )}
          {!open && badge != null && (
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--phase-accent)',
              background: 'var(--surface2)',
              border: '1px solid var(--phase-accent)',
              borderRadius: 3,
              padding: '1px 5px',
              opacity: 0.8,
            }}>{badge}</span>
          )}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}
