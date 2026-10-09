-- Row level security policies.
--  * anon: published / active rows only.
--  * Country tables: read with viewer+, write with editor+ (admin+ for settings, offices, country brands).
--  * Global catalog (brands, taxonomies, global media): write with catalog_admin or super_admin.
--  * contact_leads / event_registrations: no anon insert. Public forms insert with the service role after validation.

-- countries -----------------------------------------------------------------
create policy "Anyone can read active countries" on public.countries
  for select to anon using (is_active);
create policy "Staff can read all countries" on public.countries
  for select to authenticated using (is_active or (select private.is_staff()));
create policy "Super admins can insert countries" on public.countries
  for insert to authenticated with check ((select private.is_super_admin()));
create policy "Super admins can update countries" on public.countries
  for update to authenticated using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can delete countries" on public.countries
  for delete to authenticated using ((select private.is_super_admin()));

-- profiles ------------------------------------------------------------------
create policy "Users can read own profile, admins their country users" on public.profiles
  for select to authenticated using (
    id = (select auth.uid())
    or (select private.is_super_admin())
    or exists (
      select 1 from public.user_country_roles r
      where r.user_id = profiles.id and private.has_country_role(r.country_code, 'admin')
    )
  );
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_super_admin()))
  with check (id = (select auth.uid()) or (select private.is_super_admin()));

-- user_country_roles --------------------------------------------------------
create policy "Users can read own roles, admins their country roles" on public.user_country_roles
  for select to authenticated using (user_id = (select auth.uid()) or private.has_country_role(country_code, 'admin'));
create policy "Country admins can grant roles" on public.user_country_roles
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can change roles" on public.user_country_roles
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can revoke roles" on public.user_country_roles
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- media_assets --------------------------------------------------------------
create policy "Anyone can read ready media" on public.media_assets
  for select to anon using (processing_status = 'ready');
create policy "Staff can read media" on public.media_assets
  for select to authenticated using (
    processing_status = 'ready'
    or (country_code is null and (select private.is_staff()))
    or private.has_country_role(country_code, 'viewer')
  );
create policy "Editors can insert media" on public.media_assets
  for insert to authenticated with check (
    case when country_code is null then (select private.can_manage_catalog()) else private.has_country_role(country_code, 'editor') end
  );
create policy "Editors can update media" on public.media_assets
  for update to authenticated
  using (case when country_code is null then (select private.can_manage_catalog()) else private.has_country_role(country_code, 'editor') end)
  with check (case when country_code is null then (select private.can_manage_catalog()) else private.has_country_role(country_code, 'editor') end);
create policy "Editors can delete media" on public.media_assets
  for delete to authenticated using (
    case when country_code is null then (select private.can_manage_catalog()) else private.has_country_role(country_code, 'editor') end
  );

-- country_settings (admin+) -------------------------------------------------
create policy "Anyone can read country settings" on public.country_settings
  for select to anon, authenticated using (true);
create policy "Country admins can insert settings" on public.country_settings
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update settings" on public.country_settings
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete settings" on public.country_settings
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- offices (admin+) ----------------------------------------------------------
create policy "Anyone can read offices" on public.offices
  for select to anon, authenticated using (true);
create policy "Country admins can insert offices" on public.offices
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update offices" on public.offices
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete offices" on public.offices
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- social_accounts (editor+) -------------------------------------------------
create policy "Anyone can read active social accounts" on public.social_accounts
  for select to anon using (is_active);
create policy "Staff can read social accounts" on public.social_accounts
  for select to authenticated using (is_active or private.has_country_role(country_code, 'viewer'));
create policy "Editors can insert social accounts" on public.social_accounts
  for insert to authenticated with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can update social accounts" on public.social_accounts
  for update to authenticated
  using (private.has_country_role(country_code, 'editor'))
  with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can delete social accounts" on public.social_accounts
  for delete to authenticated using (private.has_country_role(country_code, 'editor'));

-- team_members (editor+) ----------------------------------------------------
create policy "Anyone can read published team members" on public.team_members
  for select to anon using (is_published);
create policy "Staff can read team members" on public.team_members
  for select to authenticated using (is_published or private.has_country_role(country_code, 'viewer'));
create policy "Editors can insert team members" on public.team_members
  for insert to authenticated with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can update team members" on public.team_members
  for update to authenticated
  using (private.has_country_role(country_code, 'editor'))
  with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can delete team members" on public.team_members
  for delete to authenticated using (private.has_country_role(country_code, 'editor'));

-- taxonomies (global catalog) -----------------------------------------------
create policy "Anyone can read business lines" on public.business_lines
  for select to anon, authenticated using (true);
create policy "Catalog admins can insert business lines" on public.business_lines
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update business lines" on public.business_lines
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete business lines" on public.business_lines
  for delete to authenticated using ((select private.can_manage_catalog()));

create policy "Anyone can read sectors" on public.sectors
  for select to anon, authenticated using (true);
create policy "Catalog admins can insert sectors" on public.sectors
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update sectors" on public.sectors
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete sectors" on public.sectors
  for delete to authenticated using ((select private.can_manage_catalog()));

-- brands (global catalog) ---------------------------------------------------
create policy "Anyone can read active brands" on public.brands
  for select to anon using (is_active);
