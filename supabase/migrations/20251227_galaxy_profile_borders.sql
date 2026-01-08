-- Add card_border field to galaxy_profiles

ALTER TABLE public.galaxy_profiles
ADD COLUMN IF NOT EXISTS card_border text DEFAULT 'thin';

-- Add check constraint for borders (optional)
-- ALTER TABLE public.galaxy_profiles
-- ADD CONSTRAINT galaxy_profiles_card_border_check 
-- CHECK (card_border IN ('none', 'thin', 'glow', 'double', 'gradient'));
