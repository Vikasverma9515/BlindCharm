-- Phase 2 Profile Schema Update (Human & Intent-First)

-- 1. Add new "Human" fields
alter table public.galaxy_profiles
add column if not exists about_me text, -- "One Human Line"
add column if not exists identity_signals text[], -- ["Night owl", "Deep thinker"] (Max 4)
add column if not exists connection_style text, -- "I connect best when..."
add column if not exists interest_capsules text[], -- ["Fitness", "Nature"] (Max 5)
add column if not exists current_mood text, -- "Calm", "Curious"
add column if not exists pronouns text, -- "he/him", "she/her"
add column if not exists prompts jsonb default '[]'::jsonb; -- Vibe Check Q&A

-- 2. Add comments for documentation
comment on column public.galaxy_profiles.about_me is 'Short, human-readable emotional snapshot (max 150 chars)';
comment on column public.galaxy_profiles.identity_signals is 'Array of soft personality traits (max 4)';
comment on column public.galaxy_profiles.connection_style is 'Sentence starter completion for "I connect best when..."';
comment on column public.galaxy_profiles.interest_capsules is 'Curated list of interests (max 5)';
comment on column public.galaxy_profiles.current_mood is 'Dynamic daily mood status';
comment on column public.galaxy_profiles.prompts is 'Array of {question, answer} objects for conversation starters';

-- 3. Add constraints (Optional but recommended)
-- Ensure identity_signals doesn't exceed 4 items
alter table public.galaxy_profiles drop constraint if exists check_identity_signals_length;
alter table public.galaxy_profiles add constraint check_identity_signals_length 
check (array_length(identity_signals, 1) <= 4);

-- Ensure interest_capsules doesn't exceed 5 items
alter table public.galaxy_profiles drop constraint if exists check_interest_capsules_length;
alter table public.galaxy_profiles add constraint check_interest_capsules_length 
check (array_length(interest_capsules, 1) <= 5);
