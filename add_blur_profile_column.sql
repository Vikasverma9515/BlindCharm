-- Add blur_profile column to lobby_participants table
-- This allows users to blur their profile pictures for privacy

-- Add the column with default value false
ALTER TABLE lobby_participants 
ADD COLUMN IF NOT EXISTS blur_profile BOOLEAN DEFAULT false;

-- Update existing records to have blur_profile = false
UPDATE lobby_participants 
SET blur_profile = false 
WHERE blur_profile IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN lobby_participants.blur_profile IS 'Whether the user wants their profile picture blurred for privacy';