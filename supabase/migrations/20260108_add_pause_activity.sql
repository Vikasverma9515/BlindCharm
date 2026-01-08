-- Add pause activity column to galaxy_profiles
-- When is_paused is true, the user's profile is hidden from discovery and daily picks

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false NOT NULL;

-- Create index for efficient filtering of paused profiles
CREATE INDEX IF NOT EXISTS galaxy_profiles_is_paused_idx 
ON public.galaxy_profiles(is_paused);

-- Add comment for documentation
COMMENT ON COLUMN public.galaxy_profiles.is_paused IS 'When true, user profile is hidden from discovery, swipe deck, and daily picks';
