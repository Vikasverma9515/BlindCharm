-- Add prompts column to galaxy_profiles for Gen Z vibe checks
-- Run this in your Supabase SQL Editor

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS prompts jsonb DEFAULT '[]'::jsonb;

-- Ensure photos column exists (from previous step, but good to be safe)
ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT ARRAY[]::text[];

-- Comment on columns
COMMENT ON COLUMN public.galaxy_profiles.prompts IS 'Array of {question: string, answer: string} objects';
COMMENT ON COLUMN public.galaxy_profiles.photos IS 'Array of photo URLs';
