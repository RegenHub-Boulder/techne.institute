-- site_pages: discovered pages from daily crawler
-- Populated by supabase/functions/site-crawler
-- Read publicly via supabase/functions/site-pages (no auth required)

create table if not exists public.site_pages (
  url          text primary key,
  path         text not null,
  title        text,
  description  text,
  http_status  integer,
  in_tree      boolean not null default false,
  discovered_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

comment on table public.site_pages is
  'Pages discovered by the daily site crawler. in_tree=true means the page already '
  'appears in the curated tree/index.html PAGES array.';

alter table public.site_pages enable row level security;

create policy "Public read"
  on public.site_pages for select
  using (true);

-- Index for the common query: discovered pages not yet in the tree
create index if not exists site_pages_discovered_idx
  on public.site_pages (in_tree, http_status, discovered_at desc)
  where in_tree = false;
