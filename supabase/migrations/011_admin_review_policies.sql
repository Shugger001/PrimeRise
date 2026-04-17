-- Allow signed-in admins to moderate all customer reviews via RLS.
alter table public.customer_reviews enable row level security;

drop policy if exists "Admins can read all customer reviews" on public.customer_reviews;
create policy "Admins can read all customer reviews"
on public.customer_reviews
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update customer reviews" on public.customer_reviews;
create policy "Admins can update customer reviews"
on public.customer_reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete customer reviews" on public.customer_reviews;
create policy "Admins can delete customer reviews"
on public.customer_reviews
for delete
to authenticated
using (public.is_admin());
