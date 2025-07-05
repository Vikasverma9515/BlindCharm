-- Add profile_completed field to users table
-- Run this in your Supabase SQL editor

-- Add the column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing users who have completed basic profile info
UPDATE users 
SET profile_completed = TRUE 
WHERE full_name IS NOT NULL 
  AND full_name != '' 
  AND bio IS NOT NULL 
  AND bio != ''
  AND interests IS NOT NULL 
  AND array_length(interests, 1) > 0;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);