interface Session {
  id: string
  week_number: number
  title: string
  youtube_url: string | null
  notes: string | null
  published_at: string | null
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1)
    }
    return parsed.searchParams.get('v')
  } catch {
    return null
  }
}

export default function SessionCard({ session }: { session: Session }) {
  const videoId = session.youtube_url ? extractYouTubeId(session.youtube_url) : null

  return (
    <div className="session-card">
      <p className="session-week">Week {session.week_number}</p>
      <h3 className="session-title">{session.title}</h3>

      {videoId ? (
        <div className="youtube-embed">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={session.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{
            background: 'var(--cream)',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--stone)',
            letterSpacing: '0.05em',
          }}
        >
          Recording coming soon
        </div>
      )}

      {session.notes && (
        <div className="session-notes">
          {/* Simple line-break rendering for notes — markdown parser can be added later */}
          {session.notes.split('\n').map((line, i) => (
            <p key={i} style={{ marginBottom: '0.5rem' }}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
