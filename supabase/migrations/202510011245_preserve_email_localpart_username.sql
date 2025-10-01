-- Update provisioning to preserve email local-part as username (no slugify)
-- Keeps uniqueness logic by appending a short suffix if needed

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
  -- Derive a base username from metadata/email (preserve as-is)
  base_username := coalesce(
    (NEW.raw_user_meta_data->>'username'),
    split_part(NEW.email, '@', 1),
    split_part(NEW.raw_user_meta_data->>'email', '@', 1),
    'user'
  );

  -- Extract avatar_url from metadata if present
  avatar := coalesce(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    null
  );

  -- Ensure uniqueness by attempting inserts with a short suffix on conflict
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


