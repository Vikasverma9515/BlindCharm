-- -- Test script to verify whispers setup
-- -- Run this after setting up the tables

-- -- Check table structures
-- SELECT 'whispers' as table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'whispers' AND table_schema = 'public'
-- UNION ALL
-- SELECT 'whisper_comments' as table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'whisper_comments' AND table_schema = 'public'
-- UNION ALL
-- SELECT 'whisper_reactions' as table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'whisper_reactions' AND table_schema = 'public'
-- ORDER BY table_name, column_name;

-- -- Check RLS status
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('whispers', 'whisper_comments', 'whisper_reactions')
-- AND schemaname = 'public';

-- -- Check policies
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies 
-- WHERE tablename IN ('whispers', 'whisper_comments', 'whisper_reactions')
-- AND schemaname = 'public'
-- ORDER BY tablename, policyname;