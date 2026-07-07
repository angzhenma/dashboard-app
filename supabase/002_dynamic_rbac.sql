-- =========================
-- 1. PERMISSIONS CATALOGUE
-- =========================
create table public.permissions (
  key text primary key,
  description text not null
);

insert into public.permissions (key, description) values
  ('board.edit', 'Add, remove, and reorder dashboard cards'),
  ('threats.write', 'Manually create or edit threat/vulnerability/device records'),
  ('users.view', 'View the list of registered users'),
  ('users.manage', 'Change which role a user is assigned'),
  ('roles.manage', 'Create roles and edit which permissions they grant');

-- ===========================
-- 2. ROLE (ADMIN CAN CREATE)
-- ===========================
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  is_system boolean not null default false, -- built-in roles
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_key text not null references public.permissions (key) on delete cascade,
  primary key (role_id, permission_key)
);

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.permissions enable row level security;

create policy "permissions readable by authenticated users"
  on public.permissions for select to authenticated using (true);
create policy "roles readable by authenticated users"
  on public.roles for select to authenticated using (true);
create policy "role_permissions readable by authenticated users"
  on public.role_permissions for select to authenticated using (true);

-- existing users keep the same effective access after migrating.
insert into public.roles (name, description, is_system) values
  ('Administrator', 'Full access, including user and role management.', true),
  ('Developer', 'Can edit the board and log threat data, but cannot manage users or roles.', true),
  ('Analyst', 'Read-only access to the dashboard.', true);

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
cross join public.permissions p
where r.name = 'Administrator';

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r, public.permissions p
where r.name = 'Developer' and p.key in ('board.edit', 'threats.write');

-- ==================================================================
-- 3. Migrate profiles.role (enum) -> profiles.role_id (FK to roles)
-- ==================================================================
alter table public.profiles add column role_id uuid references public.roles (id);

update public.profiles p
set role_id = r.id
from public.roles r
where lower(r.name) = case p.role
  when 'admin' then 'administrator'
  when 'developer' then 'developer'
  when 'analyst' then 'analyst'
end;

alter table public.profiles alter column role_id set not null;

alter table public.profiles drop column role;
drop type public.user_role cascade;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    (select id from public.roles where name = 'Analyst')
  );
  return new;
end;
$$;

-- ======================================================================
-- 4. Permission-check helpers, used by both RLS policies and RPCs below
-- ======================================================================
create or replace function public.current_user_permissions()
returns setof text
language sql
security definer set search_path = public
stable
as $$
  select rp.permission_key
  from public.profiles p
  join public.role_permissions rp on rp.role_id = p.role_id
  where p.id = auth.uid();
$$;

create or replace function public.user_has_permission(perm text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.current_user_permissions() where current_user_permissions = perm
  );
$$;

create or replace function public.current_user_role_name()
returns text
language sql
security definer set search_path = public
stable
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

-- =======================================================================================
-- 5. Re-point existing RLS policies at permission checks instead of old fixed role names
-- =======================================================================================
drop policy if exists "only admin/developer can write threats" on public.threats;
create policy "only users with threats.write can write threats"
  on public.threats for all
  to authenticated
  using (public.user_has_permission('threats.write'))
  with check (public.user_has_permission('threats.write'));

drop policy if exists "only admin/developer can write vulnerable_apps" on public.vulnerable_apps;
create policy "only users with threats.write can write vulnerable_apps"
  on public.vulnerable_apps for all
  to authenticated
  using (public.user_has_permission('threats.write'))
  with check (public.user_has_permission('threats.write'));

drop policy if exists "only admin/developer can write devices_by_os" on public.devices_by_os;
create policy "only users with threats.write can write devices_by_os"
  on public.devices_by_os for all
  to authenticated
  using (public.user_has_permission('threats.write'))
  with check (public.user_has_permission('threats.write'));

-- ===========================================================
-- 6. ADMIN RPCs: USER LIST, ROLE CRUD, PERMISSION ASSIGNMENT
-- ===========================================================

create or replace function public.list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  role_id uuid,
  role_name text,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.user_has_permission('users.view') then
    raise exception 'You do not have permission to view users';
  end if;

  return query
    select
      u.id,
      u.email::text,
      p.display_name,
      p.role_id,
      r.name as role_name,
      u.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    join public.roles r on r.id = p.role_id
    order by u.created_at desc;
end;
$$;

-- assign an existing role to a user
create or replace function public.assign_user_role(target_user_id uuid, new_role_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.user_has_permission('users.manage') then
    raise exception 'You do not have permission to manage users';
  end if;

  update public.profiles set role_id = new_role_id where id = target_user_id;
end;
$$;

-- create a new role
create or replace function public.create_role(role_name text, permission_keys text[])
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  new_role_id uuid;
begin
  if not public.user_has_permission('roles.manage') then
    raise exception 'You do not have permission to manage roles';
  end if;

  insert into public.roles (name) values (role_name) returning id into new_role_id;

  insert into public.role_permissions (role_id, permission_key)
  select new_role_id, key from unnest(permission_keys) as key;

  return new_role_id;
end;
$$;

-- replace a role's permission set
create or replace function public.update_role_permissions(target_role_id uuid, permission_keys text[])
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.user_has_permission('roles.manage') then
    raise exception 'You do not have permission to manage roles';
  end if;

  if (select is_system from public.roles where id = target_role_id) then
    raise exception 'Built-in roles cannot have their permissions edited';
  end if;

  delete from public.role_permissions where role_id = target_role_id;

  insert into public.role_permissions (role_id, permission_key)
  select target_role_id, key from unnest(permission_keys) as key;
end;
$$;
