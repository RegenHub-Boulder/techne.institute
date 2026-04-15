import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return Response.json({ ok: false, error: 'Missing auth' }, { headers: CORS, status: 401 })

    // Authenticate the human user
    const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authErr } = await anonClient.auth.getUser()
    if (authErr || !user) return Response.json({ ok: false, error: 'Unauthorized' }, { headers: CORS, status: 401 })

    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Fetch all messages involving this human (as sender or recipient)
    const { data: messages, error: msgErr } = await serviceClient
      .from('agent_direct_messages')
      .select(`
        id, created_at, message_type, subject, body, summary, sprint_id,
        parent_message_id, read_at, is_visible_in_workshop,
        from_agent_id, to_agent_id, human_sender_id, human_recipient_id,
        from_agent:agents!agent_direct_messages_from_agent_id_fkey(id, name),
        to_agent:agents!agent_direct_messages_to_agent_id_fkey(id, name)
      `)
      .or(`human_recipient_id.eq.${user.id},human_sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (msgErr) return Response.json({ ok: false, error: msgErr.message }, { headers: CORS, status: 500 })

    // Also fetch all workshop-visible agent-agent messages (transparency principle)
    const { data: visibleMessages, error: visErr } = await serviceClient
      .from('agent_direct_messages')
      .select(`
        id, created_at, message_type, subject, body, summary, sprint_id,
        parent_message_id, read_at, is_visible_in_workshop,
        from_agent_id, to_agent_id, human_sender_id, human_recipient_id,
        from_agent:agents!agent_direct_messages_from_agent_id_fkey(id, name),
        to_agent:agents!agent_direct_messages_to_agent_id_fkey(id, name)
      `)
      .eq('is_visible_in_workshop', true)
      .is('human_sender_id', null)
      .is('human_recipient_id', null)
      .order('created_at', { ascending: false })
      .limit(100)

    if (visErr) return Response.json({ ok: false, error: visErr.message }, { headers: CORS, status: 500 })

    // Fetch all agents for display
    const { data: agents } = await serviceClient
      .from('agents')
      .select('id, name, agent_type')

    const agentMap: Record<string, any> = {}
    for (const a of (agents || [])) agentMap[a.id] = a

    // Build conversation threads from human messages
    // Group by "conversation partner" (the agent on the other side)
    const humanConvMap: Record<string, any> = {}

    for (const msg of (messages || [])) {
      // Determine the conversation partner
      let partnerId: string
      let partnerName: string
      let partnerType: string

      if (msg.human_sender_id === user.id) {
        // Human sent this → partner is the recipient agent
        partnerId = msg.to_agent_id
        partnerName = msg.to_agent?.name || agentMap[partnerId]?.name || 'Unknown Agent'
        partnerType = 'agent'
      } else {
        // Human received this → partner is the sending agent
        partnerId = msg.from_agent_id
        partnerName = msg.from_agent?.name || agentMap[partnerId]?.name || 'Unknown Agent'
        partnerType = 'agent'
      }

      const key = `agent:${partnerId}`
      if (!humanConvMap[key]) {
        humanConvMap[key] = {
          id: key,
          partner_id: partnerId,
          partner_name: partnerName,
          partner_type: partnerType,
          last_message_at: msg.created_at,
          last_message_preview: (msg.body || '').substring(0, 120),
          unread_count: 0,
          messages: [],
        }
      }

      if (msg.created_at > humanConvMap[key].last_message_at) {
        humanConvMap[key].last_message_at = msg.created_at
        humanConvMap[key].last_message_preview = (msg.body || '').substring(0, 120)
      }

      // Count unread (messages TO the human that have no read_at)
      if (msg.human_recipient_id === user.id && !msg.read_at) {
        humanConvMap[key].unread_count++
      }

      humanConvMap[key].messages.push({
        id: msg.id,
        created_at: msg.created_at,
        from: msg.human_sender_id === user.id ? 'human' : (msg.from_agent?.name || agentMap[msg.from_agent_id]?.name || 'agent'),
        body: msg.body,
        subject: msg.subject,
        summary: msg.summary,
        message_type: msg.message_type,
        sprint_id: msg.sprint_id,
        parent_message_id: msg.parent_message_id,
        read_at: msg.read_at,
        is_mine: msg.human_sender_id === user.id,
      })
    }

    // Sort each conversation's messages chronologically
    for (const conv of Object.values(humanConvMap)) {
      conv.messages.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
    }

    // Sort conversations by last message (most recent first)
    const humanConversations = Object.values(humanConvMap)
      .sort((a: any, b: any) => b.last_message_at.localeCompare(a.last_message_at))

    // Workshop feed: agent-agent visible messages as a flat list
    const workshopFeed = (visibleMessages || []).map(msg => ({
      id: msg.id,
      created_at: msg.created_at,
      from_agent: msg.from_agent?.name || agentMap[msg.from_agent_id]?.name || 'Unknown',
      to_agent: msg.to_agent?.name || agentMap[msg.to_agent_id]?.name || 'Unknown',
      message_type: msg.message_type,
      subject: msg.subject,
      summary: msg.summary,
      body: msg.body,
      sprint_id: msg.sprint_id,
      parent_message_id: msg.parent_message_id,
    }))

    return Response.json({
      ok: true,
      user_id: user.id,
      conversations: humanConversations,
      workshop_feed: workshopFeed,
    }, { headers: CORS })

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { headers: CORS, status: 500 })
  }
})
