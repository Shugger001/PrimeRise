-- Customer reviews submitted from the public "What People Are Saying" section.
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  email text,
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(trim(review)) between 20 and 1200),
  source text not null default 'website',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  page text,
  created_at timestamptz not null default now()
);

alter table public.customer_reviews enable row level security;

drop policy if exists "Public can submit customer reviews" on public.customer_reviews;
create policy "Public can submit customer reviews"
on public.customer_reviews
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read approved customer reviews" on public.customer_reviews;
create policy "Public can read approved customer reviews"
on public.customer_reviews
for select
to anon, authenticated
using (status = 'approved');
