-- Debug script to check current RLS policies on matches table
-- Run this in Supabase SQL editor to see what's blocking the inserts

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'matches';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'matches';

-- Test if we can insert a simple match (this will show the exact error)
-- Replace with actual user IDs from your database
-- INSERT INTO matches (user1_id, user2_id, lobby_id, status) 
-- VALUES ('test-user-1', 'test-user-2', 'test-lobby', 'matched');