-- Add unique constraint to user_id in galaxy_profiles to enable UPSERT
-- Run this in your Supabase SQL Editor

ALTER TABLE public.galaxy_profiles
ADD CONSTRAINT galaxy_profiles_user_id_key UNIQUE (user_id);
