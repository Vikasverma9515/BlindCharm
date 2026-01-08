-- Enable pgvector extension for embedding support
create extension if not exists vector;

-- Add new columns to profiles table
alter table profiles 
add column if not exists voice_url text,
add column if not exists embedding vector(1536), -- Standard OpenAI/Groq embedding size
add column if not exists intent_history jsonb default '[]'::jsonb;

-- Create match_stories table to store the generated stories
create table if not exists match_stories (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete cascade,
  story_text text not null,
  visual_proof_tags text[], -- Array of strings for tags like "Night-focused", "Calm energy"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for vector search to speed up retrieval
-- Note: ivfflat is good for approximate nearest neighbor search
create index if not exists profiles_embedding_idx on profiles using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Storage bucket policy for voice-intros (if not exists)
insert into storage.buckets (id, name, public)
values ('voice-intros', 'voice-intros', true)
on conflict (id) do nothing;

-- Allow public access to voice-intros
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'voice-intros' );

-- Allow authenticated users to upload their own voice intro
create policy "User Upload"
  on storage.objects for insert
  with check ( bucket_id = 'voice-intros' and auth.uid()::text = (storage.foldername(name))[1] );
