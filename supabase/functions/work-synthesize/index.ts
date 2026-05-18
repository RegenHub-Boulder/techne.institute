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

  const {
    work_item_id,
    synthesis_note,
    approved,
    actor_name,
    actor_type,
    actor_id,
  } = body as {
    work_item_id?: string
    synthesis_note?: string
    approved?: boolean
    actor_name?: string
    actor_type?: string
    actor_id?: string
  }

  if (!work_item_id) return json({ ok: false, error: 'work_item_id required' }, 400)
  if (approved === undefined) return json({ ok: false, error: 'approved (boolean) required' }, 400)

  const { data: item, error: fetchErr } = await db
    .from('work_items')
    .select('*')
    .eq('id', work_item_id)
    .single()

  if (fetchErr || !item) return json({ ok: false, error: 'Work item not found' }, 404)
  if (item.status !== 'testing') {
    return json({ ok: false, error: `Can only synthesize items in testing status. Current: ${item.status}` }, 409)
  }

  // M/L/XL items require a steward — tracked by convention, not enforced in MVP
  const newStatus = approved ? 'completed' : 'in_progress'
  const newPhase = approved ? 'synthesis' : 'execution'

  const { data: updated, error: updateErr } = await db
    .from('work_items')
    .update({ status: newStatus, phase: newPhase })
    .eq('id', work_item_id)
    .select()
    .single()

  if (updateErr) return json({ ok: false, error: updateErr.message }, 500)

  const resolved_name = actor_name || 'unknown'
  const resolved_type = (actor_type as 'human' | 'agent' | 'system') || 'human'

  await db.from('work_events').insert({
    actor_id: actor_id || null,
    actor_name: resolved_name,
    actor_type: resolved_type,
    event_type: approved ? 'synthesized' : 'returned',
    phase: newPhase,
    work_item_id,
    title: approved ? `Accepted: ${item.title}` : `Returned: ${item.title}`,
    body: synthesis_note || null,
    source: 'manual',
  })

  return json({ ok: true, data: updated })
})
