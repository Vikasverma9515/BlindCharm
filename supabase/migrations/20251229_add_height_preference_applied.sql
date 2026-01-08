-- Add height preferences to galaxy_profiles

ALTER TABLE galaxy_profiles
ADD COLUMN IF NOT EXISTS discovery_min_height INTEGER DEFAULT 150, -- in cm
ADD COLUMN IF NOT EXISTS discovery_max_height INTEGER DEFAULT 220; -- in cm
