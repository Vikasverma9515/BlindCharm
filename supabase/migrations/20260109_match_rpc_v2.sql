-- Create version 2 of the matching function to force update logic
-- FIXED: height is TEXT in database ("5'10"), not INT.

CREATE OR REPLACE FUNCTION match_profiles_by_vibe_v2(
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
  similarity float,
  bio text,
  location text,
  job_title text,
  company text,
  school text,
  birth_date date,
  gender text,
  pronouns text,
  height text, -- FIXED: Changed from int to text
  voice_url text,
  prompts jsonb,
  current_mood text,
  energy_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    1 - (gp.embedding <=> query_embedding) as similarity,
    gp.bio,
    gp.location,
    gp.job_title,
    gp.company,
    gp.school,
    gp.birth_date,
    gp.gender,
    gp.pronouns,
    gp.height, -- This is text in DB
    gp.voice_url,
    gp.prompts,
    gp.current_mood,
    gp.energy_level
  FROM galaxy_profiles gp
  WHERE 
    -- Similarity threshold
    1 - (gp.embedding <=> query_embedding) > match_threshold
    -- Gender preference
    AND (
      'everyone' = ANY(user_gender_preference)
      OR gp.gender = ANY(user_gender_preference)
    )
    -- Age filter
    AND EXTRACT(YEAR FROM AGE(gp.birth_date)) BETWEEN min_age AND max_age
    -- Has embedding
    AND gp.embedding IS NOT NULL
    -- Exclusions
    AND NOT (gp.user_id = ANY(exclude_user_ids))
  ORDER BY gp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
