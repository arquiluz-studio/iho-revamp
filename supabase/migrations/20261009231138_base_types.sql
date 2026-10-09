-- Base: private schema, enums and the shared updated_at trigger.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.social_platform as enum ('instagram', 'facebook', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'x', 'whatsapp');
create type public.media_kind as enum ('project_photo', 'product_photo', 'event_photo', 'brand_logo', 'team_photo', 'hero', 'generic');
create type public.media_processing_status as enum ('pending', 'ready', 'failed');
create type public.event_type as enum ('event', 'launch', 'fair', 'webinar', 'lunch_and_learn', 'workshop', 'showroom');
create type public.event_access as enum ('open', 'registration_required', 'invite_only');
create type public.registration_status as enum ('pending', 'confirmed', 'waitlist', 'cancelled', 'attended');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'closed');
create type public.global_role as enum ('super_admin', 'catalog_admin');
-- Order matters: has_country_role() compares roles with >=, so viewer < editor < admin.
create type public.country_role as enum ('viewer', 'editor', 'admin');

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
