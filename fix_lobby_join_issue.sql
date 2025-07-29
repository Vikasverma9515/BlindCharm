-- Fix lobby joining issue by ensuring proper RLS policies for lobby_participants table

-- First, let's check if the lobby_participants table exists and has RLS enabled
DO $$
BEGIN
    -- Enable RLS on lobby_participants if not already enabled
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lobby_participants') THEN
        ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on lobby_participants table';
    ELSE
        RAISE EXCEPTION 'lobby_participants table does not exist';
    END IF;
END $$;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lobby_participants';

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can join lobbies" ON lobby_participants;
DROP POLICY IF EXISTS "Users can leave lobbies" ON lobby_participants;
DROP POLICY IF EXISTS "Users can view lobby participants" ON lobby_participants;
DROP POLICY IF EXISTS "Users can update their own lobby participation" ON lobby_participants;

-- 1. Allow authenticated users to INSERT (join lobbies)
CREATE POLICY "Users can join lobbies" 
ON lobby_participants 
FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id AND
    -- Ensure the lobby exists and is active
    EXISTS (
        SELECT 1 FROM lobbies 
        WHERE lobbies.id = lobby_id 
        AND lobbies.status = 'waiting'
    ) AND
    -- Ensure user is not already in another lobby
    NOT EXISTS (
        SELECT 1 FROM lobby_participants lp2 
        WHERE lp2.user_id = auth.uid() 
        AND lp2.status = 'waiting'
        AND lp2.lobby_id != lobby_id
    )
);

-- 2. Allow users to DELETE their own participation (leave lobbies)
CREATE POLICY "Users can leave lobbies" 
ON lobby_participants 
FOR DELETE 
USING (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
);

-- 3. Allow users to view participants in lobbies they're part of
CREATE POLICY "Users can view lobby participants" 
ON lobby_participants 
FOR SELECT 
USING (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM lobby_participants lp2 
        WHERE lp2.lobby_id = lobby_participants.lobby_id 
        AND lp2.user_id = auth.uid()
    )
);

-- 4. Allow users to update their own participation (for blur_profile, etc.)
CREATE POLICY "Users can update their own lobby participation" 
ON lobby_participants 
FOR UPDATE 
USING (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
) 
WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = user_id
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lobby_participants'
ORDER BY cmd, policyname;

-- Also ensure lobbies table has proper SELECT policy for users to view available lobbies
DROP POLICY IF EXISTS "Users can view active lobbies" ON lobbies;

CREATE POLICY "Users can view active lobbies" 
ON lobbies 
FOR SELECT 
USING (
    auth.role() = 'authenticated' AND
    status = 'waiting'
);

-- Verify lobbies policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lobbies'
ORDER BY cmd, policyname;

RAISE NOTICE 'Lobby joining policies have been fixed!';