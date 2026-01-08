-- Add interested_in preference to galaxy_profiles
ALTER TABLE galaxy_profiles 
ADD COLUMN IF NOT EXISTS interested_in text[] DEFAULT ARRAY['everyone'];

-- Update existing profiles with a default based on their gender (simple heuristic for seed data)
UPDATE galaxy_profiles
SET interested_in = CASE 
    WHEN gender = 'male' THEN ARRAY['female']
    WHEN gender = 'female' THEN ARRAY['male']
    ELSE ARRAY['everyone']
END
WHERE interested_in = ARRAY['everyone'];
