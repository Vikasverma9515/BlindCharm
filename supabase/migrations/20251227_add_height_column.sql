-- Add height column to galaxy_profiles
alter table public.galaxy_profiles
add column if not exists height text; -- e.g. "5'10" or "178cm"

comment on column public.galaxy_profiles.height is 'User height (e.g. 5''10")';
