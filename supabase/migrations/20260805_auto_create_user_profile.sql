-- Auto-create a public.users profile row whenever a new row is inserted into
-- auth.users, so every signup path (not just this app's client-side code) is
-- guaranteed to end up with a matching public.users row.
--
-- Runs as SECURITY DEFINER so it isn't blocked by RLS on public.users (the
-- trigger fires as the internal supabase_auth_admin role, which normally has
-- no access to public.users at all). The insert is wrapped in an exception
-- handler because this trigger runs inside the same transaction as the
-- auth.users insert: an unhandled error here would roll back the entire
-- signup and lock the user out of creating an account at all. If profile
-- creation fails for any reason, we log a warning and let signup succeed
-- anyway rather than take down auth.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_hospital_id uuid;
begin
  -- "first hospital in list" = alphabetically first by name, matching how
  -- the app's own hospital dropdown is ordered (see formService.getSpecialties
  -- / the Signup hospital <select>). Swap to `order by created_at` instead if
  -- you actually meant the first one ever created.
  select id into default_hospital_id
  from public.hospitals
  order by name
  limit 1;

  -- first_name/last_name fall back to 'User' only when not supplied. The
  -- app's signup form already passes the real name via
  -- supabase.auth.signUp({ options: { data: { first_name, last_name } } }),
  -- which lands in raw_user_meta_data, so this preserves the real name for
  -- normal signups and only uses the literal 'User' default for signups from
  -- elsewhere (Supabase dashboard, another client, etc.) that don't supply it.
  insert into public.users (id, email, first_name, last_name, hospital_id, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'last_name', 'User'),
    default_hospital_id,
    'nurse'
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    raise warning 'handle_new_user: could not create public.users row for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
