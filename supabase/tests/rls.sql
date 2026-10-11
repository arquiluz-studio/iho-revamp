-- RLS test suite. Runs inside a transaction and rolls back, so it can be executed against any database
-- (MCP execute_sql, psql, or `supabase db query`). Any failed assertion raises an exception naming the case.
--
-- Users: super (super_admin), catalog (catalog_admin), mx_admin, mx_editor, pa_editor, pa_viewer, outsider (no roles).

begin;

insert into public.countries (code, name_es, currency, timezone, is_hq) values
  ('mx', 'México', 'MXN', 'America/Mexico_City', true),
  ('pa', 'Panamá', 'USD', 'America/Panama', false)
on conflict (code) do nothing;

insert into auth.users (id, email, aud, role) values
  ('00000000-0000-4000-8000-000000000001', 'super@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000002', 'catalog@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000003', 'mx-admin@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000004', 'mx-editor@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000005', 'pa-editor@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000006', 'pa-viewer@test.iho', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-000000000007', 'outsider@test.iho', 'authenticated', 'authenticated');

update public.profiles set global_role = 'super_admin' where id = '00000000-0000-4000-8000-000000000001';
update public.profiles set global_role = 'catalog_admin' where id = '00000000-0000-4000-8000-000000000002';

insert into public.user_country_roles (user_id, country_code, role) values
  ('00000000-0000-4000-8000-000000000003', 'mx', 'admin'),
  ('00000000-0000-4000-8000-000000000004', 'mx', 'editor'),
  ('00000000-0000-4000-8000-000000000005', 'pa', 'editor'),
  ('00000000-0000-4000-8000-000000000006', 'pa', 'viewer');

insert into public.events (id, country_code, slug, title_es, starts_at, status) values
  ('10000000-0000-4000-8000-000000000001', 'mx', 'test-mx-published', 'MX publicado', now() + interval '10 days', 'published'),
  ('10000000-0000-4000-8000-000000000002', 'mx', 'test-mx-draft', 'MX borrador', now() + interval '10 days', 'draft'),
  ('10000000-0000-4000-8000-000000000003', 'pa', 'test-pa-draft', 'PA borrador', now() + interval '10 days', 'draft');

insert into public.event_registrations (event_id, full_name, email, consent_privacy) values
  ('10000000-0000-4000-8000-000000000001', 'Ana MX', 'ana@test.iho', true);

insert into public.contact_leads (country_code, first_name, email) values
  ('mx', 'Lead MX', 'lead-mx@test.iho'),
  ('pa', 'Lead PA', 'lead-pa@test.iho');

insert into public.brands (id, slug, name) values
  ('20000000-0000-4000-8000-000000000001', 'test-brand', 'Test Brand');

-- anon ----------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  if (select count(*) from public.events where slug like 'test-%') <> 1 then
    raise exception 'anon: should only see the published test event';
  end if;
  if exists (select 1 from public.contact_leads) then raise exception 'anon: must not read leads'; end if;
  if exists (select 1 from public.event_registrations) then raise exception 'anon: must not read registrations'; end if;
  if exists (select 1 from public.profiles) then raise exception 'anon: must not read profiles'; end if;
  begin
    insert into public.contact_leads (country_code, first_name, email) values ('mx', 'Spam', 'spam@test.iho');
    raise exception 'anon: lead insert must be rejected';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.event_registrations (event_id, full_name, email, consent_privacy)
      values ('10000000-0000-4000-8000-000000000001', 'Spam', 'spam@test.iho', true);
    raise exception 'anon: registration insert must be rejected';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- pa_editor: nothing from mx ---------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
do $$
declare n int;
begin
  if exists (select 1 from public.events where slug = 'test-mx-draft') then raise exception 'pa_editor: must not read mx drafts'; end if;
  if not exists (select 1 from public.events where slug = 'test-pa-draft') then raise exception 'pa_editor: should read pa drafts'; end if;
  if exists (select 1 from public.contact_leads where country_code = 'mx') then raise exception 'pa_editor: must not read mx leads'; end if;
  if not exists (select 1 from public.contact_leads where country_code = 'pa') then raise exception 'pa_editor: should read pa leads'; end if;
  if exists (select 1 from public.event_registrations) then raise exception 'pa_editor: must not read mx registrations'; end if;

  update public.events set title_es = 'hacked' where slug = 'test-mx-published';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'pa_editor: must not update mx events'; end if;
  delete from public.events where country_code = 'mx';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'pa_editor: must not delete mx events'; end if;
  begin
    insert into public.events (country_code, slug, title_es, starts_at) values ('mx', 'test-intrusion', 'x', now());
    raise exception 'pa_editor: must not insert mx events';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.events set country_code = 'mx' where slug = 'test-pa-draft';
    raise exception 'pa_editor: must not move a pa event to mx';
  exception when insufficient_privilege then null;
  end;

  insert into public.events (country_code, slug, title_es, starts_at) values ('pa', 'test-pa-new', 'Nuevo', now());
  if (select timezone from public.events where slug = 'test-pa-new') <> 'America/Panama' then
    raise exception 'events: timezone should default to the country timezone';
  end if;

  begin
    insert into public.user_country_roles (user_id, country_code, role)
      values ('00000000-0000-4000-8000-000000000007', 'pa', 'editor');
    raise exception 'pa_editor: must not grant roles';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.offices (country_code, city, address) values ('pa', 'X', 'Y');
    raise exception 'pa_editor: offices require country admin';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.brands (slug, name) values ('test-brand-2', 'Nope');
    raise exception 'pa_editor: brands are global catalog';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set global_role = 'super_admin' where id = '00000000-0000-4000-8000-000000000005';
    raise exception 'pa_editor: must not self-promote';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- pa_viewer: read only -----------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
do $$
declare n int;
begin
  if not exists (select 1 from public.contact_leads where country_code = 'pa') then raise exception 'pa_viewer: should read pa leads'; end if;
  update public.contact_leads set status = 'contacted' where country_code = 'pa';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'pa_viewer: must not update leads'; end if;
  begin
    insert into public.events (country_code, slug, title_es, starts_at) values ('pa', 'test-viewer', 'x', now());
    raise exception 'pa_viewer: must not insert events';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- mx_admin: manages mx users, not pa ----------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$
begin
  insert into public.user_country_roles (user_id, country_code, role)
    values ('00000000-0000-4000-8000-000000000007', 'mx', 'viewer');
  begin
    insert into public.user_country_roles (user_id, country_code, role)
      values ('00000000-0000-4000-8000-000000000003', 'pa', 'admin');
    raise exception 'mx_admin: must not grant itself roles in pa';
  exception when insufficient_privilege then null;
  end;
  if not exists (select 1 from public.profiles where id = '00000000-0000-4000-8000-000000000004') then
    raise exception 'mx_admin: should see mx users';
  end if;
  if exists (select 1 from public.profiles where id = '00000000-0000-4000-8000-000000000005') then
    raise exception 'mx_admin: must not see pa-only users';
  end if;
  insert into public.offices (country_code, city, address) values ('mx', 'Test', 'Test 123');
  if not exists (select 1 from public.event_registrations) then raise exception 'mx_admin: should read mx registrations'; end if;
  if not exists (select 1 from public.audit_log where country_code = 'mx') then raise exception 'mx_admin: should read mx audit log'; end if;
  if exists (select 1 from public.audit_log where country_code = 'pa') then raise exception 'mx_admin: must not read pa audit log'; end if;
end $$;
reset role;

-- mx_editor: content yes, settings / prices no -----------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
do $$
declare n int;
begin
  update public.events set title_es = 'Editado' where slug = 'test-mx-draft';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'mx_editor: should update mx events'; end if;
  update public.event_registrations set status = 'confirmed';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'mx_editor: should update mx registrations'; end if;
  begin
    insert into public.country_settings (country_code) values ('mx');
    raise exception 'mx_editor: country settings require admin';
  exception when insufficient_privilege then null;
  end;
  delete from public.contact_leads where country_code = 'mx';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'mx_editor: deleting leads requires admin'; end if;
end $$;
reset role;

-- catalog_admin: global catalog only ------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$
declare n int;
begin
  update public.brands set name = 'Test Brand 2' where slug = 'test-brand';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'catalog_admin: should update brands'; end if;
  insert into public.media_assets (country_code, kind) values (null, 'brand_logo');
  if exists (select 1 from public.contact_leads) then raise exception 'catalog_admin: must not read leads'; end if;
  begin
    insert into public.events (country_code, slug, title_es, starts_at) values ('mx', 'test-catalog', 'x', now());
    raise exception 'catalog_admin: must not create country content';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- outsider: authenticated without roles = anon visibility --------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000007","role":"authenticated"}', true);
do $$
begin
  -- The outsider got an mx viewer role from mx_admin above, so it now reads mx leads but nothing from pa.
  if exists (select 1 from public.contact_leads where country_code = 'pa') then raise exception 'outsider: must not read pa leads'; end if;
  if exists (select 1 from public.events where slug = 'test-pa-draft') then raise exception 'outsider: must not read pa drafts'; end if;
end $$;
reset role;

-- super_admin: everything ------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.contact_leads) < 2 then raise exception 'super_admin: should read every lead'; end if;
  update public.profiles set global_role = 'catalog_admin' where id = '00000000-0000-4000-8000-000000000007';
  if (select global_role from public.profiles where id = '00000000-0000-4000-8000-000000000007') <> 'catalog_admin' then
    raise exception 'super_admin: should change global roles';
  end if;
  insert into public.countries (code, name_es, currency, timezone) values ('zz', 'Test', 'USD', 'UTC');
