-- Add AI columns to galaxy_daily_picks for caching
alter table public.galaxy_daily_picks
add column if not exists insight text,
add column if not exists match_score integer,
add column if not exists compatibility_summary text;

-- Enable pgvector extension for future "Vibe Matching"
-- (This is usually available on Supabase by default, but good to be explicit)
create extension if not exists vector;

-- Add embedding column to galaxy_profiles (for future use)
-- Dimensions: 384 is common for small efficient models like all-MiniLM-L6-v2
-- alter table public.galaxy_profiles add column if not exists embedding vector(384);
