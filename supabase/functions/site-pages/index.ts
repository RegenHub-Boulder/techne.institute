/**
 * site-pages
 *
 * GET — returns pages discovered by the crawler that are NOT in the
 *        curated tree (in_tree=false) and returned HTTP 200.
 *
 * Public endpoint — no Authorization header required.
 * Used by tree/index.html to populate the "Discovered" zone (zone 5).
 *
 * Response shape:
 * {
 *   ok: true,
 *   pages: [
 *     { url, path, title, description, discovered_at }
 *   ]
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Cache-Control': 'public, max-age=3600',
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'GET') return json({ ok: false, error: 'GET required' }, 405)

  // Use anon key — RLS policy "Public read" permits SELECT without auth
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const { data, error } = await supabase
    .from('site_pages')
    .select('url, path, title, description, discovered_at')
    .eq('in_tree', false)
    .eq('http_status', 200)
    .order('discovered_at', { ascending: false })
    .limit(100)

  if (error) {
    return json({ ok: false, error: error.message }, 500)
  }

  return json({ ok: true, pages: data ?? [] })
})
