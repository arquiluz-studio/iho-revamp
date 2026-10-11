-- Per-country hero copy for static pages (group, projects, brands, …).
-- Home stays on country_settings. Empty columns fall back to the built-in copy.

create table public.country_pages (
  country_code text not null references public.countries (code) on delete cascade,
  page_key text not null check (page_key in (
    'group', 'projects', 'brands', 'designers', 'solutions', 'spaces', 'events', 'products', 'contact', 'privacy'
  )),
  hero_eyebrow_es text,
  hero_eyebrow_en text,
  hero_title_es text,
  hero_title_en text,
  hero_intro_es text,
  hero_intro_en text,
  hero_extra_es text,
  hero_extra_en text,
  hero_image_media_id uuid references public.media_assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (country_code, page_key)
);

create index country_pages_hero_image_idx on public.country_pages (hero_image_media_id);

alter table public.country_pages enable row level security;

create trigger set_updated_at before update on public.country_pages
  for each row execute function private.set_updated_at();

create trigger audit_row after insert or update or delete on public.country_pages
  for each row execute function private.audit_row();

create policy "Anyone can read country pages" on public.country_pages
  for select to anon, authenticated using (true);
create policy "Country admins can insert pages" on public.country_pages
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update pages" on public.country_pages
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete pages" on public.country_pages
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- Include page_key so each static page has its own audit row id (country_code:page_key).
create or replace function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_diff jsonb;
  v_row_id text;
  v_country text;
begin
  if tg_op = 'UPDATE' then
    select
      jsonb_build_object(
        'old', coalesce(jsonb_object_agg(o.key, o.value) filter (where o.key is not null), '{}'::jsonb),
        'new', coalesce(jsonb_object_agg(o.key, v_new -> o.key) filter (where o.key is not null), '{}'::jsonb)
      )
    into v_diff
    from jsonb_each(v_old) o
    where o.value is distinct from v_new -> o.key and o.key <> 'updated_at';
    if v_diff = '{"old": {}, "new": {}}'::jsonb then
      return null;
    end if;
  elsif tg_op = 'INSERT' then
    v_diff := jsonb_build_object('new', v_new);
  else
    v_diff := jsonb_build_object('old', v_old);
  end if;

  v_row_id := coalesce(
    v_row ->> 'id',
    v_row ->> 'code',
    nullif(concat_ws(':', v_row ->> 'country_code', v_row ->> 'page_key', v_row ->> 'project_id', v_row ->> 'event_id',
                     v_row ->> 'product_id', v_row ->> 'variant_id',
                     v_row ->> 'brand_id', v_row ->> 'media_id', v_row ->> 'user_id', v_row ->> 'business_line_id',
                     v_row ->> 'sector_id'), '')
  );
  v_country := coalesce(
    v_row ->> 'country_code',
    case tg_table_name
      when 'countries' then v_row ->> 'code'
      when 'variant_prices' then (
        select p.country_code
        from public.product_variants v
        join public.products p on p.id = v.product_id
        where v.id = (v_row ->> 'variant_id')::uuid
      )
      when 'product_variants' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_media' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_sectors' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_designers' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'event_products' then (
        select e.country_code from public.events e where e.id = (v_row ->> 'event_id')::uuid
      )
    end
  );

  insert into public.audit_log (user_id, country_code, table_name, row_id, action, diff)
  values ((select auth.uid()), v_country, tg_table_name, v_row_id, lower(tg_op), v_diff);
  return null;
end;
$$;

revoke all on function private.audit_row() from public;
