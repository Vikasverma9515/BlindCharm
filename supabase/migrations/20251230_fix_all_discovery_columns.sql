-- Comprehensive migration to ensure all discovery preference columns exist
-- Run this in the Supabase SQL Editor

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS discovery_min_height INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS discovery_max_height INTEGER DEFAULT 220,
ADD COLUMN IF NOT EXISTS interested_in TEXT[] DEFAULT ARRAY['everyone'], -- To support ["male", "female", "everyone"]
ADD COLUMN IF NOT EXISTS discovery_min_age INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS discovery_max_age INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS discovery_max_distance INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS discovery_verified_only BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows users to update these columns (if not already covered)
-- This is just a safety check on the policy, though the previous policy should cover "update their own rows" in general.
-- Re-applying the policy just in case (safe to fail if exists, but pure SQL requires checking)

-- No complex logic here, just ensuring columns exist.
