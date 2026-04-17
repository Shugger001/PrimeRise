-- Link orders to Supabase Auth users; customers can read their own orders + line items.

alter table public.orders
add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);

-- Authenticated users may read their own orders (admins keep existing policy via is_admin()).
drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select"
on public.orders for select
to authenticated
using (user_id is not null and user_id = auth.uid());

-- Line items for orders the user owns
drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
    and o.user_id = auth.uid()
  )
);
