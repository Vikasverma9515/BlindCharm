-- Add missing columns for Block/Unmatch features
ALTER TABLE public.galaxy_matches
ADD COLUMN IF NOT EXISTS unmatched_by text,
ADD COLUMN IF NOT EXISTS unmatched_at timestamptz,
ADD COLUMN IF NOT EXISTS blocked_by text,
ADD COLUMN IF NOT EXISTS blocked_at timestamptz;

-- Create an index to quickly filter out blocked matches if needed
CREATE INDEX IF NOT EXISTS galaxy_matches_blocked_by_idx ON public.galaxy_matches(blocked_by);

-- Verify policies (optional but good practice)
-- Ensure authenticated users can update their own matches
CREATE POLICY "Users can update their own matches"
ON public.galaxy_matches
FOR UPDATE
USING (
  auth.uid()::text = user_a OR auth.uid()::text = user_b
);
