-- -- Complete setup for whispers feature
-- -- Run this in Supabase SQL editor

-- -- Create whispers table if it doesn't exist
-- CREATE TABLE IF NOT EXISTS whispers (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   content TEXT NOT NULL,
--   is_anonymous BOOLEAN DEFAULT true,
--   mood TEXT DEFAULT 'mysterious',
--   category TEXT DEFAULT 'confession',
--   background_theme TEXT DEFAULT 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
--   likes_count INTEGER DEFAULT 0 NOT NULL,
--   comments_count INTEGER DEFAULT 0 NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create whisper_comments table if it doesn't exist
-- CREATE TABLE IF NOT EXISTS whisper_comments (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   whisper_id UUID REFERENCES whispers(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   content TEXT NOT NULL,
--   is_anonymous BOOLEAN DEFAULT true,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create whisper_reactions table if it doesn't exist
-- CREATE TABLE IF NOT EXISTS whisper_reactions (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   whisper_id UUID REFERENCES whispers(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   reaction_type TEXT DEFAULT 'like',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   UNIQUE(whisper_id, user_id)
-- );

-- -- Fix existing data types if needed
-- DO $$
-- BEGIN
--   -- Check if likes_count is not integer and fix it
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'whispers' 
--     AND column_name = 'likes_count' 
--     AND data_type != 'integer'
--   ) THEN
--     -- Clean up any non-numeric values
--     UPDATE whispers SET likes_count = '0' WHERE likes_count IS NULL OR likes_count !~ '^[0-9]+$';
--     -- Convert to integer
--     ALTER TABLE whispers ALTER COLUMN likes_count TYPE integer USING likes_count::integer;
--     ALTER TABLE whispers ALTER COLUMN likes_count SET DEFAULT 0;
--     ALTER TABLE whispers ALTER COLUMN likes_count SET NOT NULL;
--   END IF;

--   -- Check if comments_count is not integer and fix it
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'whispers' 
--     AND column_name = 'comments_count' 
--     AND data_type != 'integer'
--   ) THEN
--     -- Clean up any non-numeric values
--     UPDATE whispers SET comments_count = '0' WHERE comments_count IS NULL OR comments_count !~ '^[0-9]+$';
--     -- Convert to integer
--     ALTER TABLE whispers ALTER COLUMN comments_count TYPE integer USING comments_count::integer;
--     ALTER TABLE whispers ALTER COLUMN comments_count SET DEFAULT 0;
--     ALTER TABLE whispers ALTER COLUMN comments_count SET NOT NULL;
--   END IF;
-- END $$;

-- -- Enable RLS
-- ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE whisper_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE whisper_reactions ENABLE ROW LEVEL SECURITY;

-- -- Create policies for whispers
-- DROP POLICY IF EXISTS "Users can view all whispers" ON whispers;
-- CREATE POLICY "Users can view all whispers" ON whispers
--   FOR SELECT USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "Users can create their own whispers" ON whispers;
-- CREATE POLICY "Users can create their own whispers" ON whispers
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Users can update their own whispers" ON whispers;
-- CREATE POLICY "Users can update their own whispers" ON whispers
--   FOR UPDATE USING (auth.uid() = user_id);

-- -- Create policies for comments
-- DROP POLICY IF EXISTS "Users can view all comments" ON whisper_comments;
-- CREATE POLICY "Users can view all comments" ON whisper_comments
--   FOR SELECT USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "Users can create comments" ON whisper_comments;
-- CREATE POLICY "Users can create comments" ON whisper_comments
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -- Create policies for reactions
-- DROP POLICY IF EXISTS "Users can view all reactions" ON whisper_reactions;
-- CREATE POLICY "Users can view all reactions" ON whisper_reactions
--   FOR SELECT USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "Users can manage their own reactions" ON whisper_reactions;
-- CREATE POLICY "Users can manage their own reactions" ON whisper_reactions
--   FOR ALL USING (auth.uid() = user_id);

-- -- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_whispers_created_at ON whispers(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_whispers_user_id ON whispers(user_id);
-- CREATE INDEX IF NOT EXISTS idx_whisper_comments_whisper_id ON whisper_comments(whisper_id);
-- CREATE INDEX IF NOT EXISTS idx_whisper_reactions_whisper_id ON whisper_reactions(whisper_id);
-- CREATE INDEX IF NOT EXISTS idx_whisper_reactions_user_whisper ON whisper_reactions(user_id, whisper_id);

-- -- Initialize counts for existing whispers
-- UPDATE whispers SET 
--   likes_count = COALESCE((
--     SELECT COUNT(*) 
--     FROM whisper_reactions 
--     WHERE whisper_id = whispers.id
--   ), 0),
--   comments_count = COALESCE((
--     SELECT COUNT(*) 
--     FROM whisper_comments 
--     WHERE whisper_id = whispers.id
--   ), 0)
-- WHERE likes_count IS NULL OR comments_count IS NULL;