/**
 * labor-fmv-report
 *
 * GET  ?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
 *   → caller's own report (member or steward)
 *
 * POST { member_id, from_date, to_date }
 *   → any member's report (steward only)
 *
 * Returns:
 * {
 *   ok: true,
 *   data: {
 *     member: { id, name, email },
 *     period: { from_date, to_date },
 *     entries: [ { id, date, labor_type, hours, hourly_rate, total_fmv, status, tax_class } ],
 *     totals: { hours, fmv, approved_hours, approved_fmv },
 *     by_craft: { [labor_type]: { hours, fmv, approved_hours, approved_fmv } },
 *   }
 * }
 *
 * tax_class is a display scaffold only — not legal advice.
 * Rules (conservative, configurable):
 *   approved entry, no venture_id → "Patronage Dividend"
 *   approved entry, venture_id present → "Review Required (W-2 / 1099)"
 *   draft / submitted → "Pending"
 *   rejected → "Rejected"
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

function taxClass(entry: Record<string, unknown>): string {
  if (entry.status === 'rejected') return 'Rejected'
  if (entry.status === 'draft' || entry.status === 'submitted') return 'Pending Approval'
  if (entry.status === 'approved') {
    return entry.venture_id ? 'Review Required (W-2 / 1099)' : 'Patronage Dividend'
  }
  return '—'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return json({ ok: false, error: 'Missing auth' }, 401)

  const token = auth.slice(7)
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Verify caller
  const { data: { user }, error: authErr } = await db.auth.getUser(token)
  if (authErr || !user) return json({ ok: false, error: 'Invalid token' }, 401)

  const { data: caller } = await db
    .from('participants')
    .select('id, participant_type, name, display_name, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!caller) return json({ ok: false, error: 'Participant not found' }, 403)

  const isSteward = caller.participant_type === 'steward'

  // Parse params
  let memberId: string
  let fromDate: string
  let toDate: string

  if (req.method === 'POST') {
    let body: Record<string, string> = {}
    try { body = await req.json() } catch { /* no body */ }

    // Only stewards can query other members
    if (body.member_id && body.member_id !== caller.id && !isSteward)
      return json({ ok: false, error: 'Steward access required to query other members' }, 403)

    memberId = body.member_id || caller.id
    fromDate = body.from_date || ''
    toDate   = body.to_date   || ''
  } else {
    const url = new URL(req.url)
    memberId = isSteward && url.searchParams.get('member_id')
      ? url.searchParams.get('member_id')!
      : caller.id
    fromDate = url.searchParams.get('from_date') || ''
    toDate   = url.searchParams.get('to_date')   || ''
  }

  // Fetch member info
  const { data: member } = await db
    .from('participants')
    .select('id, name, display_name, email')
    .eq('id', memberId)
    .maybeSingle()

  if (!member) return json({ ok: false, error: 'Member not found' }, 404)

  // Build entries query
  let query = db
    .from('labor_entries')
    .select('id, date, labor_type, hours, venture_id, notes, status, approved_at, fmv_rate_id, fmv_rates!fmv_rate_id(hourly_rate)')
    .eq('member_id', memberId)
    .order('date', { ascending: false })

  if (fromDate) query = query.gte('date', fromDate)
  if (toDate)   query = query.lte('date', toDate)

  const { data: rawEntries, error: qErr } = await query
  if (qErr) return json({ ok: false, error: qErr.message }, 500)

  // Shape entries
  const entries = (rawEntries || []).map((e: Record<string, unknown>) => {
    const rate = (e.fmv_rates as Record<string, unknown> | null)?.hourly_rate as number ?? 0
    const hours = parseFloat(String(e.hours || 0))
    const totalFmv = parseFloat((hours * rate).toFixed(2))
    return {
      id: e.id,
      date: e.date,
      labor_type: e.labor_type,
      hours,
      hourly_rate: rate,
      total_fmv: totalFmv,
      status: e.status,
      venture_id: e.venture_id,
      notes: e.notes,
      approved_at: e.approved_at,
      tax_class: taxClass(e),
    }
  })

  // Aggregate totals
  const totals = entries.reduce(
    (acc, e) => {
      acc.hours     += e.hours
      acc.fmv       += e.total_fmv
      if (e.status === 'approved') {
        acc.approved_hours += e.hours
        acc.approved_fmv   += e.total_fmv
      }
      return acc
    },
    { hours: 0, fmv: 0, approved_hours: 0, approved_fmv: 0 },
  )
  totals.fmv          = parseFloat(totals.fmv.toFixed(2))
  totals.approved_fmv = parseFloat(totals.approved_fmv.toFixed(2))

  // By-craft breakdown
  const byCraft: Record<string, { hours: number; fmv: number; approved_hours: number; approved_fmv: number }> = {}
  for (const e of entries) {
    const craft = String(e.labor_type || 'unknown')
    if (!byCraft[craft]) byCraft[craft] = { hours: 0, fmv: 0, approved_hours: 0, approved_fmv: 0 }
    byCraft[craft].hours += e.hours
    byCraft[craft].fmv   += e.total_fmv
    if (e.status === 'approved') {
      byCraft[craft].approved_hours += e.hours
      byCraft[craft].approved_fmv   += e.total_fmv
    }
  }
  for (const c of Object.values(byCraft)) {
    c.fmv          = parseFloat(c.fmv.toFixed(2))
    c.approved_fmv = parseFloat(c.approved_fmv.toFixed(2))
  }

  return json({
    ok: true,
    data: {
      member: { id: member.id, name: member.display_name || member.name, email: member.email },
      period: { from_date: fromDate || null, to_date: toDate || null },
      entries,
      totals,
      by_craft: byCraft,
    },
  })
})
