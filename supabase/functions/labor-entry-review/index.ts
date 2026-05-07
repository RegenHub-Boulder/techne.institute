import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return json({ ok: false, error: 'Missing auth' }, 401)

  const token = auth.slice(7)
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Verify caller identity
  const { data: { user }, error: authErr } = await db.auth.getUser(token)
  if (authErr || !user) return json({ ok: false, error: 'Invalid token' }, 401)

  // Require steward
  const { data: caller } = await db
    .from('participants')
    .select('id, participant_type')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!caller || caller.participant_type !== 'steward')
    return json({ ok: false, error: 'Steward access required' }, 403)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* no body */ }
  const { action } = body

  // ── list_entries ─────────────────────────────────────────────────────────────
  if (action === 'list_entries') {
    const statusFilter = body.status_filter as string | undefined
    let query = db
      .from('labor_entries')
      .select(`
        id, date, hours, labor_type, notes, status, approved_by, approved_at, created_at,
        member:member_id ( id, name, display_name, email ),
        rate:fmv_rate_id ( labor_type, hourly_rate, level )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data, error } = await query
    if (error) return json({ ok: false, error: error.message }, 500)
    return json({ ok: true, data })
  }

  // ── review_entry ─────────────────────────────────────────────────────────────
  if (action === 'review_entry') {
    const { entry_id, status } = body as { entry_id: string; status: string }
    if (!['approved', 'rejected'].includes(status))
      return json({ ok: false, error: 'status must be approved or rejected' }, 400)
    if (!entry_id) return json({ ok: false, error: 'entry_id required' }, 400)

    const { data, error } = await db
      .from('labor_entries')
      .update({ status, approved_by: caller.id, approved_at: new Date().toISOString() })
      .eq('id', entry_id)
      .select()
      .single()

    if (error) return json({ ok: false, error: error.message }, 500)
    return json({ ok: true, data })
  }

  // ── list_rates ───────────────────────────────────────────────────────────────
  if (action === 'list_rates') {
    const { data, error } = await db
      .from('fmv_rates')
      .select('id, labor_type, hourly_rate, level, effective_date, notes')
      .is('deprecated_at', null)
      .order('labor_type')

    if (error) return json({ ok: false, error: error.message }, 500)
    return json({ ok: true, data })
  }

  // ── add_rate ─────────────────────────────────────────────────────────────────
  if (action === 'add_rate') {
    const { labor_type, hourly_rate, level, notes } = body as Record<string, string>
    if (!labor_type || !hourly_rate) return json({ ok: false, error: 'labor_type and hourly_rate required' }, 400)

    // Deprecate existing active rate for this craft
    await db
      .from('fmv_rates')
      .update({ deprecated_at: new Date().toISOString() })
      .eq('labor_type', labor_type)
      .is('deprecated_at', null)

    // Insert new rate
    const { data, error } = await db
      .from('fmv_rates')
      .insert({
        labor_type,
        hourly_rate: parseFloat(hourly_rate),
        effective_date: new Date().toISOString().slice(0, 10),
        level: level || null,
        notes: notes || null,
        created_by: caller.id,
      })
      .select()
      .single()

    if (error) return json({ ok: false, error: error.message }, 500)
    return json({ ok: true, data })
  }

  return json({ ok: false, error: `Unknown action: ${action}` }, 400)
})
