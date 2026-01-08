-- 1. Clean up previous test runs (optional, depending on your needs)
DELETE FROM galaxy_profiles;
-- DELETE FROM users WHERE email LIKE 'test_galaxy_%'; -- Uncomment to clean users too

-- 2. Insert 20 detailed mock profiles
-- We use a DO block to generate data dynamically
DO $$
DECLARE
    new_id uuid;
    names text[] := ARRAY[
        'Zara Stardust', 'Neo The One', 'Luna Eclipse', 'Orion Hunter', 'Nova Spark',
        'Atlas Cloud', 'Lyra Silvers', 'Phoenix Rise', 'Sage Green', 'River Flow',
        'Echo Sound', 'Pixel Art', 'Code Weaver', 'Sky Walker', 'Ocean Deep',
        'Mars Rover', 'Vega Star', 'Aurora Borealis', 'Cyber Punk', 'Zen Master'
    ];
    bios text[] := ARRAY[
        'Chasing the northern lights and coffee shops.',
        'Digital nomad finding peace in the chaos.',
        'Stargazing is my therapy. Let’s connect.',
        'Building the future, one pixel at a time.',
        'Adventure awaits specifically on weekends.',
        'Cloud architect by day, dreamer by night.',
        'Music is the answer to everything.',
        'Rising from the ashes of bad code.',
        'Plant parent and green tea enthusiast.',
        'Go with the flow, but take a paddle.',
        'Listening to the universe.',
        'Living life in high resolution.',
        'Weaving dreams into reality.',
        'Sky is not the limit, it’s the view.',
        'Diving deep into philosophy and oceans.',
        'Exploring new frontiers.',
        'Shining bright like a diamond.',
        'Painting the sky with my own colors.',
        'High tech, low life.',
        'Mindfulness in a mindless world.'
    ];
    themes text[] := ARRAY['neon', 'minimal', 'glass', 'luxury', 'polaroid'];
    borders text[] := ARRAY['glow', 'thin', 'double', 'gradient', 'none'];
    moods text[] := ARRAY['vibing', 'chill', ' energetic', 'focused', 'dreamy'];
    i integer;
BEGIN
    FOR i IN 1..20 LOOP
        -- Generate a new UUID for this mock user
        new_id := gen_random_uuid();

        -- Insert into users (Simulating the Auth User)
        -- NOTE: This assumes you can insert into public.users without a strict FK to auth.users,
        -- OR that you don't mind these users not being able to 'login' via Supabase Auth.
        -- They are just for display in the feed.
        INSERT INTO users (id, email, full_name, profile_picture)
        VALUES (
            new_id,
            'test_galaxy_' || i || '@example.com',
            names[i],
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || names[i] -- Consistent avatar
        );

        -- Insert into galaxy_profiles
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
            intent_history,
            updated_at
        ) VALUES (
            new_id,
            names[i],
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || names[i],
            'https://okqsisewkhtbeuvmbuqx.supabase.co/storage/v1/object/public/voice-intros/profile-intro/aa963b8b-713d-4adb-9305-7cf26042125a/1766874658464.webm',
            bios[i],
            bios[i], -- Use Bio as About Me for now
            CASE (i % 4)
                WHEN 0 THEN 'calm'
                WHEN 1 THEN 'energetic'
                WHEN 2 THEN 'focused'
                ELSE 'deep'
            END,
            moods[(i % 5) + 1],
            ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=' || names[i]], -- Single photo
            ARRAY['Creator', 'Dreamer', 'Thinker'],
            ARRAY['Tech', 'Art', 'Space'],
            'I connect best when we share a laugh.',
            'they/them',
            '5''10"',
            themes[(i % 5) + 1],
            borders[(i % 5) + 1],
            '[{"energy_level":"calm","connection_type":"friendship"}]'::jsonb,
            NOW()
        );
    END LOOP;
END $$;
