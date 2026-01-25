-- Migration: Allow GIF message type
-- Created: 2026-01-24
-- Description: Updates the valid_message_type check constraint to allow 'gif' messages

-- Drop the existing check constraint
ALTER TABLE match_messages 
DROP CONSTRAINT IF EXISTS valid_message_type;

-- Add the updated constraint that includes 'gif'
ALTER TABLE match_messages 
ADD CONSTRAINT valid_message_type 
CHECK (type IN ('text', 'voice', 'gif'));

-- Add comment
COMMENT ON CONSTRAINT valid_message_type ON match_messages IS 'Allows text, voice, and gif message types';
