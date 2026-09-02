-- CVsible cloud storage schema.
-- Run this once in the Supabase project's SQL Editor (Database → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent.

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Untitled',
  data jsonb not null,
  is_public boolean not null default false,
  public_id text unique,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive, for a database created before this column existed.
alter table public.cvs add column if not exists history jsonb not null default '[]'::jsonb;

create index if not exists cvs_user_id_idx on public.cvs (user_id);

alter table public.cvs enable row level security;

drop policy if exists cvs_select_own on public.cvs;
create policy cvs_select_own on public.cvs for select using (auth.uid() = user_id);

drop policy if exists cvs_insert_own on public.cvs;
create policy cvs_insert_own on public.cvs for insert with check (auth.uid() = user_id);

drop policy if exists cvs_update_own on public.cvs;
create policy cvs_update_own on public.cvs for update using (auth.uid() = user_id);

drop policy if exists cvs_delete_own on public.cvs;
create policy cvs_delete_own on public.cvs for delete using (auth.uid() = user_id);

-- Server-side cap: the client also checks this, but the anon key can call the
-- API directly, so the real limit has to live here.
create or replace function public.enforce_cv_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if (select count(*) from public.cvs where user_id = new.user_id) >= 10 then
    raise exception 'cv_limit_reached';
  end if;
  return new;
end;
$$;

drop trigger if exists cvs_limit_trigger on public.cvs;
create trigger cvs_limit_trigger
  before insert on public.cvs
  for each row execute function public.enforce_cv_limit();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cvs_updated_at on public.cvs;
create trigger cvs_updated_at
  before update on public.cvs
  for each row execute function public.set_updated_at();

-- Public share links. Deliberately NOT a table policy: a policy filtering on
-- is_public = true would let anyone list every public CV in the table (RLS
-- filters rows, it doesn't stop enumeration). This function only ever returns
-- the one row matching an exact, unguessable public_id token, the same
-- security model as a Google Docs share link.
create or replace function public.get_public_cv(lookup_id text)
returns table (name text, data jsonb, updated_at timestamptz)
language sql
security definer
stable
as $$
  select name, data, updated_at
  from public.cvs
  where public_id = lookup_id and is_public = true
  limit 1;
$$;

grant execute on function public.get_public_cv(text) to anon, authenticated;
