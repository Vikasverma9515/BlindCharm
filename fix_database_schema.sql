-- -- Fix database schema for whispers feature
-- -- Run this in Supabase SQL editor to fix data type issues

-- -- First, let's check the current data types
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'whispers' 
-- AND table_schema = 'public'
-- AND column_name IN ('likes_count', 'comments_count')
-- ORDER BY ordinal_position;

-- -- If the counts are text, we need to convert them to integer
-- -- First, update any non-numeric values to 0
-- UPDATE whispers 
-- SET likes_count = '0' 
-- WHERE likes_count IS NULL OR likes_count !~ '^[0-9]+$';

-- UPDATE whispers 
-- SET comments_count = '0' 
-- WHERE comments_count IS NULL OR comments_count !~ '^[0-9]+$';

-- -- Now alter the column types to integer
-- ALTER TABLE whispers 
-- ALTER COLUMN likes_count TYPE integer USING likes_count::integer;

-- ALTER TABLE whispers 
-- ALTER COLUMN comments_count TYPE integer USING comments_count::integer;

-- -- Set default values
-- ALTER TABLE whispers 
-- ALTER COLUMN likes_count SET DEFAULT 0;

-- ALTER TABLE whispers 
-- ALTER COLUMN comments_count SET DEFAULT 0;

-- -- Ensure no null values
-- UPDATE whispers 
-- SET likes_count = 0 
-- WHERE likes_count IS NULL;

-- UPDATE whispers 
-- SET comments_count = 0 
-- WHERE comments_count IS NULL;

-- -- Add NOT NULL constraints
-- ALTER TABLE whispers 
-- ALTER COLUMN likes_count SET NOT NULL;

-- ALTER TABLE whispers 
-- ALTER COLUMN comments_count SET NOT NULL;

-- -- Verify the changes
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'whispers' 
-- AND table_schema = 'public'
-- AND column_name IN ('likes_count', 'comments_count')
-- ORDER BY ordinal_position;