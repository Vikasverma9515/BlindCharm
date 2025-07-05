-- Fix RLS policies for matches table
-- Run this in Supabase SQL editor

-- First, let's check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'matches';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can only see their own matches" ON matches;
DROP POLICY IF EXISTS "Users can only insert their own matches" ON matches;
DROP POLICY IF EXISTS "Users can only update their own matches" ON matches;

-- Create more permissive policies for the matching system

-- Allow authenticated users to insert matches (for the matching service)
CREATE POLICY "Allow authenticated users to insert matches" ON matches
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to view matches they are part of
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

-- Allow users to update matches they are part of (for reveal requests, etc.)
CREATE POLICY "Users can update their matches" ON matches
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id)
  WITH CHECK (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

-- Ensure RLS is enabled
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Check the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'matches';