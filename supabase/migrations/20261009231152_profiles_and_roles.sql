create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  global_role public.global_role,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_country_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  country_code text not null references public.countries (code) on delete cascade,
  role public.country_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, country_code)
);

create index user_country_roles_country_code_idx on public.user_country_roles (country_code);

alter table public.profiles enable row level security;
alter table public.user_country_roles enable row level security;

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- Every auth user gets a profile. Roles are never taken from user metadata.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated after update of email on auth.users
  for each row execute function private.sync_profile_email();