create policy "Staff can read all brands" on public.brands
  for select to authenticated using (is_active or (select private.is_staff()));
create policy "Catalog admins can insert brands" on public.brands
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update brands" on public.brands
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete brands" on public.brands
  for delete to authenticated using ((select private.can_manage_catalog()));

create policy "Anyone can read brand business lines" on public.brand_business_lines
  for select to anon, authenticated using (true);
create policy "Catalog admins can insert brand business lines" on public.brand_business_lines
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete brand business lines" on public.brand_business_lines
  for delete to authenticated using ((select private.can_manage_catalog()));

-- country_brands (admin+) ---------------------------------------------------
create policy "Anyone can read visible country brands" on public.country_brands
  for select to anon using (is_visible);
create policy "Staff can read country brands" on public.country_brands
  for select to authenticated using (is_visible or private.has_country_role(country_code, 'viewer'));
create policy "Country admins can insert country brands" on public.country_brands
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update country brands" on public.country_brands
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete country brands" on public.country_brands
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- projects ------------------------------------------------------------------
create policy "Anyone can read published projects" on public.projects
  for select to anon using (status = 'published');
create policy "Staff can read projects" on public.projects
  for select to authenticated using (status = 'published' or private.has_country_role(country_code, 'viewer'));
create policy "Editors can insert projects" on public.projects
  for insert to authenticated with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can update projects" on public.projects
  for update to authenticated
  using (private.has_country_role(country_code, 'editor'))
  with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can delete projects" on public.projects
  for delete to authenticated using (private.has_country_role(country_code, 'editor'));

create policy "Anyone can read project business lines" on public.project_business_lines
  for select to anon, authenticated using (true);
create policy "Editors can insert project business lines" on public.project_business_lines
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );
create policy "Editors can delete project business lines" on public.project_business_lines
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );

create policy "Anyone can read project brands" on public.project_brands
  for select to anon, authenticated using (true);
create policy "Editors can insert project brands" on public.project_brands
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );
create policy "Editors can delete project brands" on public.project_brands
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );

create policy "Anyone can read media of published projects" on public.project_media
  for select to anon using (
    exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
  );
create policy "Staff can read project media" on public.project_media
  for select to authenticated using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.status = 'published' or private.has_country_role(p.country_code, 'viewer'))
    )
  );
create policy "Editors can insert project media" on public.project_media
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );
create policy "Editors can update project media" on public.project_media
  for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor')))
  with check (exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor')));
create policy "Editors can delete project media" on public.project_media
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and private.has_country_role(p.country_code, 'editor'))
  );

-- events --------------------------------------------------------------------
create policy "Anyone can read published events" on public.events
  for select to anon using (status = 'published');
create policy "Staff can read events" on public.events
  for select to authenticated using (status = 'published' or private.has_country_role(country_code, 'viewer'));
create policy "Editors can insert events" on public.events
  for insert to authenticated with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can update events" on public.events
  for update to authenticated
  using (private.has_country_role(country_code, 'editor'))
  with check (private.has_country_role(country_code, 'editor'));
create policy "Editors can delete events" on public.events
  for delete to authenticated using (private.has_country_role(country_code, 'editor'));

create policy "Anyone can read agenda of published events" on public.event_agenda_items
  for select to anon using (
    exists (select 1 from public.events e where e.id = event_id and e.status = 'published')
  );
create policy "Staff can read event agenda" on public.event_agenda_items
  for select to authenticated using (
    exists (
      select 1 from public.events e
      where e.id = event_id and (e.status = 'published' or private.has_country_role(e.country_code, 'viewer'))
    )
  );
create policy "Editors can insert event agenda" on public.event_agenda_items
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Editors can update event agenda" on public.event_agenda_items
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')))
  with check (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')));
create policy "Editors can delete event agenda" on public.event_agenda_items
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );

create policy "Anyone can read event brands" on public.event_brands
  for select to anon, authenticated using (true);
create policy "Editors can insert event brands" on public.event_brands
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Editors can delete event brands" on public.event_brands
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );

create policy "Anyone can read event media" on public.event_media
  for select to anon, authenticated using (true);
create policy "Editors can insert event media" on public.event_media
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Editors can update event media" on public.event_media
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')))
  with check (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')));
create policy "Editors can delete event media" on public.event_media
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );

-- event_registrations (personal data: viewer+ read, editor+ update, admin+ delete, no public insert)
create policy "Viewers can read registrations" on public.event_registrations
  for select to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'viewer'))
  );
create policy "Editors can update registrations" on public.event_registrations
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')))
  with check (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')));
create policy "Admins can delete registrations" on public.event_registrations
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'admin'))
  );

-- contact_leads (personal data: viewer+ read, editor+ update, admin+ delete, no public insert)
create policy "Viewers can read leads" on public.contact_leads
  for select to authenticated using (private.has_country_role(country_code, 'viewer'));
create policy "Editors can update leads" on public.contact_leads
  for update to authenticated
  using (private.has_country_role(country_code, 'editor'))
  with check (private.has_country_role(country_code, 'editor'));
create policy "Admins can delete leads" on public.contact_leads
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));
