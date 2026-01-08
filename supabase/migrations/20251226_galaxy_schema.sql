-- Enable pgvector extension if not already enabled
create extension if not exists vector;

-- 1. Galaxy Profiles Table
-- Separate table for Phase 2 Intent-Based Discovery
create table if not exists public.galaxy_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Firebase UID
  full_name text,
  avatar_url text,
  voice_url text, -- URL to 15s intro
  embedding vector(1536), -- For RAG
  intent_history jsonb default '[]'::jsonb,
  energy_level text, -- 'calm', 'high', etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups by Firebase UID
create index if not exists galaxy_profiles_user_id_idx on public.galaxy_profiles(user_id);

-- IVFFlat index for vector similarity search (approximate)
-- Note: 'lists' parameter might need tuning based on dataset size. 100 is a safe start.
create index if not exists galaxy_profiles_embedding_idx 
on public.galaxy_profiles 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);


-- 2. Galaxy Matches Table
-- Separate matches for the Galaxy experience
create table if not exists public.galaxy_matches (
  id uuid default gen_random_uuid() primary key,
  user_a text not null, -- Initiator UID
  user_b text not null, -- Receiver UID
  status text default 'pending', -- 'pending', 'matched', 'rejected'
  matched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists galaxy_matches_user_a_idx on public.galaxy_matches(user_a);
create index if not exists galaxy_matches_user_b_idx on public.galaxy_matches(user_b);
create index if not exists galaxy_matches_status_idx on public.galaxy_matches(status);


-- 3. Galaxy Match Stories Table
-- Caches the AI-generated story for a match
create table if not exists public.galaxy_match_stories (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.galaxy_matches(id) on delete cascade not null,
  story_text text not null,
  visual_proof_tags text[] default array[]::text[],
  created_at timestamptz default now()
);

create index if not exists galaxy_match_stories_match_id_idx on public.galaxy_match_stories(match_id);


-- 4. Vector Search Function
-- RPC function to find similar profiles based on embedding
create or replace function match_galaxy_profiles (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  user_id text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    galaxy_profiles.id,
    galaxy_profiles.user_id,
    1 - (galaxy_profiles.embedding <=> query_embedding) as similarity
  from galaxy_profiles
  where 1 - (galaxy_profiles.embedding <=> query_embedding) > match_threshold
  order by galaxy_profiles.embedding <=> query_embedding
  limit match_count;
end;
$$;


-- 5. Storage Bucket for Voice Intros
-- We attempt to insert, doing nothing if it exists
insert into storage.buckets (id, name, public)
values ('voice-intros', 'voice-intros', true)
on conflict (id) do nothing;

-- Storage Policy: Public Read
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'voice-intros' );

-- Storage Policy: Authenticated Upload (Client-side check for now)
-- Since we use Firebase Auth, we might need to rely on a service role or public upload with client-side validation for the prototype.
-- For now, we allow public uploads to this bucket to unblock the prototype, 
-- assuming the client generates a unique path /{user_id}/intro.webm
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'voice-intros' );
