-- SUPER ADMIN ROLE
alter table public.roles
    add column if not exists is_super_admin boolean not null default false;

insert into public.roles (name, description, is_system, is_super_admin)
values (
  'Super Admin',
  'Full access, including changing the role of any user except other Super Admins. Only reversible by the Super Admin themselves.',
  true,
  true
)
on conflict (name) do update set is_super_admin = true, is_system = true;

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
cross join public.permissions p
where r.name = 'Super Admin'
on conflict (role_id, permission_key) do nothing;

-- ROLE HIERARCHY HELPER
create or replace function public.current_user_is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select r.is_super_admin
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

-- ROLE CHANGE HIERARCHY RULES
create or replace function public.assign_user_role(target_user_id uuid, new_role_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  caller_is_super boolean;
  target_is_super boolean;
begin
  if not public.user_has_permission('users.manage') then
    raise exception 'You do not have permission to manage users';
  end if;

  select r.is_super_admin into target_is_super
  from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = target_user_id;

  select r.is_super_admin into caller_is_super
  from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if target_is_super and not coalesce(caller_is_super, false) then
    raise exception 'Only a super admin can change another super admin''s role';
  end if;

  if target_is_super and caller_is_super and target_user_id <> auth.uid() then
    raise exception 'Super admins cannot change another super admin''s role';
  end if;

  update public.profiles set role_id = new_role_id where id = target_user_id;
end;
$$;

-- USER LIST
drop function if exists public.list_users();

create or replace function public.list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  role_id uuid,
  role_name text,
  role_is_super_admin boolean,
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
      r.is_super_admin,
      u.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    join public.roles r on r.id = p.role_id
    order by u.created_at desc;
end;
$$;

-- REMOVE REGISTRATION
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

drop function if exists public.list_registration_requests();
drop function if exists public.approve_registration_request(uuid, uuid);

drop function if exists public.approve_registration_requests(uuid, uuid);
drop function if exists public.reject_registration_request(uuid);

drop table if exists public.registration_requests;
drop table if exists public.registration_requestss;
