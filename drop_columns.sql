-- Simple script to drop the count columns
-- Run these commands one by one in Supabase SQL editor

-- Drop the count columns (run these individually if needed)
ALTER TABLE whispers DROP COLUMN IF EXISTS likes_count;
ALTER TABLE whispers DROP COLUMN IF EXISTS comments_count;

-- Verify the columns are gone
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'whispers' 
AND table_schema = 'public'
ORDER BY ordinal_position;