-- Add robust discovery preferences to galaxy_profiles

ALTER TABLE galaxy_profiles
ADD COLUMN IF NOT EXISTS birth_date DATE, -- Ensure birth_date exists for age calculation
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false, -- Profile verification status

-- Preferences
ADD COLUMN IF NOT EXISTS discovery_min_age INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS discovery_max_age INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS discovery_max_distance INTEGER DEFAULT 100, -- in km
ADD COLUMN IF NOT EXISTS discovery_verified_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add a default birth_date for existing profiles if null (random age between 20 and 35)
UPDATE galaxy_profiles
SET 
  birth_date = CURRENT_DATE - (floor(random() * (35-20 + 1) + 20) * 365 || ' days')::interval,
  latitude = 12.9716 + (random() * 0.1 - 0.05), -- Approximate Bangalore lat with jitter
  longitude = 77.5946 + (random() * 0.1 - 0.05) -- Approximate Bangalore lon with jitter
WHERE birth_date IS NULL OR latitude IS NULL;
