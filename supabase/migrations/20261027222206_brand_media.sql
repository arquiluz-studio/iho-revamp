-- Inspiration photos for a brand page. Order is the array order saved from the admin.

create table public.brand_media (
  brand_id uuid not null references public.brands (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete cascade,
  sort int not null default 0,
  caption_es text,
  caption_en text,
  primary key (brand_id, media_id)
);

create index brand_media_media_idx on public.brand_media (media_id);

alter table public.brand_media enable row level security;

create trigger audit_row after insert or update or delete on public.brand_media
  for each row execute function private.audit_row();

create policy "Anyone can read media of active brands" on public.brand_media
  for select to anon using (
    exists (select 1 from public.brands b where b.id = brand_id and b.is_active)
  );
create policy "Staff can read brand media" on public.brand_media
  for select to authenticated using ((select private.is_staff()));
create policy "Catalog admins can insert brand media" on public.brand_media
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update brand media" on public.brand_media
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete brand media" on public.brand_media
  for delete to authenticated using ((select private.can_manage_catalog()));
