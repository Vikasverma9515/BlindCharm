-- Enable vector extension (if not already)
create extension if not exists vector;

-- Add embedding column (384 dimensions for all-MiniLM-L6-v2)
alter table public.galaxy_profiles
add column if not exists embedding vector(384);

-- Create index for faster querying (IVFFlat)
-- Note: This requires at least ~2000 rows to be effective, 
-- but good to have definition ready. 
-- Will create HNSW index instead as it's better for performance.
create index if not exists galaxy_profiles_embedding_idx 
on public.galaxy_profiles 
using hnsw (embedding vector_cosine_ops);

-- Function to match profiles
create or replace function public.match_profiles (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  exclude_user_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  full_name text,
  bio text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    gp.id,
    gp.user_id,
    gp.full_name,
    gp.bio,
    1 - (gp.embedding <=> query_embedding) as similarity
  from public.galaxy_profiles gp
  where 1 - (gp.embedding <=> query_embedding) > match_threshold
  and gp.user_id != exclude_user_id
  order by gp.embedding <=> query_embedding
  limit match_count;
end;
$$;
