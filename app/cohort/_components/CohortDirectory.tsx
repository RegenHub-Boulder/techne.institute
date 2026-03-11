interface Member {
  display_name: string | null
}

export default function CohortDirectory({ members }: { members: Member[] }) {
  const visible = members.filter((m) => m.display_name)

  if (visible.length === 0) {
    return (
      <div className="empty-state">
        <p>Directory members will appear here once students opt in.</p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: '0.9rem', color: 'var(--stone)', marginBottom: '1.5rem' }}>
        {visible.length} member{visible.length !== 1 ? 's' : ''} in this cohort
      </p>
      <div className="directory-list">
        {visible.map((m, i) => (
          <div key={i} className="directory-item">
            {m.display_name}
          </div>
        ))}
      </div>
    </div>
  )
}
