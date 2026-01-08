-- cleanup_stuck_user.sql
-- Run this in your Supabase SQL Editor to fix the "Key (id) is not present" error

-- 1. Remove from galaxy_profiles first (child table)
DELETE FROM public.galaxy_profiles 
WHERE user_id = '75f2251a-015f-40f7-99ab-e56a32316ef1';

-- 2. Remove from users (parent table)
DELETE FROM public.users 
WHERE id = '75f2251a-015f-40f7-99ab-e56a32316ef1';

-- NOTE: If you have satisfied the error, you can simply run this file.
