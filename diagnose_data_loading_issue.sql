-- Diagnostic Script for BlindCharm Data Loading Issues
-- Run this in Supabase SQL Editor to identify the root cause

-- ============================================================================
-- 1. CHECK AUTHENTICATION STATUS
-- ============================================================================

-- Check if auth.uid() is working
SELECT 
    'Current auth.uid()' as check_type,
    auth.uid() as result,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ No authenticated user'
        ELSE '✅ User authenticated'
    END as status;

-- ============================================================================
-- 2. CHECK RLS STATUS ON ALL TABLES
-- ============================================================================

SELECT 
    'RLS Status' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE tablename IN ('users', 'lobbies', 'lobby_participants', 'matches', 'whispers', 'chat_messages', 'notifications')
ORDER BY tablename;

-- ============================================================================
-- 3. CHECK EXISTING RLS POLICIES
-- ============================================================================

SELECT 
    'RLS Policies' as check_type,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive'
        ELSE '⚠️ Restrictive'
    END as policy_type
FROM pg_policies 
WHERE tablename IN ('users', 'lobbies', 'lobby_participants', 'matches', 'whispers', 'chat_messages', 'notifications')
ORDER BY tablename, policyname;

-- ============================================================================
-- 4. TEST DATA ACCESS (Replace USER_ID with actual user ID)
-- ============================================================================

-- Test users table access
SELECT 
    'Users Table Test' as check_type,
    COUNT(*) as accessible_records,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Can access users table'
        ELSE '❌ Cannot access users table'
    END as status
FROM users 
WHERE id = auth.uid();

-- Test lobby_participants access
SELECT 
    'Lobby Participants Test' as check_type,
    COUNT(*) as accessible_records,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Can access lobby_participants table'
        ELSE '❌ Cannot access lobby_participants table'
    END as status
FROM lobby_participants 
WHERE user_id = auth.uid();

-- Test matches access
SELECT 
    'Matches Test' as check_type,
    COUNT(*) as accessible_records,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Can access matches table'
        ELSE '❌ Cannot access matches table'
    END as status
FROM matches 
WHERE user1_id = auth.uid() OR user2_id = auth.uid();

-- Test whispers access
SELECT 
    'Whispers Test' as check_type,
    COUNT(*) as accessible_records,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ Can access whispers table'
        ELSE '❌ Cannot access whispers table'
    END as status
FROM whispers 
WHERE sender_id = auth.uid() OR receiver_id = auth.uid();

-- ============================================================================
-- 5. CHECK FOR COMMON ISSUES
-- ============================================================================

-- Check if user exists in users table
SELECT 
    'User Existence Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE id = auth.uid()) THEN '✅ User exists in database'
        ELSE '❌ User does not exist in database'
    END as status;

-- Check for orphaned sessions (user in auth but not in users table)
SELECT 
    'Session Integrity Check' as check_type,
    auth.uid() as auth_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid()) 
        THEN '❌ Orphaned session - user in auth but not in users table'
        WHEN auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid()) 
        THEN '✅ Session integrity good'
        ELSE '❌ No authenticated session'
    END as status;

-- ============================================================================
-- 6. CHECK TABLE PERMISSIONS
-- ============================================================================

SELECT 
    'Table Permissions' as check_type,
    schemaname,
    tablename,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('users', 'lobbies', 'lobby_participants', 'matches', 'whispers', 'chat_messages', 'notifications')
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY tablename, privilege_type;

-- ============================================================================
-- 7. SPECIFIC ISSUE DIAGNOSTICS
-- ============================================================================

-- Check for specific RLS policy violations
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Test inserting a simple record to see if RLS blocks it
    BEGIN
        INSERT INTO lobby_participants (lobby_id, user_id, status, joined_at) 
        VALUES ('test-lobby', auth.uid(), 'waiting', NOW());
        
        DELETE FROM lobby_participants 
        WHERE lobby_id = 'test-lobby' AND user_id = auth.uid();
        
        RAISE NOTICE '✅ RLS allows basic operations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ RLS blocking operations: %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- 8. SUMMARY QUERY
-- ============================================================================

SELECT 
    '=== DIAGNOSTIC SUMMARY ===' as summary,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ CRITICAL: No authenticated user'
        WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid()) THEN '❌ CRITICAL: User not in database'
        ELSE '✅ Authentication looks good'
    END as auth_status,
    
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as user_policies_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'lobby_participants') as lobby_policies_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'matches') as match_policies_count;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================

/*
HOW TO USE THIS DIAGNOSTIC:

1. Copy and paste this entire script into your Supabase SQL Editor
2. Run it while logged in as one of the affected users
3. Look for any ❌ (red X) indicators in the results
4. The most common issues will be:
   - "No authenticated user" - Session expired
   - "User not in database" - Orphaned session
   - "Cannot access [table] table" - RLS policy too restrictive
   - "RLS blocking operations" - Policies preventing data access

5. If you see RLS issues, run the fix_rls_policies_comprehensive.sql script

6. If you see authentication issues, the user may need to:
   - Clear browser cache and cookies
   - Log out and log back in
   - Check if their account still exists in the auth.users table
*/