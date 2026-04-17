-- Orders + line items (Stripe Checkout). Fulfillment via API webhook (service role).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  status text not null default 'pending',
  currency text not null default 'usd',
  amount_total_cents integer,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Admin can read orders and items; no public access
drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "order_items_admin_select" on public.order_items;
create policy "order_items_admin_select"
on public.order_items for select
to authenticated
using (public.is_admin());

-- Inserts happen via service role (webhook) — bypass RLS when using service key
