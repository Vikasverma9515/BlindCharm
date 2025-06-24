-- -- Database structure check for whispers feature
-- -- Run this in Supabase SQL editor to verify your tables exist and have correct structure

-- -- Check if tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('whispers', 'whisper_comments', 'whisper_reactions', 'profiles');

-- -- Check whispers table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'whispers' 
-- AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- -- Check whisper_comments table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'whisper_comments' 
-- AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- -- Check whisper_reactions table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'whisper_reactions' 
-- AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- -- Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('whispers', 'whisper_comments', 'whisper_reactions')
-- AND schemaname = 'public';

-- -- Check existing policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('whispers', 'whisper_comments', 'whisper_reactions')
-- AND schemaname = 'public';