end $$;
reset role;

-- catalog: one product per country, cost hidden, sale price public only when purchasable --
insert into public.catalog_brands (id, country_code, name, brand_id) values
  ('21000000-0000-4000-8000-000000000001', 'mx', 'Test Brand', '20000000-0000-4000-8000-000000000001'),
  ('21000000-0000-4000-8000-000000000002', 'pa', 'Test Brand', '20000000-0000-4000-8000-000000000001');
insert into public.products (id, country_code, catalog_brand_id, slug, name_es, status, is_visible, is_purchasable) values
  ('30000000-0000-4000-8000-000000000001', 'mx', '21000000-0000-4000-8000-000000000001', 'test-product', 'Producto', 'published', true, false),
  ('30000000-0000-4000-8000-000000000002', 'pa', '21000000-0000-4000-8000-000000000002', 'test-product', 'Producto', 'published', true, true),
  ('30000000-0000-4000-8000-000000000003', 'mx', '21000000-0000-4000-8000-000000000001', 'test-hidden', 'Oculto', 'published', false, false);
update public.variant_prices vp
set price = case when p.country_code = 'mx' then 1000 else 50 end,
    cost = 10,
    currency = case when p.country_code = 'mx' then 'MXN' else 'USD' end
from public.product_variants v
join public.products p on p.id = v.product_id
where vp.variant_id = v.id and p.slug = 'test-product';

