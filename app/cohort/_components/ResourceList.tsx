interface Resource {
  id: string
  title: string
  url: string
  resource_type: 'link' | 'document' | 'tool'
}

const TYPE_LABELS: Record<string, string> = {
  tool: 'Tools',
  document: 'Documents',
  link: 'Links',
}

export default function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className="empty-state">
        <p>Resources will appear here as the cohort progresses.</p>
      </div>
    )
  }

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    if (!acc[r.resource_type]) acc[r.resource_type] = []
    acc[r.resource_type].push(r)
    return acc
  }, {})

  const order = ['tool', 'document', 'link']

  return (
    <div>
      {order
        .filter((type) => grouped[type]?.length > 0)
        .map((type) => (
          <div key={type} className="resource-group">
            <p className="resource-group-label">{TYPE_LABELS[type]}</p>
            {grouped[type].map((r) => (
              <div key={r.id} className="resource-item">
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.title} →
                </a>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
