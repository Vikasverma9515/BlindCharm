-- Add profile_completed field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have profile_completed = true if they have basic info
UPDATE users 
SET profile_completed = TRUE 
WHERE full_name IS NOT NULL 
  AND full_name != '' 
  AND bio IS NOT NULL 
  AND bio != ''
  AND interests IS NOT NULL 
  AND array_length(interests, 1) > 0;