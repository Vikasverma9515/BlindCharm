-- Create Galaxy Swipe Queue Table
-- This table maintains the persistent order of profiles shown to each user
-- Ensures consistent feed across page reloads and enables swipe limit features

CREATE TABLE IF NOT EXISTS galaxy_swipe_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ NULL,
  swiped_at TIMESTAMPTZ NULL,
  
  -- Ensure each user can only have one queue entry per profile
  UNIQUE(user_id, profile_id),
  
  -- Ensure each user's queue positions are unique (no gaps allowed in logic)
  UNIQUE(user_id, queue_position)
);

-- Performance Indexes
-- Index for fetching next batch of profiles for a user
CREATE INDEX IF NOT EXISTS idx_swipe_queue_user_position 
  ON galaxy_swipe_queue(user_id, queue_position);

-- Partial index for unswiped profiles (heavily queried)
CREATE INDEX IF NOT EXISTS idx_swipe_queue_user_unswiped 
  ON galaxy_swipe_queue(user_id, queue_position) 
  WHERE swiped_at IS NULL;

-- Index for analytics: viewed but not swiped
CREATE INDEX IF NOT EXISTS idx_swipe_queue_viewed_not_swiped
  ON galaxy_swipe_queue(user_id, viewed_at)
  WHERE viewed_at IS NOT NULL AND swiped_at IS NULL;

-- Row Level Security
ALTER TABLE galaxy_swipe_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own queue
CREATE POLICY "Users can view their own queue"
  ON galaxy_swipe_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can manage (INSERT, UPDATE, DELETE) their own queue
CREATE POLICY "Users can manage their own queue"
  ON galaxy_swipe_queue FOR ALL
  USING (auth.uid() = user_id);

-- Comment the table for documentation
COMMENT ON TABLE galaxy_swipe_queue IS 'Maintains the persistent swipe queue for each user in Galaxy mode. Ensures consistent profile ordering across reloads and tracks view/swipe timestamps for analytics and premium features.';
