/**
 * site-crawler
 *
 * POST {} — trigger a crawl of techne.institute
 *
 * Crawls the public site starting from the sitemap.xml + homepage,
 * follows internal links up to MAX_PAGES, records each page in
 * public.site_pages with title, description, http_status, and
 * whether it already appears in the curated tree (in_tree).
 *
 * Called daily by GitHub Actions (.github/workflows/site-crawl.yml).
 * Requires SUPABASE_SERVICE_ROLE_KEY env var (set automatically in edge functions).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

const BASE = 'https://techne.institute'
const MAX_PAGES = 200
const CRAWL_DELAY_MS = 120

// Paths already in the curated tree/index.html PAGES array (zones 0–4).
// Any path the crawler finds that is NOT in this set → in_tree=false → shown as "Discovered".
const KNOWN_PATHS = new Set([
  '/',
  '/introduction/',
  '/introduction/empire-and-the-people-deck.html',
  '/introduction/the-oldest-design-problem-deck.html',
  '/introduction/what-was-the-web-for-deck.html',
  '/introduction/older-than-the-wire-deck.html',
  '/formation/',
  '/formation/narrative.html',
  '/formation/governance.html',
  '/formation/financial.html',
  '/formation/decisions.html',
  '/formation/open-items.html',
  '/formation/q1-2026.html',
  '/about/',
  '/cooperative/',
  '/membership/',
  '/public-benefit/',
  '/bylaws/',
  '/learn/',
  '/coordination-games.html',
  '/workshop/',
  '/operations/',
  '/vision/',
  '/amplification/',
  '/data-room/',
  '/intranet/',
  '/cloud/',
  '/app/',
  '/design-system/',
  '/pre-read/',
  '/letters/',
  '/tree/',
  '/lunch-presentation/',
])

function normalizeHref(href: string, fromUrl: string): string | null {
  try {
    // Skip anchors, mailto, tel, javascript, external
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('javascript:')) return null

    const url = new URL(href, fromUrl)
    if (url.hostname !== 'techne.institute') return null

    // Normalise trailing slash for directories
    let path = url.pathname
    // Drop query and fragment
    return BASE + path
  } catch {
    return null
  }
}

function extractLinks(html: string, fromUrl: string): string[] {
  const found = new Set<string>()
  const re = /href\s*=\s*["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const normalized = normalizeHref(m[1], fromUrl)
    if (normalized) found.add(normalized)
  }
  return [...found]
}

function extractMeta(html: string): { title: string | null; description: string | null } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const descMatch =
    html.match(/<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+name\s*=\s*["']description["']/i)

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
  }
}

async function parseSitemap(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`)
    if (!res.ok) return []
    const xml = await res.text()
    const re = /<loc>([^<]+)<\/loc>/g
    const urls: string[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) !== null) {
      const u = m[1].trim()
      if (u.startsWith(BASE)) urls.push(u)
    }
    return urls
  } catch {
    return []
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, error: 'POST required' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const visited = new Set<string>()
  const queue: string[] = []
  const results: Array<{
    url: string
    path: string
    title: string | null
    description: string | null
    http_status: number
    in_tree: boolean
  }> = []

  // Seed queue from sitemap + homepage
  const sitemapUrls = await parseSitemap()
  queue.push(BASE + '/')
  for (const u of sitemapUrls) {
    if (!visited.has(u)) queue.push(u)
  }

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const url = queue.shift()!
    if (visited.has(url)) continue
    visited.add(url)

    let status = 0
    let title: string | null = null
    let description: string | null = null
    let html = ''

    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'TechneTreeCrawler/1.0 (+https://techne.institute)' },
      })
      status = res.status
      const ct = res.headers.get('content-type') ?? ''
      if (status === 200 && ct.includes('text/html')) {
        html = await res.text()
        const meta = extractMeta(html)
        title = meta.title
        description = meta.description
        // Enqueue new internal links
        const links = extractLinks(html, url)
        for (const link of links) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link)
          }
        }
      }
    } catch (err) {
      status = 0 // Network error
    }

    const urlObj = new URL(url)
    const path = urlObj.pathname

    results.push({
      url,
      path,
      title,
      description,
      http_status: status,
      in_tree: KNOWN_PATHS.has(path) || KNOWN_PATHS.has(path + '/'),
    })

    if (queue.length > 0) await delay(CRAWL_DELAY_MS)
  }

  // Upsert all results to site_pages
  const now = new Date().toISOString()
  const rows = results.map(r => ({
    ...r,
    last_seen_at: now,
  }))

  // Upsert in batches of 50 to stay within request limits
  let upserted = 0
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const { error } = await supabase
      .from('site_pages')
      .upsert(batch, {
        onConflict: 'url',
        ignoreDuplicates: false,
      })
    if (!error) upserted += batch.length
  }

  const discovered = results.filter(r => !r.in_tree && r.http_status === 200).length

  return json({
    ok: true,
    crawled: results.length,
    upserted,
    discovered,
    timestamp: now,
  })
})
