-- Voice Messages Migration for BlindCharm
-- Run this in your Supabase SQL editor

-- First, let's check if the match_messages table exists and its structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'match_messages' 
-- AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Create match_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS match_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'voice', 'image')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON match_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_sender_id ON match_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_created_at ON match_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_match_messages_type ON match_messages(type);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key for match_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_match_messages_match_id'
    ) THEN
        ALTER TABLE match_messages 
        ADD CONSTRAINT fk_match_messages_match_id 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for sender_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_match_messages_sender_id'
    ) THEN
        ALTER TABLE match_messages 
        ADD CONSTRAINT fk_match_messages_sender_id 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_match_messages_updated_at ON match_messages;
CREATE TRIGGER update_match_messages_updated_at
    BEFORE UPDATE ON match_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create the voice-messages storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies for match_messages
ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages from their own matches
CREATE POLICY "Users can view messages from their matches" ON match_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = match_messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Policy: Users can only insert messages to their own matches
CREATE POLICY "Users can insert messages to their matches" ON match_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = match_messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Policy: Users can only update their own messages
CREATE POLICY "Users can update their own messages" ON match_messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Policy: Users can only delete their own messages
CREATE POLICY "Users can delete their own messages" ON match_messages
    FOR DELETE USING (sender_id = auth.uid());

-- Set up RLS policies for voice-messages storage bucket
CREATE POLICY "Users can upload voice messages to their matches" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'voice-messages' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view voice messages from their matches" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'voice-messages' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM matches 
                WHERE (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
                AND (storage.foldername(name))[2] = matches.id::text
            )
        )
    );

CREATE POLICY "Users can delete their own voice messages" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'voice-messages' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Grant necessary permissions
GRANT ALL ON match_messages TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Verify the setup
SELECT 'Migration completed successfully!' as status;

-- Optional: Check the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'match_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;