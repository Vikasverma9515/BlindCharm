-- Add identity columns to galaxy_profiles to avoid joins/RLS issues
ALTER TABLE public.galaxy_profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS birth_date date;

-- Sync data from users table (Backfill)
UPDATE public.galaxy_profiles gp
SET
    full_name = u.full_name,
    birth_date = u.dob
FROM public.users u
WHERE gp.user_id = u.id;
