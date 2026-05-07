import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return Response.json({ ok: false, error: 'Missing auth' }, { headers: corsHeaders, status: 401 })

    const anonClient = createClient(SUPABASE_URL!, ANON_KEY!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) return Response.json({ ok: false, error: 'Unauthorized' }, { headers: corsHeaders, status: 401 })

    const serviceClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })

    // Verify steward role
    const { data: actor, error: actorErr } = await serviceClient
      .from('participants')
      .select('id, participant_type')
      .eq('auth_user_id', user.id)
      .single()
    if (actorErr || !actor) return Response.json({ ok: false, error: 'Participant not found' }, { headers: corsHeaders, status: 404 })
    if (actor.participant_type !== 'steward') return Response.json({ ok: false, error: 'Steward access required' }, { headers: corsHeaders, status: 403 })

    const body = await req.json()
    const { action } = body

    // GET members list
    if (req.method === 'GET' || action === 'list_members') {
      const { data: members, error: mErr } = await serviceClient
        .from('participants')
        .select('id, name, email, participant_type, membership_class, created_at')
        .in('membership_class', [1, 2, 3, 4])
        .order('name')
      if (mErr) return Response.json({ ok: false, error: mErr.message }, { headers: corsHeaders, status: 500 })

      // Get capital account balances
      const { data: accounts } = await serviceClient
        .from('capital_accounts')
        .select('participant_id, book_balance_cents, tax_balance_cents, last_allocation_date')
      const acctMap: Record<string, any> = {}
      for (const a of (accounts || [])) acctMap[a.participant_id] = a

      const enriched = members.map(m => ({
        ...m,
        book_balance_cents: acctMap[m.id]?.book_balance_cents ?? null,
        tax_balance_cents: acctMap[m.id]?.tax_balance_cents ?? null,
        last_allocation_date: acctMap[m.id]?.last_allocation_date ?? null,
      }))
      return Response.json({ ok: true, members: enriched }, { headers: corsHeaders })
    }

    // POST allocation entry
    if (action === 'enter_allocation') {
      const { participant_id, quarter, year, labor_cents, revenue_cents, capital_cents, community_cents, notes } = body
      if (!participant_id || !quarter || !year) {
        return Response.json({ ok: false, error: 'participant_id, quarter, year required' }, { headers: corsHeaders, status: 400 })
      }

      const period_label = `${year}-Q${quarter}`
      const total_cents = (labor_cents || 0) + (revenue_cents || 0) + (capital_cents || 0) + (community_cents || 0)

      // Insert allocation event
      const { data: event, error: evErr } = await serviceClient
        .from('allocation_events')
        .insert({
          participant_id,
          period_label,
          event_type: 'patronage',
          components: { labor: labor_cents || 0, revenue: revenue_cents || 0, capital: capital_cents || 0, community: community_cents || 0 },
          total_cents,
          entered_by: actor.id,
          notes: notes || null,
        })
        .select()
        .single()
      if (evErr) return Response.json({ ok: false, error: evErr.message }, { headers: corsHeaders, status: 500 })

      // Update capital account running balance
      const { data: acct } = await serviceClient
        .from('capital_accounts')
        .select('id, book_balance_cents, tax_balance_cents')
        .eq('participant_id', participant_id)
        .single()

      if (acct) {
        await serviceClient
          .from('capital_accounts')
          .update({
            book_balance_cents: (acct.book_balance_cents || 0) + total_cents,
            tax_balance_cents: (acct.tax_balance_cents || 0) + total_cents,
            last_allocation_date: new Date().toISOString().slice(0, 10),
            updated_at: new Date().toISOString(),
          })
          .eq('id', acct.id)
      } else {
        // Create account if it doesn't exist yet
        await serviceClient
          .from('capital_accounts')
          .insert({
            participant_id,
            book_balance_cents: total_cents,
            tax_balance_cents: total_cents,
            last_allocation_date: new Date().toISOString().slice(0, 10),
          })
      }

      return Response.json({ ok: true, event_id: event.id, period_label, total_cents }, { headers: corsHeaders })
    }

    // DELETE allocation event (undo)
    if (action === 'delete_allocation') {
      const { event_id } = body
      if (!event_id) return Response.json({ ok: false, error: 'event_id required' }, { headers: corsHeaders, status: 400 })

      const { data: ev } = await serviceClient
        .from('allocation_events')
        .select('participant_id, total_cents')
        .eq('id', event_id)
        .single()
      if (!ev) return Response.json({ ok: false, error: 'Event not found' }, { headers: corsHeaders, status: 404 })

      // Reverse the balance
      const { data: acct } = await serviceClient
        .from('capital_accounts')
        .select('id, book_balance_cents, tax_balance_cents')
        .eq('participant_id', ev.participant_id)
        .single()
      if (acct) {
        await serviceClient
          .from('capital_accounts')
          .update({
            book_balance_cents: (acct.book_balance_cents || 0) - (ev.total_cents || 0),
            tax_balance_cents: (acct.tax_balance_cents || 0) - (ev.total_cents || 0),
            updated_at: new Date().toISOString(),
          })
          .eq('id', acct.id)
      }

      await serviceClient.from('allocation_events').delete().eq('id', event_id)
      return Response.json({ ok: true, deleted_event_id: event_id }, { headers: corsHeaders })
    }

    return Response.json({ ok: false, error: 'Unknown action' }, { headers: corsHeaders, status: 400 })
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { headers: corsHeaders, status: 500 })
  }
})
