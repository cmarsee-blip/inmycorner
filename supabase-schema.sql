-- ============================================================
-- InMyCorner — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── FAMILIES (Parent + Athlete signup) ──────────────────────
create table if not exists public.families (
  id uuid primary key references auth.users(id) on delete cascade,
  parent_name text not null,
  parent_email text not null,
  athlete_name text not null,
  athlete_age int not null check (athlete_age >= 5 and athlete_age <= 18),
  athlete_grade text,
  sport text not null,
  notes text,
  created_at timestamptz default now()
);

-- ── MENTORS (Athlete volunteer signup) ──────────────────────
create table if not exists public.mentors (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  sport text not null,
  level text not null check (level in ('college', 'professional')),
  team_or_school text,
  bio text,
  -- Background check lifecycle: nothing is "matched" until this is 'cleared'
  background_check_status text not null default 'pending'
    check (background_check_status in ('pending', 'cleared', 'failed')),
  created_at timestamptz default now()
);

-- ── MATCHES (mentor ↔ family pairing) ───────────────────────
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'paused', 'ended')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Locks down each table so users can only see/edit their own
-- rows. Nothing is publicly readable by default.
-- ============================================================

alter table public.families enable row level security;
alter table public.mentors enable row level security;
alter table public.matches enable row level security;

-- Families: a parent can insert/read/update only their own row
create policy "Families can insert their own row"
  on public.families for insert
  with check (auth.uid() = id);

create policy "Families can view their own row"
  on public.families for select
  using (auth.uid() = id);

create policy "Families can update their own row"
  on public.families for update
  using (auth.uid() = id);

-- Mentors: a mentor can insert/read/update only their own row
create policy "Mentors can insert their own row"
  on public.mentors for insert
  with check (auth.uid() = id);

create policy "Mentors can view their own row"
  on public.mentors for select
  using (auth.uid() = id);

create policy "Mentors can update their own row"
  on public.mentors for update
  using (auth.uid() = id);

-- Matches: visible to the mentor or family involved in that match
create policy "Participants can view their matches"
  on public.matches for select
  using (
    auth.uid() = mentor_id
    or auth.uid() in (select id from public.families where id = family_id)
  );

-- NOTE: Matches are NOT insertable by regular users — matching should
-- happen server-side (e.g. a Supabase Edge Function) only after a
-- mentor's background_check_status = 'cleared'. No insert policy is
-- defined here on purpose, so only a service-role key can create matches.

-- ============================================================
-- AUTO-CREATE PROFILE ROW ON SIGNUP
-- Runs as a trusted database function the instant a new auth
-- user is created — regardless of email confirmation status.
-- This removes the need for the browser to have an active
-- session at insert time, which avoids RLS/timing issues.
-- The signup form must pass this data via signUp()'s
-- `options.data` (user metadata), not a separate insert call.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'signup_type' = 'family' then
    insert into public.families (id, parent_name, parent_email, athlete_name, athlete_age, athlete_grade, sport)
    values (
      new.id,
      new.raw_user_meta_data->>'parent_name',
      new.email,
      new.raw_user_meta_data->>'athlete_name',
      nullif(new.raw_user_meta_data->>'athlete_age', '')::int,
      new.raw_user_meta_data->>'athlete_grade',
      new.raw_user_meta_data->>'sport'
    );
  elsif new.raw_user_meta_data->>'signup_type' = 'mentor' then
    insert into public.mentors (id, full_name, email, sport, level, team_or_school, bio)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.email,
      new.raw_user_meta_data->>'sport',
      new.raw_user_meta_data->>'level',
      new.raw_user_meta_data->>'team_or_school',
      new.raw_user_meta_data->>'bio'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
