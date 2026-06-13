-- Add parent_profile_id to students for parent-child linking
alter table public.students
  add column if not exists parent_profile_id uuid references public.profiles(id);

-- Fix parent RLS to use parent_profile_id
drop policy if exists "students: parent read own child" on public.students;
create policy "students: parent read own child"
  on public.students for select
  using (parent_profile_id = auth.uid());

-- Admin can write students
create policy "students: admin write"
  on public.students for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Progress cards
create table public.progress_cards (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.students(id) on delete cascade,
  term          text not null,
  signature     text,
  generated_by  uuid references public.profiles(id),
  created_at    timestamptz default now(),
  unique (student_id, term)
);
alter table public.progress_cards enable row level security;

create policy "progress_cards: teacher/admin all"
  on public.progress_cards for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')));

create policy "progress_cards: parent read own child"
  on public.progress_cards for select
  using (exists (
    select 1 from public.students s
    where s.id = student_id and s.parent_profile_id = auth.uid()
  ));
