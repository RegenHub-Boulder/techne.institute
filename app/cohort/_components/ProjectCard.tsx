interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  url: string | null
  featured: boolean
  created_at: string
  profiles: { display_name: string | null } | null
}

function safeHostname(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

export default function ProjectCard({ project, isOwn }: { project: Project; isOwn: boolean }) {
  return (
    <div className={`project-card${project.featured ? ' featured' : ''}`}>
      {project.featured && (
        <p className="project-card-meta" style={{ color: 'var(--ember)' }}>Featured</p>
      )}
      {!project.featured && project.profiles?.display_name && (
        <p className="project-card-meta">{project.profiles.display_name}{isOwn ? ' (you)' : ''}</p>
      )}
      {project.featured && project.profiles?.display_name && (
        <p className="project-card-meta" style={{ color: 'var(--ember)' }}>
          {project.profiles.display_name}{isOwn ? ' (you)' : ''}
        </p>
      )}

      <h4>{project.title}</h4>

      {project.description && <p>{project.description}</p>}

      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          {safeHostname(project.url)} →
        </a>
      )}
    </div>
  )
}
