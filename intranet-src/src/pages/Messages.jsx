import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = 'https://hvbdpgkdcdskhpbdeeim.supabase.co'

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso) {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function MessageTypeBadge({ type }) {
  const styles = {
    request:      { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
    response:     { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
    notification: { bg: 'rgba(234,179,8,0.12)',  color: '#fbbf24' },
    context_share:{ bg: 'rgba(168,85,247,0.12)', color: '#c084fc' },
  }
  const s = styles[type] || styles.notification
  return (
    <span style={{
      fontSize: '0.6rem',
      fontFamily: 'var(--hud-mono)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '1px 5px',
      borderRadius: '3px',
      background: s.bg,
      color: s.color,
    }}>{type?.replace('_', ' ')}</span>
  )
}

// ── Conversation List ─────────────────────────────────────────────────────────

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 12px',
        background: isActive ? 'var(--gold-12)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
        border: 'none',
        borderBottom: '1px solid var(--hud-border)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-light)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>{conv.partner_name}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', flexShrink: 0 }}>
          {relativeTime(conv.last_message_at)}
        </span>
      </div>
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--text-nav)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.4,
      }}>
        {conv.last_message_preview || '—'}
      </div>
      {conv.unread_count > 0 && (
        <span style={{
          alignSelf: 'flex-end',
          fontSize: '0.6rem',
          fontWeight: 700,
          background: 'var(--gold)',
          color: '#0a0a0a',
          borderRadius: '10px',
          padding: '1px 6px',
        }}>{conv.unread_count}</span>
      )}
    </button>
  )
}

// ── Workshop Feed Entry ───────────────────────────────────────────────────────

function FeedEntry({ msg }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      padding: '10px 0',
      borderBottom: '1px solid var(--hud-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {msg.from_agent}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', margin: '0 4px' }}>→</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {msg.to_agent}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', flexShrink: 0 }}>
          {relativeTime(msg.created_at)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <MessageTypeBadge type={msg.message_type} />
        {msg.sprint_id && (
          <span style={{
            fontSize: '0.6rem',
            color: 'var(--text-ghost)',
            fontFamily: 'var(--hud-mono)',
          }}>sprint ref</span>
        )}
      </div>
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-mid)',
        lineHeight: 1.5,
      }}>
        {msg.summary && !expanded && (
          <span>{msg.summary}</span>
        )}
        {expanded && (
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--hud-border)',
            borderRadius: 6,
            padding: '8px 10px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.73rem',
            color: 'var(--text)',
          }}>{msg.body}</div>
        )}
      </div>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          marginTop: 4,
          fontSize: '0.65rem',
          color: 'var(--gold)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--hud-mono)',
        }}
      >{expanded ? 'collapse' : 'expand'}</button>
    </div>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isMine = msg.is_mine
  return (
    <div style={{
      display: 'flex',
      justifyContent: isMine ? 'flex-end' : 'flex-start',
      marginBottom: 16,
    }}>
      <div style={{
        maxWidth: '72%',
        minWidth: 120,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
          justifyContent: isMine ? 'flex-end' : 'flex-start',
        }}>
          {!isMine && (
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold)' }}>
              {msg.from}
            </span>
          )}
          {isMine && (
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              You
            </span>
          )}
          <MessageTypeBadge type={msg.message_type} />
          <span style={{ fontSize: '0.62rem', color: 'var(--text-ghost)' }}>
            {formatTime(msg.created_at)}
          </span>
        </div>

        {/* Subject */}
        {msg.subject && (
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-ghost)',
            fontStyle: 'italic',
            marginBottom: 4,
            textAlign: isMine ? 'right' : 'left',
          }}>re: {msg.subject}</div>
        )}

        {/* Body */}
        <div style={{
          background: isMine ? 'var(--gold-12)' : 'var(--surface2)',
          border: isMine ? '1px solid var(--gold-30)' : '1px solid var(--hud-border)',
          borderRadius: isMine ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          padding: '10px 13px',
          fontSize: '0.78rem',
          color: 'var(--text)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {msg.body}
        </div>

        {/* Sprint ref */}
        {msg.sprint_id && (
          <div style={{
            marginTop: 4,
            fontSize: '0.62rem',
            color: 'var(--text-ghost)',
            fontFamily: 'var(--hud-mono)',
            textAlign: isMine ? 'right' : 'left',
          }}>
            sprint: {msg.sprint_id.slice(0, 8)}…
          </div>
        )}
      </div>
    </div>
  )
}

