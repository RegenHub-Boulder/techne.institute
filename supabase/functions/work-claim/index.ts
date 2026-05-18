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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const { work_item_id, assignee_id, actor_name, actor_type } = body as {
    work_item_id?: string
    assignee_id?: string
    actor_name?: string
    actor_type?: string
  }

  if (!work_item_id) return json({ ok: false, error: 'work_item_id required' }, 400)

  // Check current state
  const { data: item, error: fetchErr } = await db
    .from('work_items')
    .select('*')
    .eq('id', work_item_id)
    .single()

  if (fetchErr || !item) return json({ ok: false, error: 'Work item not found' }, 404)
  if (item.status !== 'open') {
    return json({ ok: false, error: `Cannot claim item in status: ${item.status}` }, 409)
  }

  // Resolve assignee
  let resolved_assignee = assignee_id || null
  let resolved_name = actor_name || 'unknown'
  let resolved_type = (actor_type as 'human' | 'agent' | 'system') || 'human'

  if (!resolved_assignee) {
    // Try to resolve from auth
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user } } = await db.auth.getUser(authHeader.slice(7))
      if (user) {
        const { data: profile } = await db.from('profiles').select('id, name, agent_type').eq('id', user.id).single()
        if (profile) {
          resolved_assignee = profile.id
          resolved_name = profile.name
          resolved_type = (profile.agent_type as 'human' | 'agent' | 'system') || 'human'
        }
      }
    }
  }

  // Update work item
  const { data: updated, error: updateErr } = await db
    .from('work_items')
    .update({
      assignee_id: resolved_assignee,
      status: 'claimed',
      phase: 'negotiation',
    })
    .eq('id', work_item_id)
    .select()
    .single()

  if (updateErr) return json({ ok: false, error: updateErr.message }, 500)

  // Log event
  await db.from('work_events').insert({
    actor_id: resolved_assignee,
    actor_name: resolved_name,
    actor_type: resolved_type,
    event_type: 'claimed',
    phase: 'negotiation',
    work_item_id,
    title: `Claimed: ${item.title}`,
    source: 'manual',
  })

  return json({ ok: true, data: updated })
})
