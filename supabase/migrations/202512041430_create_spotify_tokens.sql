create table if not exists public.spotify_tokens (
    user_id uuid references auth.users(id) on delete cascade primary key,
    refresh_token text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.spotify_tokens enable row level security;

create policy "Users can view their own spotify tokens"
    on public.spotify_tokens for select
    using (auth.uid() = user_id);

create policy "Users can insert their own spotify tokens"
    on public.spotify_tokens for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own spotify tokens"
    on public.spotify_tokens for update
    using (auth.uid() = user_id);

create policy "Users can delete their own spotify tokens"
    on public.spotify_tokens for delete
    using (auth.uid() = user_id);
