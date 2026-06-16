-- ============================================================
-- GLOS STUDIO STAFF PORTAL - Supabase / PostgreSQL schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL).
-- ============================================================

-- Enums ------------------------------------------------------
do $$ begin
  create type role_t as enum ('admin', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status_t as enum ('hadir','terlambat','cuti','sakit','izin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type leave_type_t as enum ('sakit','izin','mendesak','cuti');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status_t as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- Tables -----------------------------------------------------

-- Linked 1:1 to auth.users via id (Supabase Auth user id).
create table if not exists public.staff (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text not null,
  email       text unique not null,
  role        role_t not null default 'staff',
  jabatan     text default 'Beauty Therapist',
  level       int not null default 1,
  xp          int not null default 0,
  xp_to_next  int not null default 1000,
  avatar      text default 'therapist',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  staff_id   uuid not null references public.staff(id) on delete cascade,
  tanggal    date not null default current_date,
  check_in   time,
  check_out  time,
  status     attendance_status_t not null default 'hadir',
  lokasi     text,
  selfie     text,
  created_at timestamptz not null default now(),
  unique (staff_id, tanggal)
);

create table if not exists public.customer_handled (
  id              uuid primary key default gen_random_uuid(),
  staff_id        uuid not null references public.staff(id) on delete cascade,
  tanggal         date not null default current_date,
  jumlah_customer int not null default 0,
  unique (staff_id, tanggal)
);

create table if not exists public.salary (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid not null references public.staff(id) on delete cascade,
  tanggal     date not null default current_date,
  gaji_harian numeric(12,2) not null default 0,
  bonus       numeric(12,2) not null default 0,
  insentif    numeric(12,2) not null default 0,
  unique (staff_id, tanggal)
);

create table if not exists public.leave_request (
  id        uuid primary key default gen_random_uuid(),
  staff_id  uuid not null references public.staff(id) on delete cascade,
  jenis     leave_type_t not null,
  tanggal   date not null,
  alasan    text,
  lampiran  text,
  status    request_status_t not null default 'pending',
  created_at timestamptz not null default now()
);

-- Row Level Security ----------------------------------------
alter table public.staff            enable row level security;
alter table public.attendance       enable row level security;
alter table public.customer_handled enable row level security;
alter table public.salary           enable row level security;
alter table public.leave_request    enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.staff s where s.id = auth.uid() and s.role = 'admin'
  );
$$;

-- staff: a user reads own row; admins read/write all.
create policy "staff self read"  on public.staff for select using (id = auth.uid() or public.is_admin());
create policy "staff admin write" on public.staff for all    using (public.is_admin()) with check (public.is_admin());

-- attendance: staff manage own rows; admins everything.
create policy "att read"  on public.attendance for select using (staff_id = auth.uid() or public.is_admin());
create policy "att write" on public.attendance for all    using (staff_id = auth.uid() or public.is_admin())
                                                 with check (staff_id = auth.uid() or public.is_admin());

-- customer_handled: staff read own; admins write all.
create policy "cust read"  on public.customer_handled for select using (staff_id = auth.uid() or public.is_admin());
create policy "cust write" on public.customer_handled for all    using (public.is_admin()) with check (public.is_admin());

-- salary: staff read own; admins write all.
create policy "sal read"  on public.salary for select using (staff_id = auth.uid() or public.is_admin());
create policy "sal write" on public.salary for all    using (public.is_admin()) with check (public.is_admin());

-- leave_request: staff create/read own; admins update status.
create policy "leave read"   on public.leave_request for select using (staff_id = auth.uid() or public.is_admin());
create policy "leave insert" on public.leave_request for insert with check (staff_id = auth.uid());
create policy "leave update" on public.leave_request for update using (public.is_admin()) with check (public.is_admin());

-- Auto-create a staff profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.staff (id, nama, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
