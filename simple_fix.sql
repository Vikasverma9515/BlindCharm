-- Simple fix for whispers feature
-- This approach calculates counts dynamically, so we don't need stored counts

-- Ensure tables exist with correct structure
CREATE TABLE IF NOT EXISTS whispers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  mood TEXT DEFAULT 'mysterious',
  category TEXT DEFAULT 'confession',
  background_theme TEXT DEFAULT 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whisper_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whisper_id UUID REFERENCES whispers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whisper_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whisper_id UUID REFERENCES whispers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(whisper_id, user_id)
);

-- Remove count columns if they exist (we'll calculate dynamically)
-- Note: Run these one by one if you get errors
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whispers' AND column_name = 'likes_count') THEN
        ALTER TABLE whispers DROP COLUMN likes_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whispers' AND column_name = 'comments_count') THEN
        ALTER TABLE whispers DROP COLUMN comments_count;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whisper_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whisper_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for whispers
DROP POLICY IF EXISTS "Users can view all whispers" ON whispers;
CREATE POLICY "Users can view all whispers" ON whispers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own whispers" ON whispers;
CREATE POLICY "Users can create their own whispers" ON whispers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for comments
DROP POLICY IF EXISTS "Users can view all comments" ON whisper_comments;
CREATE POLICY "Users can view all comments" ON whisper_comments
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create comments" ON whisper_comments;
CREATE POLICY "Users can create comments" ON whisper_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for reactions
DROP POLICY IF EXISTS "Users can view all reactions" ON whisper_reactions;
CREATE POLICY "Users can view all reactions" ON whisper_reactions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage their own reactions" ON whisper_reactions;
CREATE POLICY "Users can manage their own reactions" ON whisper_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whispers_created_at ON whispers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whisper_comments_whisper_id ON whisper_comments(whisper_id);
CREATE INDEX IF NOT EXISTS idx_whisper_reactions_whisper_id ON whisper_reactions(whisper_id);
CREATE INDEX IF NOT EXISTS idx_whisper_reactions_user_whisper ON whisper_reactions(user_id, whisper_id);