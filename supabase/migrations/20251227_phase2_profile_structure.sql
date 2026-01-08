-- Add Phase 2 Profile Fields to galaxy_profiles

alter table public.galaxy_profiles
add column if not exists about_me text, -- "One Human Line"
add column if not exists identity_signals text[], -- ["Night owl", "Deep thinker"] (Max 4)
add column if not exists connection_style text, -- "I connect best when..."
add column if not exists interest_capsules text[], -- ["Fitness", "Nature"] (Max 5)
add column if not exists current_mood text, -- "Calm", "Curious"
add column if not exists pronouns text; -- "he/him", "she/her"

-- Comment on columns for clarity
comment on column public.galaxy_profiles.about_me is 'Short, human-readable emotional snapshot (max 1-2 sentences)';
comment on column public.galaxy_profiles.identity_signals is 'Array of soft personality traits (max 4)';
comment on column public.galaxy_profiles.connection_style is 'Sentence starter completion for "I connect best when..."';
comment on column public.galaxy_profiles.interest_capsules is 'Curated list of interests (max 5)';
comment on column public.galaxy_profiles.current_mood is 'Dynamic daily mood status';
