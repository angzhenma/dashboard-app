-- SUPER ADMIN ROLE
alter table public.roles add column is_super_admin boolean not null default false;

insert into public.roles (name, description, is_system, is_super_admin) values
    ('Super Admin', 'Full access, including changing the role of any other user except other Super Admins', true, true);

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
cross join public.permissions p
where r.name = 'Super Admin';

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

-- REGISTRATION REQUESTS
create table public.registration_requests (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    display_name text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    requested_at timestamptz not null default now(),
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users (id)
);

alter table public.registration_requestss enable row level security;

-- a user can check their own request status
create policy "users can view their own registration request"
    on public.registration_requests for select
    to authenticated
    using (auth.uid() = id);

-- only super admins can see the full list
create policy "super admins can view all registration requests"
    on public.registration_requests for select
    to authenticated
    using (public.current_user_is_super_admin());

-- writes to the `authenticated` table only ever happen via handle_new_user() and approve and reject RPCs

-- NEW SIGN UPS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.registration_requests (id, email, display_name, status)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, @, 1)),
        'pending'
    );
    return new;
end;
$$;

-- REGISTRATION REQUESTS REVIEW
create or replace function public.list_registration_requests()
returns table (
    id uuid,
    email text,
    display_name text,
    status text,
    requested_at timestamptz,
    reviewed_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
begin
    if not public.current_user_is_super_admin() then
        raise exception 'Only super admins can view registration requests';
    end if;

    return query
        select rr.id, rr.email, rr.display_name, rr.status, rr.requested_at, rr.reviewed_at
        from public.registration_requests rr
        order by rr.requested_at desc;
end;
$$;

-- approving creates the user and marks the request reviewed in one transaction
create or replace function public.approve_registration_requests(request_id uuid, new_role_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
    req record;
begin
    if not public.current_user_is_super_admin() then
        raise exception 'Only super admins can approve registration requests';
    end if;

    select * into req from public.registration_requests where id = request_id;
    if req is null then
        raise exception 'Registration request not found';
    end if;
    if req.status <> 'pending' then
        raise exception 'This request has already been reviewed';
    end if;

    insert into public.profiles (id, display_name, role_id)
    values (req.id, req.display_name, new_role_id);

    update public.registration_requests
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = request_id;
end;
$$;

create or replace function public.reject_registration_request(request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
    if not public.current_user_is_super_admin() then
        raise exception 'Only super admins can reject registration requests';
    end if;

    update public.registration_requests
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
    where id = request_id and status = 'pending';
end;
$$;

-- ROLE CHANGE HEIRARCHY RULES

-- replaces the version of this function from 002_dynamic_rbac.sql
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

    update public.profiles set role_id = new_role_id where id = target_user_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. list_users() also needs to expose whether each user's role is the
--    super-admin tier, so the frontend can gate each row correctly
-- ---------------------------------------------------------------------
-- CREATE OR REPLACE can't change a function's return columns, so the old
-- signature (without role_is_super_admin) has to go first.
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

-- ---------------------------------------------------------------------
-- 8. Bootstrapping the first Super Admin
-- ---------------------------------------------------------------------
-- Since new signups no longer get a profile automatically, there is no
-- "create a user via the dashboard, then promote them" shortcut anymore —
-- every user, including your first, goes through registration_requests.
--
-- 1. Create your first auth user (Supabase dashboard > Authentication >
--    Add user, OR have them self-register from the app's Register page).
--    Either way they land in registration_requests as 'pending'.
-- 2. From the SQL editor (runs with no auth.uid(), which is what makes
--    current_user_is_super_admin()'s NULL-permissive check pass — see §2):
--
--      select public.approve_registration_request(
--        '<user-uuid-from-auth.users>',
--        (select id from public.roles where name = 'Super Admin')
--      );
--
--    This creates their profile as a Super Admin directly. From here on,
--    they can approve/reject everyone else through the app's Registration
--    Requests page like normal.
