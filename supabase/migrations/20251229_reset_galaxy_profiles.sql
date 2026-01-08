-- 1. Wipe existing profiles
DELETE FROM galaxy_profiles;

-- 2. Repopulate from users table
INSERT INTO galaxy_profiles (
    user_id,
    full_name,
    avatar_url,
    voice_url,
    bio,
    about_me,
    energy_level,
    current_mood,
    photos,
    identity_signals,
    interest_capsules,
    connection_style,
    pronouns,
    height,
    card_theme,
    card_border,
    updated_at
)
SELECT
    id as user_id,
    COALESCE(full_name, 'BlindCharm User') as full_name,
    profile_picture as avatar_url,
    'https://okqsisewkhtbeuvmbuqx.supabase.co/storage/v1/object/public/voice-intros/profile-intro/aa963b8b-713d-4adb-9305-7cf26042125a/1766874658464.webm' as voice_url,
    COALESCE(bio, 'Ready to explore the galaxy.') as bio,
    COALESCE(bio, 'Ready to explore the galaxy.') as about_me,
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'calm'
        WHEN 1 THEN 'energetic'
        WHEN 2 THEN 'focused'
        ELSE 'playful'
    END as energy_level,
    'vibing' as current_mood,
    CASE 
        WHEN profile_picture IS NOT NULL THEN ARRAY[profile_picture]
        ELSE ARRAY[]::text[]
    END as photos,
    ARRAY['Explorer', 'Stargazer', 'BlindCharm'] as identity_signals,
    ARRAY['Tech', 'Music', 'Travel', 'Art'] as interest_capsules,
    'I connect best when sharing ideas.' as connection_style,
    'they/them' as pronouns,
    '5''9"' as height,
    'neon' as card_theme,
    'glow' as card_border,
    NOW() as updated_at
FROM users
WHERE profile_picture IS NOT NULL; -- Ensure we only bring in valid users with photos
