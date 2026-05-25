-- Store contact + shipping captured on Stripe Checkout (cart flow).

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists shipping_address text;