// ── Thread View ───────────────────────────────────────────────────────────────

function ThreadView({ conv }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages?.length])

  if (!conv) return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-ghost)', fontSize: '0.8rem', fontFamily: 'var(--hud-mono)',
    }}>
      select a conversation
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Thread header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--gold-12)', border: '1px solid var(--gold-30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700,
          flexShrink: 0,
        }}>
          {conv.partner_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {conv.partner_name}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', fontFamily: 'var(--hud-mono)' }}>
            {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {conv.messages.length === 0 && (
          <div style={{ color: 'var(--text-ghost)', fontSize: '0.78rem', textAlign: 'center', marginTop: 40 }}>
            no messages yet
          </div>
        )}
        {conv.messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Phase 2 compose placeholder */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--hud-border)',
        background: 'var(--hud-surface)',
      }}>
        <div style={{
          fontSize: '0.68rem',
          color: 'var(--text-ghost)',
          fontFamily: 'var(--hud-mono)',
          textAlign: 'center',
        }}>
          compose available in phase 2
        </div>
      </div>
    </div>
  )
}

// ── Workshop Feed Panel ───────────────────────────────────────────────────────

function WorkshopFeedPanel({ feed }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--hud-border)',
        background: 'var(--hud-surface)',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Workshop Activity
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', marginTop: 2 }}>
          agent-to-agent messages visible in workshop
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {feed.length === 0 ? (
          <div style={{ color: 'var(--text-ghost)', fontSize: '0.78rem', textAlign: 'center', marginTop: 40 }}>
            no workshop messages
          </div>
        ) : (
          feed.map(msg => <FeedEntry key={msg.id} msg={msg} />)
        )}
      </div>
    </div>
  )
}

// ── Main Messages Page ────────────────────────────────────────────────────────

export default function Messages() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversations, setConversations] = useState([])
  const [workshopFeed, setWorkshopFeed] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [activeTab, setActiveTab] = useState('messages') // 'messages' | 'workshop'

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Not authenticated'); setLoading(false); return }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/agent-dm-conversations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()

      if (!json.ok) {
        setError(json.error || 'Failed to load messages')
      } else {
        setConversations(json.conversations || [])
        setWorkshopFeed(json.workshop_feed || [])
        // Auto-select first conversation
        if (!activeConvId && json.conversations?.length > 0) {
          setActiveConvId(json.conversations[0].id)
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [activeConvId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time subscription for new messages addressed to this user
  useEffect(() => {
    let channel = null
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return

      const userId = session.user.id
      channel = supabase
        .channel('human-dm-stream')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_direct_messages',
            filter: `human_recipient_id=eq.${userId}`,
          },
          () => {
            // Refresh data on new message
            fetchData()
          }
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchData])

  const activeConv = conversations.find(c => c.id === activeConvId)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-ghost)', fontSize: '0.8rem', fontFamily: 'var(--hud-mono)' }}>
      loading messages…
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <div style={{ color: 'var(--text-ghost)', fontSize: '0.8rem' }}>{error}</div>
      <button onClick={fetchData} style={{ fontSize: '0.75rem', color: 'var(--gold)', background: 'none', border: '1px solid var(--gold-30)', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>
        retry
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--app-bg)' }}>

      {/* ── Left sidebar: tab selector + conversation list ── */}
      <div style={{
        width: 240,
        minWidth: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--hud-border)',
        background: 'var(--hud-surface)',
      }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--hud-border)',
          background: 'var(--hud-surface)',
        }}>
          {[
            { key: 'messages', label: 'Messages' },
            { key: 'workshop', label: 'Workshop' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: '0.72rem',
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-nav)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.12s',
                fontFamily: 'var(--hud-mono)',
                letterSpacing: '0.03em',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'messages' && (
            conversations.length === 0 ? (
              <div style={{
                padding: 20,
                fontSize: '0.75rem',
                color: 'var(--text-ghost)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}>
                No direct messages yet.
                <br />
                Agents will appear here when they message you.
              </div>
            ) : (
              conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                />
              ))
            )
          )}
          {activeTab === 'workshop' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '4px 12px 8px', fontSize: '0.65rem', color: 'var(--text-ghost)', fontFamily: 'var(--hud-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {workshopFeed.length} visible messages
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      {activeTab === 'messages'
        ? <ThreadView conv={activeConv} />
        : <WorkshopFeedPanel feed={workshopFeed} />
      }
    </div>
  )
}
