-- Create table for tracking daily picks
create table if not exists public.galaxy_daily_picks (
    id uuid default gen_random_uuid() primary key,
    -- Reference PUBLIC.users, not auth.users
    user_id uuid references public.users(id) on delete cascade not null,
    -- The picked profile is also a user
    picked_profile_id uuid references public.users(id) on delete cascade not null,
    
    picked_at date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure each profile is only picked once per day for a user
    unique(user_id, picked_profile_id, picked_at)
);

-- Index for fast querying
create index if not exists galaxy_daily_picks_user_date_idx on public.galaxy_daily_picks(user_id, picked_at);

-- RLS (Optional, since we use Admin client, but good practice if we ever access from client)
alter table public.galaxy_daily_picks enable row level security;

-- Policy assuming potential future auth integration or just explicit allow for now
create policy "Enable read access for all users"
    on public.galaxy_daily_picks for select
    using (true);
