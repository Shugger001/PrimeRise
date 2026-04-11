-- Waitlist signups from Vercel serverless POST /api/subscribe (Supabase service role).
-- Run in Supabase SQL Editor or via supabase db push after linking the project.

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null,
  page text,
  form_id text,
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Inserts use the service role key on the server only; anon/authenticated clients have no policies here.
