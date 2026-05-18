import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-agent-key',
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, error: 'POST required' }, 405)

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Resolve caller: auth header (bearer token for user) or x-agent-key header
  let proposer_id: string | null = null
  let actor_name = 'unknown'
  let actor_type: 'human' | 'agent' | 'system' = 'human'

  const agentKey = req.headers.get('x-agent-key')
  const authHeader = req.headers.get('Authorization')

  if (agentKey) {
    // Agent key: look up profile by matching key in profiles.craft field (agent registration)
    // Simple: agent_key stored in profiles as a secret column — for now accept known agent IDs
    const { data: profile } = await db
      .from('profiles')
      .select('id, name, agent_type')
      .eq('agent_key', agentKey)
      .single()
    if (profile) {
      proposer_id = profile.id
      actor_name = profile.name
      actor_type = (profile.agent_type as 'human' | 'agent' | 'system') || 'agent'
    }
  } else if (authHeader?.startsWith('Bearer ')) {
    // Anon or service key — resolve via profile lookup by auth user
    const token = authHeader.slice(7)
    const { data: { user } } = await db.auth.getUser(token)
    if (user) {
      const { data: profile } = await db
        .from('profiles')
        .select('id, name, agent_type')
        .eq('id', user.id)
        .single()
      if (profile) {
        proposer_id = profile.id
        actor_name = profile.name
        actor_type = (profile.agent_type as 'human' | 'agent' | 'system') || 'human'
      }
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const { title, description, subject_type, subject_ref, complexity, proposer_name } = body as {
    title?: string
    description?: string
    subject_type?: string
    subject_ref?: string
    complexity?: string
    proposer_name?: string
  }

  if (!title) return json({ ok: false, error: 'title required' }, 400)

  // Allow caller to pass proposer_name if no auth resolved
  if (!actor_name || actor_name === 'unknown') {
    actor_name = (proposer_name as string) || 'anonymous'
  }

  // Insert work item
  const { data: item, error: itemErr } = await db
    .from('work_items')
    .insert({
      title,
      description: description || null,
      phase: 'proposal',
      status: 'open',
      proposer_id: proposer_id || null,
      subject_type: subject_type || null,
      subject_ref: subject_ref || null,
      complexity: complexity || null,
    })
    .select()
    .single()

  if (itemErr) return json({ ok: false, error: itemErr.message }, 500)

  // Log event
  await db.from('work_events').insert({
    actor_id: proposer_id || null,
    actor_name,
    actor_type,
    event_type: 'proposed',
    phase: 'proposal',
    work_item_id: item.id,
    title: `Proposed: ${title}`,
    body: description || null,
    source: 'manual',
  })

  return json({ ok: true, data: item })
})
