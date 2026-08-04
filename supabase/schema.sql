-- =========================================================
-- AURELIA DENTAL STUDIO — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  appt_date date not null,
  appt_time text not null,
  service text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table appointments enable row level security;

-- Anyone (the public booking form) can create a new appointment request.
create policy "Public can submit appointments"
  on appointments for insert
  to anon
  with check (true);

-- Only a logged-in admin (Supabase Auth) can view appointments.
create policy "Admin can view appointments"
  on appointments for select
  to authenticated
  using (true);

-- Only a logged-in admin can change a status (pending/confirmed/cancelled).
create policy "Admin can update appointments"
  on appointments for update
  to authenticated
  using (true);

-- Only a logged-in admin can delete an appointment.
create policy "Admin can delete appointments"
  on appointments for delete
  to authenticated
  using (true);

-- Optional: enable realtime updates so the admin dashboard live-refreshes.
-- Supabase Dashboard → Database → Replication → toggle "appointments" on,
-- or run:
-- alter publication supabase_realtime add table appointments;

-- =========================================================
-- Create your admin login AFTER running this file:
-- Supabase Dashboard → Authentication → Users → Add user
-- (use an email + password — this is what you'll log into admin.html with)
-- =========================================================
