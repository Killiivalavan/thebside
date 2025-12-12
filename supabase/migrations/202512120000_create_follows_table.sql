-- Create follows table
create table if not exists public.follows (
    follower_id uuid references public.users(id) on delete cascade not null,
    following_id uuid references public.users(id) on delete cascade not null,
    created_at timestamptz default now(),
    primary key (follower_id, following_id),
    constraint no_self_follow check (follower_id != following_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- Policies
create policy "Follows are viewable by everyone"
    on public.follows for select
    using (true);

create policy "Users can follow others"
    on public.follows for insert
    with check (auth.uid() = follower_id);

create policy "Users can unfollow"
    on public.follows for delete
    using (auth.uid() = follower_id);

-- Helper function to get follow counts
create or replace function public.get_profile_stats(user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
    followers_count int;
    following_count int;
begin
    select count(*) into followers_count
    from public.follows
    where following_id = user_id;

    select count(*) into following_count
    from public.follows
    where follower_id = user_id;

    return json_build_object(
        'followers', followers_count,
        'following', following_count
    );
end;
$$;
