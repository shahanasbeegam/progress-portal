-- Fix infinite recursion in profiles RLS policy.
-- The original "admin read all" policy queried profiles from within a profiles
-- policy, causing Postgres to recurse infinitely. A security definer function
-- bypasses RLS when checking the caller's role.

drop policy if exists "profiles: admin read all" on public.profiles;

create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles: admin read all"
  on public.profiles for select
  using (public.get_my_role() = 'admin');
