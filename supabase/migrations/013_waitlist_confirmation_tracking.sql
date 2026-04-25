alter table public.waitlist
  add column if not exists confirmation_sent_at timestamptz;

create index if not exists waitlist_confirmation_sent_at_idx
  on public.waitlist (confirmation_sent_at, created_at desc);
  