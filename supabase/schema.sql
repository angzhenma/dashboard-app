-- =================
-- ROLES / PROFILES
-- =================
create type public.user_role as enum ('admin', 'developer', 'analyst');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'analyst',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- everyone signed in can read profiles.
create policy "profiles are readable by any authenticated user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own display_name only"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- default to 'analyst' whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'analyst'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.current_user_role()
returns public.user_role
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- admin-only way to change someone's role (not yet implemented).
create function public.promote_user(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can change roles';
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

-- ========
-- THREATS
-- ========
create table public.threats (
  id text primary key,
  computer_name text not null,
  ip_address text not null,
  threat_type text not null check (threat_type in (
    'RDP Exploit', 'Shadow IT Application', 'Malware Execution', 'Unpatched Vulnerability'
  )),
  program_name text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  detected_time timestamptz not null,
  status text not null check (status in ('Active', 'Mitigated', 'Suspended')),
  created_at timestamptz not null default now()
);

alter table public.threats enable row level security;

-- everyone signed in can view threat data.
create policy "threats are readable by any authenticated user"
  on public.threats for select
  to authenticated
  using (true);

-- ========================================
-- VULNERABLE APPLICATIONS / DEVICES BY OS
-- ========================================
create table public.vulnerable_apps (
  id bigint generated always as identity primary key,
  name text not null,
  hosts integer not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low'))
);

alter table public.vulnerable_apps enable row level security;

create policy "vulnerable_apps readable by any authenticated user"
  on public.vulnerable_apps for select
  to authenticated
  using (true);

create policy "only admin/developer can write vulnerable_apps"
  on public.vulnerable_apps for all
  to authenticated
  using (public.current_user_role() in ('admin', 'developer'))
  with check (public.current_user_role() in ('admin', 'developer'));

create table public.devices_by_os (
  id bigint generated always as identity primary key,
  name text not null,
  value integer not null,
  color text not null
);

alter table public.devices_by_os enable row level security;

create policy "devices_by_os readable by any authenticated user"
  on public.devices_by_os for select
  to authenticated
  using (true);

create policy "only admin/developer can write devices_by_os"
  on public.devices_by_os for all
  to authenticated
  using (public.current_user_role() in ('admin', 'developer'))
  with check (public.current_user_role() in ('admin', 'developer'));

-- ===================
-- LAYOUT PERSISTENCE
-- ===================
create table public.board_layouts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  columns jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.board_layouts enable row level security;

-- a user can only ever see or touch their own board layout.
create policy "users manage their own board layout"
  on public.board_layouts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========================================
-- SEED DATA (mirrors the old mockData.ts)
-- ========================================
insert into public.threats (id, computer_name, ip_address, threat_type, program_name, severity, detected_time, status) values
  ('TR-9021', 'FINANCE-LAPTOP-04', '192.168.1.45', 'Shadow IT Application', 'AnyDesk.exe', 'High', '2026-06-27T14:22:00Z', 'Active'),
  ('TR-4412', 'DEV-WORKSTATION-12', '192.168.2.110', 'RDP Exploit', 'Port 3389 Inbound', 'Critical', '2026-06-27T15:01:14Z', 'Active'),
  ('TR-1104', 'HR-PC-01', '192.168.1.12', 'Unpatched Vulnerability', 'CVE-2024-38077 (Remote Code Execution)', 'Critical', '2026-06-26T09:15:30Z', 'Active');

insert into public.vulnerable_apps (name, hosts, severity) values
  ('AnyDesk', 12, 'High'),
  ('Discord', 1, 'Low'),
  ('Dropbox', 6, 'Medium'),
  ('Chrome Remote Desktop', 4, 'Critical');

insert into public.devices_by_os (name, value, color) values
  ('Windows 11', 84, 'var(--soc-yellow)'),
  ('macOS Sequoia', 21, 'var(--soc-blue)'),
  ('Ubuntu 24.04', 12, 'var(--soc-green)'),
  ('Windows 10', 6, 'var(--soc-gray)');