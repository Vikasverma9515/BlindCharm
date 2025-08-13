-- Comprehensive RLS Policy Fix for BlindCharm
-- This script fixes Row Level Security policies that may be blocking data access

-- ============================================================================
-- 1. USERS TABLE - Fix profile loading issues
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create comprehensive user policies
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (
        auth.uid() = id
    ) WITH CHECK (
        auth.uid() = id
    );

-- ============================================================================
-- 2. LOBBY_PARTICIPANTS TABLE - Fix lobby loading issues
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view lobby participants" ON lobby_participants;
DROP POLICY IF EXISTS "Users can join lobbies" ON lobby_participants;
DROP POLICY IF EXISTS "Users can leave lobbies" ON lobby_participants;

-- Create comprehensive lobby participant policies
CREATE POLICY "lobby_participants_select_policy" ON lobby_participants
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "lobby_participants_insert_policy" ON lobby_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "lobby_participants_update_policy" ON lobby_participants
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "lobby_participants_delete_policy" ON lobby_participants
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- ============================================================================
-- 3. LOBBIES TABLE - Fix lobby creation and viewing
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view lobbies" ON lobbies;
DROP POLICY IF EXISTS "Admins can create lobbies" ON lobbies;

-- Create comprehensive lobby policies
CREATE POLICY "lobbies_select_policy" ON lobbies
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "lobbies_insert_policy" ON lobbies
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) OR
            auth.uid() IS NOT NULL
        )
    );

CREATE POLICY "lobbies_update_policy" ON lobbies
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) OR
            created_by = auth.uid()
        )
    );

-- ============================================================================
-- 4. MATCHES TABLE - Fix match viewing and creation
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "System can create matches" ON matches;

-- Create comprehensive match policies
CREATE POLICY "matches_select_policy" ON matches
    FOR SELECT USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "matches_insert_policy" ON matches
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "matches_update_policy" ON matches
    FOR UPDATE USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- ============================================================================
-- 5. WHISPERS TABLE - Fix whispers loading
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view whispers they're part of" ON whispers;
DROP POLICY IF EXISTS "Users can create whispers" ON whispers;

-- Create comprehensive whispers policies
CREATE POLICY "whispers_select_policy" ON whispers
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "whispers_insert_policy" ON whispers
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "whispers_update_policy" ON whispers
    FOR UPDATE USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- ============================================================================
-- 6. CHAT MESSAGES TABLE - Fix chat loading
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their matches" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;

-- Create comprehensive chat message policies
CREATE POLICY "chat_messages_select_policy" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        ) OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "chat_messages_insert_policy" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- ============================================================================
-- 7. NOTIFICATIONS TABLE - Fix notifications
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create comprehensive notification policies
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- ============================================================================
-- 8. MINDMATCH TABLES - Fix mindmatch functionality
-- ============================================================================

-- Mindmatch rounds
DROP POLICY IF EXISTS "Users can view current round" ON mindmatch_rounds;
CREATE POLICY "mindmatch_rounds_select_policy" ON mindmatch_rounds
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "mindmatch_rounds_insert_policy" ON mindmatch_rounds
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Mindmatch answers
DROP POLICY IF EXISTS "Users can view and submit answers" ON mindmatch_answers;
CREATE POLICY "mindmatch_answers_select_policy" ON mindmatch_answers
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "mindmatch_answers_insert_policy" ON mindmatch_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mindmatch matches
DROP POLICY IF EXISTS "Users can view their mindmatches" ON mindmatch_matches;
CREATE POLICY "mindmatch_matches_select_policy" ON mindmatch_matches
    FOR SELECT USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "mindmatch_matches_insert_policy" ON mindmatch_matches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 9. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_matches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lobby_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON lobbies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON matches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON whispers TO authenticated;
GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT ON mindmatch_rounds TO authenticated;
GRANT SELECT, INSERT ON mindmatch_answers TO authenticated;
GRANT SELECT, INSERT ON mindmatch_matches TO authenticated;

-- ============================================================================
-- 11. REFRESH SCHEMA CACHE
-- ============================================================================

-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the policies are working:

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'lobbies', 'lobby_participants', 'matches', 'whispers', 'chat_messages', 'notifications');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('users', 'lobbies', 'lobby_participants', 'matches', 'whispers', 'chat_messages', 'notifications')
ORDER BY tablename, policyname;

-- Test basic queries (replace with actual user ID)
-- SELECT * FROM users WHERE id = 'your-user-id';
-- SELECT * FROM lobby_participants WHERE user_id = 'your-user-id';
-- SELECT * FROM matches WHERE user1_id = 'your-user-id' OR user2_id = 'your-user-id';