do $$
begin
  if (select count(*) from public.product_variants where product_id = '30000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'catalog: a new product should get a default variant';
  end if;
  if (select count(*) from public.variant_prices vp join public.product_variants v on v.id = vp.variant_id where v.product_id = '30000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'catalog: a new variant should get a price row';
  end if;
  begin
    delete from public.product_variants where product_id = '30000000-0000-4000-8000-000000000001';
    raise exception 'catalog: deleting the last variant must be rejected';
  exception when check_violation then null;
  end;
  begin
    insert into public.event_products (event_id, product_id)
    values ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002');
    raise exception 'catalog: an event cannot feature another country''s product';
  exception when check_violation then null;
  end;
end $$;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  if exists (select 1 from public.variant_prices) then raise exception 'anon: must not read cost or price rows'; end if;
  if (select amount from public.v_country_catalog where slug = 'test-product' and country_code = 'pa') is distinct from 50 then
    raise exception 'anon: should see the price of a purchasable product';
  end if;
  if (select amount from public.v_country_catalog where slug = 'test-product' and country_code = 'mx') is not null then
    raise exception 'anon: must not see the price of a quote-only product';
  end if;
  if exists (select 1 from public.products where country_code = 'mx' and is_visible = false) then
    raise exception 'anon: must not read hidden products';
  end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
do $$
declare n int;
begin
  if exists (
    select 1 from public.variant_prices vp
    join public.product_variants v on v.id = vp.variant_id
    join public.products p on p.id = v.product_id
    where p.country_code = 'mx'
  ) then raise exception 'pa_editor: must not read mx prices'; end if;
  update public.products set is_visible = false where country_code = 'mx';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'pa_editor: must not change mx products'; end if;
  begin
    insert into public.products (country_code, catalog_brand_id, slug, name_es)
    values ('pa', '21000000-0000-4000-8000-000000000002', 'test-nope', 'x');
    raise exception 'pa_editor: products require country admin';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$
declare n int;
begin
  update public.products set is_purchasable = true where country_code = 'mx' and id = '30000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'mx_admin: should change mx products'; end if;
  update public.variant_prices vp
  set price = 900
  from public.product_variants v
  where v.id = vp.variant_id and v.product_id = '30000000-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'mx_admin: should change mx prices'; end if;
  begin
    insert into public.products (country_code, catalog_brand_id, slug, name_es)
    values ('pa', '21000000-0000-4000-8000-000000000002', 'test-nope-pa', 'x');
    raise exception 'mx_admin: must not create pa products';
  exception when insufficient_privilege then null;
  end;
  if not exists (select 1 from public.audit_log where table_name = 'variant_prices' and country_code = 'mx') then
    raise exception 'mx_admin: price changes should appear in the mx audit log';
  end if;
  if exists (
    select 1 from public.variant_prices vp
    join public.product_variants v on v.id = vp.variant_id
    join public.products p on p.id = v.product_id
    where p.country_code = 'pa'
  ) then raise exception 'mx_admin: must not read pa prices'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$
begin
  begin
    insert into public.products (country_code, catalog_brand_id, slug, name_es)
    values ('mx', '21000000-0000-4000-8000-000000000001', 'test-catalog-product', 'Nuevo');
    raise exception 'catalog_admin: products belong to country admins';
  exception when insufficient_privilege then null;
  end;
  if exists (select 1 from public.variant_prices) then raise exception 'catalog_admin: must not read costs or prices'; end if;
end $$;
reset role;

-- event registration: capacity → waitlist, duplicates, closing time, service role only ------------------
insert into public.events (id, country_code, slug, title_es, starts_at, status, registration_enabled, capacity, access_type) values
  ('10000000-0000-4000-8000-0000000000aa', 'mx', 'test-capacity', 'Cupo', now() + interval '5 days', 'published', true, 3, 'registration_required');

do $$
declare s public.registration_status;
begin
  select registration_status into s from public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'A', null, 'A@test.iho', '1', 'general', 1, 'es', false);
  if s <> 'confirmed' then raise exception 'registration: first should be confirmed'; end if;
  select registration_status into s from public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'B', null, 'b@test.iho', '1', 'general', 1, 'es', false);
  if s <> 'waitlist' then raise exception 'registration: 2 + 2 seats > 3 should be waitlisted'; end if;
  select registration_status into s from public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'C', null, 'c@test.iho', '1', 'general', 0, 'es', false);
  if s <> 'confirmed' then raise exception 'registration: 2 + 1 seats = 3 should fit'; end if;
  begin
    perform public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'A2', null, 'a@TEST.iho', '1', 'general', 0, 'es', false);
    raise exception 'registration: duplicate email should fail';
  exception when unique_violation then null;
  end;
  update public.events set registration_closes_at = now() - interval '1 hour' where id = '10000000-0000-4000-8000-0000000000aa';
  begin
    perform public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'D', null, 'd@test.iho', '1', 'general', 0, 'es', false);
    raise exception 'registration: closed registration should fail';
  exception when raise_exception then
    if sqlerrm <> 'registration_closed' then raise; end if;
  end;
end $$;

set local role anon;
do $$
begin
  perform public.register_for_event('10000000-0000-4000-8000-0000000000aa', 'X', null, 'x@test.iho', '1', 'general', 0, 'es', false);
  raise exception 'anon: must not register directly';
exception when insufficient_privilege then null;
end $$;
reset role;

rollback;
