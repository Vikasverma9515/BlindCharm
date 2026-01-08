-- Fix Embedding Dimensions Mismatch
-- The previous column might have been created as vector(1536) (OpenAI default).
-- We are using all-MiniLM-L6-v2 which is vector(384).

-- 1. Drop the index first (dependencies)
DROP INDEX IF EXISTS galaxy_profiles_embedding_idx;

-- 2. Alter the column type using a casting (converting existing data to 384 will fail/pad? 
-- actually better to clear it or just alter if empty. 
-- If it has data, direct alter might fail if dimensions don't match.
-- Safest is to drop and recreate or update to NULL first.
UPDATE galaxy_profiles SET embedding = NULL;

ALTER TABLE galaxy_profiles 
ALTER COLUMN embedding TYPE vector(384);

-- 3. Recreate the index
CREATE INDEX galaxy_profiles_embedding_idx ON galaxy_profiles USING hnsw (embedding vector_cosine_ops);
