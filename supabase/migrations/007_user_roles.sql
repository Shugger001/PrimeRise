-- Separate application roles (admin vs customer) from auth.users identity.
-- Source of truth: public.user_roles. Legacy app_metadata.role is migrated then ignored for authorization.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  app_role text not null check (app_role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

create index if not exists user_roles_app_role_idx on public.user_roles (app_role);

alter table public.user_roles enable row level security;

-- Users can read their own role row (for nav / client checks)
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

-- Backfill: legacy JWT admin flag → admin row
insert into public.user_roles (user_id, app_role)
select id, 'admin'
from auth.users
where coalesce(raw_app_meta_data->>'role', '') = 'admin'
on conflict (user_id) do update set app_role = excluded.app_role;

-- Everyone else → customer
insert into public.user_roles (user_id, app_role)
select id, 'customer'
from auth.users
where id not in (select user_id from public.user_roles);

-- New sign-ups default to customer (Supabase creates auth.users row first)
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, app_role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_roles on auth.users;
create trigger trg_auth_user_roles
after insert on auth.users
for each row execute function public.handle_new_user_role();

-- RLS / policies: is_admin() now reads user_roles (not JWT)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.app_role = 'admin'
  );
$$;
