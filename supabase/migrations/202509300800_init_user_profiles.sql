-- Enable required extensions
create extension if not exists pgcrypto;

-- Helper to slugify a base string (email local-part or metadata)
create or replace function public.slugify_base(input text)
returns text
language sql
immutable
as $$
  select
    trim(both '-' from regexp_replace(lower(coalesce(input, 'user')), '[^a-z0-9]+', '-', 'g'))
$$;

-- Main provisioning function called by the trigger
create or replace function public.provision_user_profile()
returns trigger
language plpgsql
security definer
as $$
declare
  base_username text;
  final_username text;
  tries int := 0;
  max_tries int := 10;
  candidate text;
  avatar text;
begin
  -- Derive a base username from metadata/email
  base_username := coalesce(
    (NEW.raw_user_meta_data->>'username'),
    split_part(NEW.email, '@', 1),
    split_part(NEW.raw_user_meta_data->>'email', '@', 1),
    'user'
  );

  base_username := public.slugify_base(base_username);

  -- Extract avatar_url from metadata if present
  avatar := coalesce(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    null
  );

  -- Try to find a unique username up to max_tries times
  loop
    if tries = 0 then
      candidate := base_username;
    else
      candidate := base_username || '_' || substr(encode(gen_random_bytes(2), 'hex'), 1, 4);
    end if;

    begin
      insert into public.users (id, username, avatar_url)
      values (NEW.id, candidate, avatar);
      final_username := candidate;
      exit; -- success
    exception when unique_violation then
      tries := tries + 1;
      if tries >= max_tries then
        candidate := base_username || '_' || extract(epoch from now())::bigint::text;
        insert into public.users (id, username, avatar_url)
        values (NEW.id, candidate, avatar);
        final_username := candidate;
        exit;
      end if;
    end;
  end loop;

  return NEW;
end;
$$;

-- Trigger on auth.users AFTER INSERT
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.provision_user_profile();

-- RLS Policies for public.users
alter table public.users enable row level security;

drop policy if exists "Users are readable by anyone" on public.users;
create policy "Users are readable by anyone"
on public.users
for select
to public
using (true);

drop policy if exists "Users insert own profile" on public.users;
create policy "Users insert own profile"
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Backfill existing auth users without a profile
with bases as (
  select
    u.id,
    coalesce(
      (u.raw_user_meta_data->>'username'),
      split_part(u.email, '@', 1),
      split_part(u.raw_user_meta_data->>'email', '@', 1),
      'user'
    ) as base,
    coalesce(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture',
      null
    ) as avatar
  from auth.users u
  left join public.users pu on pu.id = u.id
  where pu.id is null
),
slugged as (
  select
    id,
    public.slugify_base(base) as base_slug,
    avatar
  from bases
),
ranked as (
  select
    s.*,
    row_number() over (partition by base_slug order by id) as rn
  from slugged s
),
final as (
  select
    id,
    case when rn = 1 then base_slug else base_slug || '_' || rn::text end as username,
    avatar
  from ranked
)
insert into public.users (id, username, avatar_url)
select id, username, avatar
from final
on conflict do nothing;


