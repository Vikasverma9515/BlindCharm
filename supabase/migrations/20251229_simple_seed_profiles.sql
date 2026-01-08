-- SIMPLIFIED SEED SCRIPT
-- 1. Wipe previous data
DELETE FROM galaxy_profiles;
DELETE FROM users WHERE email LIKE 'rag_test_%';

-- 2. Insert 20 detailed profiles using a robust DO block
DO $$
DECLARE
    new_id uuid;
    voice_const text := 'https://okqsisewkhtbeuvmbuqx.supabase.co/storage/v1/object/public/voice-intros/profile-intro/aa963b8b-713d-4adb-9305-7cf26042125a/1766874658464.webm';
    
    -- JSONB array of rich profile data
    -- JSONB array of rich profile data (Base Templates)
    base_profiles jsonb := '[
        {
            "name": "Aria Chen", "location": "San Francisco, CA", "job": "UX Designer", "company": "Figma", "school": "RISD", "gender": "female",
            "bio": "Creative soul living in a digital world. I love structured chaos.",
            "about": "I spend my days designing interfaces and my nights painting colorful abstracts. Looking for someone who appreciates the fine balance between logic and emotion.",
            "interests": ["Art", "Design", "Tech", "Sushi"],
            "identity": ["Creative", "Visionary", "Designer"],
            "interest_caps": ["Design", "Art", "Tech"],
            "conn": "I connect best when we can critique art or design together.",
            "energy": "passionate", "mood": "vibing", "theme": "neon", "border": "glow", "pronouns": "she/her", "height": "5''6''",
            "prompt_data": [{"question": "My simple pleasure", "answer": "Sketching in a park on a sunny day."}]
        },
        {
            "name": "Marcus Thorne", "location": "New York, NY", "job": "Architect", "company": "Thorne & Assoc", "school": "Cornell", "gender": "male",
            "bio": "Building skylines and breaking boundaries. Jazz enthusiast.",
            "about": "Obsessed with lines, angles, and urban flow. On weekends, you can find me at the Blue Note listening to Coltrane. I value honesty and ambition above all.",
            "interests": ["Architecture", "Jazz", "Urbanism", "Whiskey"],
            "identity": ["Architect", "Jazz Lover", "Urbanite"],
            "interest_caps": ["Jazz", "Building", "City"],
            "conn": "I connect best when we can debate brutalism vs. art deco.",
            "energy": "focused", "mood": "chill", "theme": "minimal", "border": "thin", "pronouns": "he/him", "height": "6''1''",
            "prompt_data": [{"question": "I geek out on", "answer": "The history of skyscrapers."}]
        },
        {
            "name": "Elena Rodriguez", "location": "Austin, TX", "job": "Startup Founder", "company": "Stealth Mode", "school": "Stanford", "gender": "female",
            "bio": "Hustling to build the next unicorn. Coffee addict.",
            "about": "Moved here to build my tech company. It is intense but rewarding. I need someone who understands the grind but can also drag me out for tacos and margaritas.",
            "interests": ["Startups", "Tech", "Tacos", "Running"],
            "identity": ["Founder", "Hustler", "Runner"],
            "interest_caps": ["Business", "Tech", "Fitness"],
            "conn": "I connect best when we are brainstorming wild ideas.",
            "energy": "energetic", "mood": "focused", "theme": "luxury", "border": "gradient", "pronouns": "she/her", "height": "5''7''",
            "prompt_data": [{"question": "My goal for this year", "answer": "Series A funding and a marathon."}]
        },
        {
            "name": "Kaito Tanaka", "location": "Tokyo / Remote", "job": "Game Developer", "company": "Nintendo", "school": "Kyoto Univ", "gender": "male",
            "bio": "Code, anime, and late-night ramen. Building virtual worlds.",
            "about": "I create immersive RPGs for a living. I love storytelling and world-building. Looking for a player 2 to explore both the digital and physical realms.",
            "interests": ["Gaming", "Anime", "Coding", "Ramen"],
            "identity": ["Gamer", "Developer", "Otaku"],
            "interest_caps": ["Games", "Code", "Japan"],
            "conn": "I connect best when playing co-op campaigns.",
            "energy": "calm", "mood": "dreamy", "theme": "neon", "border": "double", "pronouns": "he/him", "height": "5''10''",
            "prompt_data": [{"question": "A fun fact about me", "answer": "I have beaten Dark Souls without dying."}]
        },
        {
            "name": "Sarah Jenkins", "location": "Denver, CO", "job": "Geologist", "company": "US Geo Survey", "school": "Colorado School of Mines", "gender": "female",
            "bio": "Rocks are cool, but mountains are better. Nature fanatic.",
            "about": "Always plotting my next hike or climb. I feel most alive when I am above 14,000 feet. If you love the outdoors, camping, and getting dirty, we will get along.",
            "interests": ["Hiking", "Climbing", "Geology", "Dogs"],
            "identity": ["Hiker", "Explorer", "Scientist"],
            "interest_caps": ["Nature", "Mountains", "Adventure"],
            "conn": "I connect best when on a trail.",
            "energy": "energetic", "mood": "energetic", "theme": "polaroid", "border": "none", "pronouns": "she/her", "height": "5''5''",
            "prompt_data": [{"question": "My ideal weekend", "answer": "Camping under the Milky Way."}]
        },
        {
            "name": "David Okafor", "location": "London, UK", "job": "Fintech Analyst", "company": "Revolut", "school": "LSE", "gender": "male",
            "bio": "Numbers tell a story. Football (soccer) explains life.",
            "about": "I work in finance but live for the weekends. Huge Arsenal fan. I appreciate wit, banter, and a good pub quiz. Looking for someone grounded and smart.",
            "interests": ["Finance", "Soccer", "Travel", "Pubs"],
            "identity": ["Analyst", "Fan", "Traveler"],
            "interest_caps": ["Money", "Sports", "London"],
            "conn": "I connect best over a pint and a match.",
            "energy": "focused", "mood": "vibing", "theme": "minimal", "border": "glow", "pronouns": "he/him", "height": "6''0''",
            "prompt_data": [{"question": "Don''t hate me if I", "answer": "Check the score during dinner."}]
        },
        {
            "name": "Luna Lovegood", "location": "Los Angeles, CA", "job": "Astrologer", "company": "Self-Employed", "school": "Apprentice", "gender": "female",
            "bio": "Written in the stars. Moon child. seeking cosmic connection.",
            "about": "I read charts and vibes. I believe everything happens for a reason. I am looking for a spiritual connection that transcends the mundane. Scorpio sun, Pisces moon.",
            "interests": ["Astrology", "Crystals", "Yoga", "Vegan"],
            "identity": ["Mystic", "Spiritual", "Dreamer"],
            "interest_caps": ["Spirituality", "Stars", "Wellness"],
            "conn": "I connect best when sharing deep conversations.",
            "energy": "deep", "mood": "dreamy", "theme": "glass", "border": "glow", "pronouns": "she/they", "height": "5''4''",
            "prompt_data": [{"question": "I''m convinced that", "answer": "We have all met before in a past life."}]
        },
        {
            "name": "James Logan Wolffe", "location": "Chicago, IL", "job": "Chef", "company": "The Bear", "school": "Culinary Inst", "gender": "male",
            "bio": "Food is love. Fire is life. Yes, chef.",
            "about": "I communicate through food. Kitchen life is chaotic, so I value peace at home. I make the best risotto you will ever taste. looking for someone with an appetite.",
            "interests": ["Cooking", "Food", "Wine", "Movies"],
            "identity": ["Chef", "Foodie", "Creative"],
            "interest_caps": ["Food", "Cooking", "Taste"],
            "conn": "I connect best when cooking for you.",
            "energy": "passionate", "mood": "focused", "theme": "luxury", "border": "thin", "pronouns": "he/him", "height": "5''11''",
            "prompt_data": [{"question": "My signature dish", "answer": "Truffle Mushroom Risotto."}]
        },
        {
            "name": "Priya Patel", "location": "Bangalore, IN", "job": "Software Engineer", "company": "Google", "school": "IIT Bombay", "gender": "female",
            "bio": "Debugging code and life. avid reader.",
            "about": "Rational thinker with a romantic heart. I love solving complex problems and optimizing systems, but I also love getting lost in a good fiction book.",
            "interests": ["Coding", "Reading", "Sci-Fi", "Coffee"],
            "identity": ["Engineer", "Reader", "Intellectual"],
            "interest_caps": ["Tech", "Books", "Logic"],
            "conn": "I connect best when discussing technology trends.",
            "energy": "focused", "mood": "chill", "theme": "minimal", "border": "gradient", "pronouns": "she/her", "height": "5''3''",
            "prompt_data": [{"question": "A book I recommend", "answer": "Project Hail Mary."}]
        },
        {
            "name": "Tom Brady", "location": "Boston, MA", "job": "Nurse", "company": "General Hospital", "school": "UMass", "gender": "male",
            "bio": "Saving lives and taking naps. Compassion is key.",
            "about": "ER Nurse. I see a lot of crazy stuff, so I keep my personal life chill. I love hiking with my golden retriever and watching basketball.",
            "interests": ["Healthcare", "Dogs", "Basketball", "Hiking"],
            "identity": ["Caregiver", "Dog Dad", "Chill"],
            "interest_caps": ["Health", "Pets", "Sports"],
            "conn": "I connect best when walking our dogs.",
            "energy": "calm", "mood": "vibing", "theme": "polaroid", "border": "none", "pronouns": "he/him", "height": "5''10''",
            "prompt_data": [{"question": "My real life hero", "answer": "My mom."}]
        }
    ]'::jsonb;
    
    p jsonb;
    i integer;
    random_offset integer;
    
    p jsonb;
