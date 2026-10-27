-- Optional photographic cover for a brand. The logo stays the wordmark used elsewhere.
alter table public.brands
  add column cover_media_id uuid references public.media_assets (id) on delete set null;

create index brands_cover_idx on public.brands (cover_media_id);
