-- Allow waitlist captures even when service-role key is unavailable in runtime.
-- This keeps signup forms functional using the anon key from server routes.

alter table public.waitlist enable row level security;

drop policy if exists "Public can submit waitlist" on public.waitlist;
create policy "Public can submit waitlist"
on public.waitlist
for insert
to anon, authenticated
with check (
  email is not null
  and char_length(trim(email)) between 5 and 320
  and position('@' in email) > 1
);
