-- Fix match_profiles_by_vibe to use galaxy_profiles.birth_date
-- This ensures matching works even if the public.users table has incomplete DOB data

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
  WHERE 
    -- Similarity threshold
    1 - (gp.embedding <=> query_embedding) > match_threshold
    -- Gender preference
    AND (
      'everyone' = ANY(user_gender_preference)
      OR gp.gender = ANY(user_gender_preference)
    )
    -- Age filter (Updated to use gp.birth_date)
    AND EXTRACT(YEAR FROM AGE(gp.birth_date)) BETWEEN min_age AND max_age
    -- Has embedding
    AND gp.embedding IS NOT NULL
    -- Exclusions (self, blocked, swiped)
    AND NOT (gp.user_id = ANY(exclude_user_ids))
  ORDER BY gp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
