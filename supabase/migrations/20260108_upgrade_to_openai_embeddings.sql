-- Upgrade to OpenAI Embeddings (1536 dimensions)

-- 1. Drop existing index
DROP INDEX IF EXISTS galaxy_profiles_embedding_idx;

-- 2. Clear existing (incompatible) embeddings
UPDATE galaxy_profiles SET embedding = NULL;

-- 3. Alter column to 1536 dimensions
ALTER TABLE galaxy_profiles 
ALTER COLUMN embedding TYPE vector(1536);

-- 4. Recreate index (HNSW is better for performance)
CREATE INDEX galaxy_profiles_embedding_idx 
ON galaxy_profiles 
USING hnsw (embedding vector_cosine_ops);

-- 5. Create AI Matchmaker Queries Table
CREATE TABLE IF NOT EXISTS ai_matchmaker_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  query_text text NOT NULL,
  query_embedding vector(1536),
  matched_profiles uuid[], -- Array of matched user_ids
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_queries_user ON ai_matchmaker_queries(user_id);

-- 6. Create RPC Function for Vibe Matching
CREATE OR REPLACE FUNCTION match_profiles_by_vibe(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_gender_preference text[],
  min_age int,
  max_age int,
  exclude_user_ids uuid[]
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  about_me text,
  photos text[],
  identity_signals text[],
  interest_capsules text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gp.user_id,
    gp.full_name,
    gp.about_me,
    gp.photos,
    gp.identity_signals,
    gp.interest_capsules,
    1 - (gp.embedding <=> query_embedding) as similarity
  FROM galaxy_profiles gp
  LEFT JOIN users u ON gp.user_id = u.id
  WHERE 
    -- Similarity threshold
    1 - (gp.embedding <=> query_embedding) > match_threshold
    -- Gender preference
    AND (
      'everyone' = ANY(user_gender_preference)
      OR gp.gender = ANY(user_gender_preference)
    )
    -- Age filter
    AND EXTRACT(YEAR FROM AGE(u.dob)) BETWEEN min_age AND max_age
    -- Has embedding
    AND gp.embedding IS NOT NULL
    -- Exclusions (self, blocked, swiped)
    AND NOT (gp.user_id = ANY(exclude_user_ids))
  ORDER BY gp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
