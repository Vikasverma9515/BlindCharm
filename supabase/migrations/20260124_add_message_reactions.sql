-- Migration: Add message reactions support
-- Created: 2026-01-24
-- Description: Adds table for emoji reactions on messages

-- Create message reactions table
CREATE TABLE IF NOT EXISTS galaxy_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES match_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (length(emoji) <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate reactions (same user, same emoji, same message)
    UNIQUE(message_id, user_id, emoji)
);

-- Add indexes for performance
CREATE INDEX idx_reactions_message ON galaxy_message_reactions(message_id);
CREATE INDEX idx_reactions_user ON galaxy_message_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE galaxy_message_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reactions on messages in their matches
CREATE POLICY "Users can view reactions on their match messages"
    ON galaxy_message_reactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM match_messages m
            JOIN galaxy_matches ma ON m.match_id = ma.id
            WHERE m.id = message_id
            AND (ma.user_a = auth.uid() OR ma.user_b = auth.uid())
        )
    );

-- Policy: Users can add reactions to messages in their matches
CREATE POLICY "Users can add reactions to their match messages"
    ON galaxy_message_reactions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM match_messages m
            JOIN galaxy_matches ma ON m.match_id = ma.id
            WHERE m.id = message_id
            AND (ma.user_a = auth.uid() OR ma.user_b = auth.uid())
        )
    );

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
    ON galaxy_message_reactions
    FOR DELETE
    USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE galaxy_message_reactions IS 'Stores emoji reactions to chat messages';
