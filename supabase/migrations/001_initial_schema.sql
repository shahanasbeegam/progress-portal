-- ============================================================
-- Parent-Teacher Portal — Initial Schema
-- ============================================================

-- Profiles (extends auth.users, one row per user)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('teacher', 'parent', 'admin', 'student')),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Users can update their own profile (not role)
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Students
-- ============================================================
create table public.students (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles(id) on delete set null,
  full_name   text not null,
  roll_number text,
  class_id    uuid,
  created_at  timestamptz default now()
);

alter table public.students enable row level security;

create policy "students: teacher/admin read"
  on public.students for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "students: parent read own child"
  on public.students for select
  using (profile_id = auth.uid());

create policy "students: student read self"
  on public.students for select
  using (profile_id = auth.uid());

-- ============================================================
-- Classes
-- ============================================================
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  grade       text,
  section     text,
  created_at  timestamptz default now()
);

alter table public.classes enable row level security;

create policy "classes: all authenticated read"
  on public.classes for select
  using (auth.role() = 'authenticated');

create policy "classes: admin write"
  on public.classes for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- Subjects
-- ============================================================
create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  class_id    uuid references public.classes(id) on delete cascade,
  teacher_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.subjects enable row level security;

create policy "subjects: all authenticated read"
  on public.subjects for select
  using (auth.role() = 'authenticated');

create policy "subjects: admin write"
  on public.subjects for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- Marks
-- ============================================================
create table public.marks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references public.students(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete cascade,
  exam_type   text not null,   -- e.g. 'midterm', 'final', 'unit_test'
  score       numeric(5,2),
  max_score   numeric(5,2) default 100,
  entered_by  uuid references public.profiles(id),
  entered_at  timestamptz default now(),
  approved    boolean default false
);

alter table public.marks enable row level security;

create policy "marks: teacher write own subjects"
  on public.marks for insert
  with check (
    exists (
      select 1 from public.subjects s
      where s.id = subject_id and s.teacher_id = auth.uid()
    )
  );

create policy "marks: teacher read own subjects"
  on public.marks for select
  using (
    exists (
      select 1 from public.subjects s
      where s.id = subject_id and s.teacher_id = auth.uid()
    )
  );

create policy "marks: parent/student read own"
  on public.marks for select
  using (
    exists (
      select 1 from public.students st
      where st.id = student_id and st.profile_id = auth.uid()
    )
  );

create policy "marks: admin all"
  on public.marks for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- AI Summaries
-- ============================================================
create table public.ai_summaries (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references public.students(id) on delete cascade,
  term         text,
  summary_text text,
  approved     boolean default false,
  approved_by  uuid references public.profiles(id),
  created_at   timestamptz default now()
);

alter table public.ai_summaries enable row level security;

create policy "summaries: teacher read/write"
  on public.ai_summaries for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "summaries: parent/student read approved"
  on public.ai_summaries for select
  using (
    approved = true and
    exists (
      select 1 from public.students st
      where st.id = student_id and st.profile_id = auth.uid()
    )
  );

-- ============================================================
-- Voice Notes
-- ============================================================
create table public.voice_notes (
  id              uuid primary key default gen_random_uuid(),
  sender_id       uuid references public.profiles(id),
  recipient_id    uuid references public.profiles(id),   -- null = broadcast to class
  class_id        uuid references public.classes(id),
  storage_path    text not null,
  duration_secs   integer,
  transcript      text,
  sentiment       text,
  created_at      timestamptz default now()
);

alter table public.voice_notes enable row level security;

create policy "voice_notes: sender read own"
  on public.voice_notes for select
  using (sender_id = auth.uid());

create policy "voice_notes: recipient read"
  on public.voice_notes for select
  using (recipient_id = auth.uid());

create policy "voice_notes: teacher send"
  on public.voice_notes for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'parent', 'admin')
    )
  );

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