BEGIN
    FOR i IN 1..50 LOOP
        -- Select a base profile cyclically
        random_offset := (i - 1) % jsonb_array_length(base_profiles);
        p := base_profiles->random_offset;
        
        new_id := gen_random_uuid();
        
        -- A. Insert into USERS (Minimum Viable Fields Only)
        INSERT INTO users (id, email, full_name, profile_picture)
        VALUES (
            new_id, 
            'rag_test_' || i || '@example.com', 
            p->>'name' || ' ' || i,  -- Unique name
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name') || i
        );

        -- B. Insert into GALAXY_PROFILES (Fully Populated Rich Data)
        INSERT INTO galaxy_profiles (
            user_id,
            full_name,
            avatar_url,
            voice_url,
            bio,
            about_me,
            location,
            job_title,
            company,
            school,
            gender,
            interests,
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
            prompts,
            updated_at,
            birth_date
        ) VALUES (
            new_id,
            p->>'name' || ' ' || i,
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name') || i,
            voice_const,
            p->>'bio',
            p->>'about',
            p->>'location',
            p->>'job',
            p->>'company',
            p->>'school',
            p->>'gender',
            ARRAY(SELECT jsonb_array_elements_text(p->'interests')),
            p->>'energy',
            p->>'mood',
            ARRAY[
                'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name') || i,
                'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name') || i || '_2',
                'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name') || i || '_3'
            ],
            ARRAY(SELECT jsonb_array_elements_text(p->'identity')),
            ARRAY(SELECT jsonb_array_elements_text(p->'interest_caps')),
            p->>'conn',
            p->>'pronouns',
            p->>'height',
            p->>'theme',
            p->>'border',
            p->'prompt_data',
            NOW(),
            CURRENT_DATE - (floor(random() * (35-20 + 1) + 20) * 365 || ' days')::interval
        );
        
    END LOOP;
END $$;
