-- Authorization helpers used by RLS policies. They live in the non-exposed `private` schema,
-- run as security definer (so they can read profiles / roles regardless of RLS) and pin search_path.

create function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active and p.global_role = 'super_admin'
  );
$$;

create function private.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active and p.global_role = 'catalog_admin'
  );
$$;

create function private.can_manage_catalog()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active and p.global_role in ('super_admin', 'catalog_admin')
  );
$$;

-- viewer < editor < admin; super_admin always passes.
create function private.has_country_role(p_country text, p_min_role public.country_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and (
        p.global_role = 'super_admin'
        or exists (
          select 1 from public.user_country_roles r
          where r.user_id = p.id and r.country_code = p_country and r.role >= p_min_role
        )
      )
  );
$$;

-- True when the user has any country role (or a global role); used for staff-only global reads.
create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and (p.global_role is not null or exists (select 1 from public.user_country_roles r where r.user_id = p.id))
  );
$$;

-- Countries where the current user has at least p_min_role (all countries for super_admin).
create function private.user_countries(p_min_role public.country_role default 'viewer')
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select c.code from public.countries c
  where private.has_country_role(c.code, p_min_role);
$$;

revoke all on all functions in schema private from public;
grant execute on function
  private.is_super_admin(),
  private.is_catalog_admin(),
  private.can_manage_catalog(),
  private.has_country_role(text, public.country_role),
  private.is_staff(),
  private.user_countries(public.country_role)
to anon, authenticated, service_role;

-- Only super admins may change global roles or deactivate users. API requests run as `anon` / `authenticated`;
-- service role (invitations) and direct database sessions (migrations, seeds) are not restricted.
create function private.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.global_role is distinct from old.global_role or new.is_active is distinct from old.is_active or new.id <> old.id
      or new.email is distinct from old.email)
     and current_setting('role', true) in ('anon', 'authenticated')
     and not private.is_super_admin() then
    raise exception 'only super admins can change email, global role or activation'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_profile_privileges before update on public.profiles
  for each row execute function private.guard_profile_privileges();
