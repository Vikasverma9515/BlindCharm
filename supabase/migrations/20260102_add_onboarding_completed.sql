-- Add onboarding_completed column to galaxy_profiles
-- This tracks whether user has completed the MINIMAL onboarding (like Hinge/Bumble)
-- Onboarding requires: Name, Birthday, Gender, At least 1 Photo
-- Bio, interests, prompts, etc. can be filled later in profile editing

ALTER TABLE galaxy_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_galaxy_profiles_onboarding_completed 
ON galaxy_profiles(onboarding_completed);

-- Mark existing profiles as "onboarding completed" ONLY if they have the essentials
-- We check users table (name, DOB) and galaxy_profiles (gender, photos)
UPDATE galaxy_profiles gp
SET onboarding_completed = true
FROM users u
WHERE gp.user_id = u.id
  AND u.full_name IS NOT NULL 
  AND u.full_name != ''
  -- Note: You may need to add birth_date column to users table if it doesn't exist
  -- AND u.birth_date IS NOT NULL
  AND gp.gender IS NOT NULL
  AND (gp.photos IS NOT NULL AND array_length(gp.photos, 1) > 0);

-- If birth_date is in galaxy_profiles instead of users, use this instead:
-- UPDATE galaxy_profiles 
-- SET onboarding_completed = true
-- WHERE user_id IN (SELECT id FROM users WHERE full_name IS NOT NULL AND full_name != '')
--   AND birth_date IS NOT NULL
--   AND gender IS NOT NULL
--   AND (photos IS NOT NULL AND array_length(photos, 1) > 0);
