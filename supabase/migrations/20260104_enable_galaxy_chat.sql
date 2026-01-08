
-- 1. Drop FK constraint on match_messages which links to 'matches' table
-- (We guess the name or pattern match. Usually match_messages_match_id_fkey)
ALTER TABLE match_messages DROP CONSTRAINT IF EXISTS match_messages_match_id_fkey;
ALTER TABLE match_messages DROP CONSTRAINT IF EXISTS fk_match_messages_match_id;

-- 2. Drop FK constraint on sender_id (references auth.users, which we aren't using)
ALTER TABLE match_messages DROP CONSTRAINT IF EXISTS match_messages_sender_id_fkey;
ALTER TABLE match_messages DROP CONSTRAINT IF EXISTS match_messages_user_id_fkey; -- Just in case

-- 3. DISABLE RLS because we are not using Supabase Auth
ALTER TABLE match_messages DISABLE ROW LEVEL SECURITY;
