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

  const { work_item_id, note, actor_name, actor_type, actor_id, subject_url, source, source_id } = body as {
    work_item_id?: string
    note?: string
    actor_name?: string
    actor_type?: string
    actor_id?: string
    subject_url?: string
    source?: string
    source_id?: string
  }

  if (!work_item_id) return json({ ok: false, error: 'work_item_id required' }, 400)

  const { data: item, error: fetchErr } = await db
    .from('work_items')
    .select('*')
    .eq('id', work_item_id)
    .single()

  if (fetchErr || !item) return json({ ok: false, error: 'Work item not found' }, 404)

  const validStatuses = ['claimed', 'in_progress']
  if (!validStatuses.includes(item.status)) {
    return json({ ok: false, error: `Cannot post progress on item in status: ${item.status}` }, 409)
  }

  // First progress update moves to in_progress/execution
  const newStatus = item.status === 'claimed' ? 'in_progress' : 'in_progress'
  const newPhase = item.status === 'claimed' ? 'execution' : item.phase

  if (item.status === 'claimed') {
    await db.from('work_items')
      .update({ status: newStatus, phase: newPhase })
      .eq('id', work_item_id)
  }

  const resolved_name = actor_name || 'unknown'
  const resolved_type = (actor_type as 'human' | 'agent' | 'system') || 'human'

  // Log progress event
  const { data: event, error: eventErr } = await db.from('work_events').insert({
    actor_id: actor_id || null,
    actor_name: resolved_name,
    actor_type: resolved_type,
    event_type: 'progress',
    phase: newPhase,
    work_item_id,
    title: note ? `Progress: ${note}` : 'Progress update',
    body: note || null,
    subject_url: subject_url || null,
    source: source || 'manual',
    source_id: source_id || null,
  }).select().single()

  if (eventErr) return json({ ok: false, error: eventErr.message }, 500)

  return json({ ok: true, data: { event } })
})
