-- Global hero copy for every static page, including home.
-- A country uses this row unless country_page_choices.uses_global is false.
-- Empty columns still fall back to the built-in copy.

create table public.site_pages (
  page_key text primary key check (page_key in (
    'home', 'group', 'projects', 'brands', 'designers', 'solutions', 'spaces', 'events', 'products', 'contact', 'privacy'
  )),
  hero_eyebrow_es text,
  hero_eyebrow_en text,
  hero_title_es text,
  hero_title_en text,
  hero_subtitle_es text,
  hero_subtitle_en text,
  hero_intro_es text,
  hero_intro_en text,
  hero_extra_es text,
  hero_extra_en text,
  hero_image_media_id uuid references public.media_assets (id) on delete set null,
  hero_video_media_id uuid references public.media_assets (id) on delete set null,
  contact_image_media_id uuid references public.media_assets (id) on delete set null,
  seo_title_es text,
  seo_title_en text,
  seo_description_es text,
  seo_description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_pages_hero_image_idx on public.site_pages (hero_image_media_id);
create index site_pages_hero_video_idx on public.site_pages (hero_video_media_id);
create index site_pages_contact_image_idx on public.site_pages (contact_image_media_id);

alter table public.site_pages enable row level security;

create trigger set_updated_at before update on public.site_pages
  for each row execute function private.set_updated_at();
create trigger audit_row after insert or update or delete on public.site_pages
  for each row execute function private.audit_row();

create policy "Anyone can read site pages" on public.site_pages
  for select to anon, authenticated using (true);
create policy "Super admins can insert site pages" on public.site_pages
  for insert to authenticated with check ((select private.is_super_admin()));
create policy "Super admins can update site pages" on public.site_pages
  for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));
create policy "Super admins can delete site pages" on public.site_pages
  for delete to authenticated using ((select private.is_super_admin()));

-- Missing row means the country uses the global page.
create table public.country_page_choices (
  country_code text not null references public.countries (code) on delete cascade,
  page_key text not null check (page_key in (
    'home', 'group', 'projects', 'brands', 'designers', 'solutions', 'spaces', 'events', 'products', 'contact', 'privacy'
  )),
  uses_global boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (country_code, page_key)
);

alter table public.country_page_choices enable row level security;

create trigger set_updated_at before update on public.country_page_choices
  for each row execute function private.set_updated_at();
create trigger audit_row after insert or update or delete on public.country_page_choices
  for each row execute function private.audit_row();

create policy "Anyone can read page choices" on public.country_page_choices
  for select to anon, authenticated using (true);
create policy "Country admins can insert page choices" on public.country_page_choices
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update page choices" on public.country_page_choices
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete page choices" on public.country_page_choices
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));
