-- Add customization fields to galaxy_profiles

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS card_theme text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS mood_status text;

-- Add check constraint for themes (optional, but good for data integrity)
-- ALTER TABLE public.galaxy_profiles
-- ADD CONSTRAINT galaxy_profiles_card_theme_check 
-- CHECK (card_theme IN ('classic', 'modern', 'minimal', 'glass'));
