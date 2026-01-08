-- Ensure RLS is enabled
ALTER TABLE galaxy_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts (or use CREATE OR REPLACE if supported, but DROP IF EXISTS is safer for policies)
DROP POLICY IF EXISTS "Users can update their own daily profile" ON galaxy_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON galaxy_profiles;

-- Create comprehensive update policy
CREATE POLICY "Users can update their own profile"
ON galaxy_profiles
FOR UPDATE
TO authenticated
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- Ensure select policy exists too
DROP POLICY IF EXISTS "Users can read all profiles" ON galaxy_profiles;
CREATE POLICY "Users can read all profiles"
ON galaxy_profiles
FOR SELECT
TO authenticated
USING ( true );
