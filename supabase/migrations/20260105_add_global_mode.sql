-- Add 'discovery_global' preference to galaxy_profiles
-- If true, the user wants to see profiles regardless of distance (Global Mode)

alter table public.galaxy_profiles
add column if not exists discovery_global boolean default false;

comment on column public.galaxy_profiles.discovery_global is 'If true, ignore distance limits and show global profiles';
