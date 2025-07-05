-- Fix RLS policies for blur_profile updates in lobby_participants table

-- First, check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lobby_participants' 
        AND column_name = 'blur_profile'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE lobby_participants 
        ADD COLUMN blur_profile BOOLEAN DEFAULT false;
        
        -- Update existing records
        UPDATE lobby_participants 
        SET blur_profile = false 
        WHERE blur_profile IS NULL;
        
        RAISE NOTICE 'Added blur_profile column to lobby_participants table';
    ELSE
        RAISE NOTICE 'blur_profile column already exists';
    END IF;
END $$;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lobby_participants';

-- Drop existing update policy if it exists and recreate it
DROP POLICY IF EXISTS "Users can update their own lobby participation" ON lobby_participants;

-- Create a comprehensive update policy that allows users to update their own records
CREATE POLICY "Users can update their own lobby participation" 
ON lobby_participants 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can read all participants in lobbies they're part of
DROP POLICY IF EXISTS "Users can view lobby participants" ON lobby_participants;

CREATE POLICY "Users can view lobby participants" 
ON lobby_participants 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM lobby_participants lp2 
        WHERE lp2.lobby_id = lobby_participants.lobby_id 
        AND lp2.user_id = auth.uid()
    )
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'lobby_participants';