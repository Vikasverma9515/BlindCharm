-- Read Receipts Migration (NextAuth Compatible)
-- Handles TEXT user_id from NextAuth by casting to UUID

-- 1. Add read_at column to track when message was seen
ALTER TABLE match_messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL;

-- 2. Add index for performance on unread message queries
CREATE INDEX IF NOT EXISTS idx_match_messages_read_at 
ON match_messages(match_id, read_at) 
WHERE read_at IS NULL;

-- 3. Add index for fetching last message per match
CREATE INDEX IF NOT EXISTS idx_match_messages_match_created 
ON match_messages(match_id, created_at DESC);

-- 4. Function to get unread message count for a user
-- CRITICAL: Cast TEXT parameter to UUID for comparison
CREATE OR REPLACE FUNCTION get_unread_count(user_id_param TEXT)
RETURNS TABLE(match_id UUID, unread_count BIGINT) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mm.match_id,
        COUNT(*) as unread_count
    FROM match_messages mm
    WHERE mm.read_at IS NULL 
      AND mm.sender_id::TEXT != user_id_param  -- Cast UUID to TEXT
      AND EXISTS (
          SELECT 1 FROM galaxy_matches gm 
          WHERE gm.id = mm.match_id 
          AND (gm.user_a = user_id_param OR gm.user_b = user_id_param)
      )
    GROUP BY mm.match_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to mark messages as read
-- CRITICAL: Cast TEXT parameter to UUID for comparison
CREATE OR REPLACE FUNCTION mark_messages_read(
    match_id_param UUID,
    user_id_param TEXT
)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
    UPDATE match_messages
    SET read_at = NOW()
    WHERE match_id = match_id_param
      AND sender_id::TEXT != user_id_param  -- Cast UUID to TEXT
      AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Create view for last message per match (optimized)
CREATE OR REPLACE VIEW match_last_messages AS
SELECT DISTINCT ON (match_id)
    match_id,
    id as message_id,
    sender_id,
    content,
    type,
    created_at,
    read_at
FROM match_messages
ORDER BY match_id, created_at DESC;

-- Verify setup
SELECT 'Read receipts migration completed!' as status;

-- Test the functions (optional - replace with real user_id)
-- SELECT * FROM get_unread_count('your-user-id-here');
