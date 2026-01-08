-- Add detailed profile fields to galaxy_profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS school text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS location text;

-- Create index for location-based filtering (future proofing)
CREATE INDEX IF NOT EXISTS galaxy_profiles_location_idx ON public.galaxy_profiles(location);
