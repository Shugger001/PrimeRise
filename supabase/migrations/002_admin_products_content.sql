-- Admin catalog + CMS tables, RLS, and product image storage.
-- After running: create an Auth user, then set admin role:
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   where email = 'your-admin@email.com';

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12, 2),
  image_url text,
  category text,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_content_updated_at on public.content;
create trigger trg_content_updated_at
before update on public.content
for each row
execute procedure public.set_content_updated_at();

-- ---------------------------------------------------------------------------
-- Admin helper (JWT app_metadata.role = 'admin')
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.content enable row level security;

-- Categories: public read, admin write
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
on public.categories for insert
to authenticated
with check (public.is_admin());

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
on public.categories for delete
to authenticated
using (public.is_admin());

-- Products: public read, admin write
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products for delete
to authenticated
using (public.is_admin());

-- Content: admin only
drop policy if exists "content_admin_select" on public.content;
create policy "content_admin_select"
on public.content for select
to authenticated
using (public.is_admin());

drop policy if exists "content_admin_insert" on public.content;
create policy "content_admin_insert"
on public.content for insert
to authenticated
with check (public.is_admin());

drop policy if exists "content_admin_update" on public.content;
create policy "content_admin_update"
on public.content for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "content_admin_delete" on public.content;
create policy "content_admin_delete"
on public.content for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public bucket for product images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());
