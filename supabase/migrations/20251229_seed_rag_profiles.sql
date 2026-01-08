-- RAG-Optimized Seeding Script (Fixed Syntax)
-- Deletes existing test profiles and seeds 20 highly detailed, diverse personas.

-- 1. Cleanup
DELETE FROM galaxy_profiles;
DELETE FROM users WHERE email LIKE 'rag_test_%';

-- 2. Insert Data using a pure DO block
DO $$
DECLARE
    new_id uuid;
    voice_const text := 'https://okqsisewkhtbeuvmbuqx.supabase.co/storage/v1/object/public/voice-intros/profile-intro/aa963b8b-713d-4adb-9305-7cf26042125a/1766874658464.webm';
    
    -- Define a type to hold our profile data structure for easier iteration
    -- (Simulated via JSONB array for flexibility in this script)
    profiles_data jsonb := '[
        {
            "email": "rag_test_1@example.com", "name": "Aria Chen", "location": "San Francisco, CA", "job": "UX Designer", "company": "Figma", "school": "RISD", "dob": "1998-05-12", "gender": "female",
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
            "email": "rag_test_2@example.com", "name": "Marcus Thorne", "location": "New York, NY", "job": "Architect", "company": "Thorne & Assoc", "school": "Cornell", "dob": "1995-08-23", "gender": "male",
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
            "email": "rag_test_3@example.com", "name": "Elena Rodriguez", "location": "Austin, TX", "job": "Startup Founder", "company": "Stealth Mode", "school": "Stanford", "dob": "1999-02-14", "gender": "female",
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
            "email": "rag_test_4@example.com", "name": "Kaito Tanaka", "location": "Tokyo / Remote", "job": "Game Developer", "company": "Nintendo", "school": "Kyoto Univ", "dob": "1997-11-30", "gender": "male",
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
            "email": "rag_test_5@example.com", "name": "Sarah Jenkins", "location": "Denver, CO", "job": "Geologist", "company": "US Geo Survey", "school": "Colorado School of Mines", "dob": "1996-04-22", "gender": "female",
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
            "email": "rag_test_6@example.com", "name": "David Okafor", "location": "London, UK", "job": "Fintech Analyst", "company": "Revolut", "school": "LSE", "dob": "1994-12-05", "gender": "male",
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
            "email": "rag_test_7@example.com", "name": "Luna Lovegood", "location": "Los Angeles, CA", "job": "Astrologer", "company": "Self-Employed", "school": "Apprentice", "dob": "2000-07-15", "gender": "female",
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
            "email": "rag_test_8@example.com", "name": "James Logan Wolffe", "location": "Chicago, IL", "job": "Chef", "company": "The Bear", "school": "Culinary Inst", "dob": "1993-09-10", "gender": "male",
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
            "email": "rag_test_9@example.com", "name": "Priya Patel", "location": "Bangalore, IN", "job": "Software Engineer", "company": "Google", "school": "IIT Bombay", "dob": "1998-03-30", "gender": "female",
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
            "email": "rag_test_10@example.com", "name": "Tom Brady", "location": "Boston, MA", "job": "Nurse", "company": "General Hospital", "school": "UMass", "dob": "1995-06-18", "gender": "male",
            "bio": "Saving lives and taking naps. Compassion is key.",
            "about": "ER Nurse. I see a lot of crazy stuff, so I keep my personal life chill. I love hiking with my golden retriever and watching basketball.",
            "interests": ["Healthcare", "Dogs", "Basketball", "Hiking"],
            "identity": ["Caregiver", "Dog Dad", "Chill"],
            "interest_caps": ["Health", "Pets", "Sports"],
            "conn": "I connect best when walking our dogs.",
            "energy": "calm", "mood": "vibing", "theme": "polaroid", "border": "none", "pronouns": "he/him", "height": "5''10''",
            "prompt_data": [{"question": "My real life hero", "answer": "My mom."}]
        },
        {
            "email": "rag_test_11@example.com", "name": "Chloe Decker", "location": "Seattle, WA", "job": "Detective", "company": "SPD", "school": "Police Academy", "dob": "1992-11-05", "gender": "female",
            "bio": "Seeking the truth. Coffee glutton.",
            "about": "I solve mysteries for a living. I am analytical but open-minded. I love a good puzzle and rain does not bother me. Looking for a partner in crime (figuratively).",
            "interests": ["Mystery", "Coffee", "Rain", "Puzzles"],
            "identity": ["Detective", "Skeptic", "Protector"],
            "interest_caps": ["Crime", "Logic", "Seattle"],
            "conn": "I connect best when solving escape rooms.",
            "energy": "focused", "mood": "focused", "theme": "glass", "border": "double", "pronouns": "she/her", "height": "5''7''",
            "prompt_data": [{"question": "Two truths and a lie", "answer": "I have a devil partner. I hate lucifer. I love pudding."}]
        },
        {
            "email": "rag_test_12@example.com", "name": "Felix K", "location": "Brighton, UK", "job": "Content Creator", "company": "YouTube", "school": "Chalmers", "dob": "1989-10-24", "gender": "male",
            "bio": "Memes, gaming, and staying humble.",
            "about": "I make videos on the internet. I like philosophy, working out, and spending time with my pugs. I am actually quite introverted offline.",
            "interests": ["YouTube", "Gaming", "Philosophy", "Dogs"],
            "identity": ["Creator", "Gamer", "Philosopher"],
            "interest_caps": ["Media", "Internet", "Humor"],
            "conn": "I connect best when we can respect silence.",
            "energy": "calm", "mood": "chill", "theme": "neon", "border": "glow", "pronouns": "he/him", "height": "5''11''",
            "prompt_data": [{"question": "I surely love", "answer": "Pasta and Marzia."}]
        },
        {
            "email": "rag_test_13@example.com", "name": "Sven Olaf", "location": "Oslo, Norway", "job": "Ski Instructor", "company": "Alpine Resort", "school": "Sport Gymnas", "dob": "1996-01-15", "gender": "male",
            "bio": "Born on the slopes. Cold hands, warm heart.",
            "about": "The mountains are my home. I teach people how to ski and enjoy the winter. I love après-ski parties and hot cocoa. Looking for a snow bunny.",
            "interests": ["Skiing", "Winter", "Travel", "Parties"],
            "identity": ["Athlete", "Instructor", "Fun"],
            "interest_caps": ["Sports", "Winter", "Travel"],
            "conn": "I connect best when on a chairlift.",
            "energy": "energetic", "mood": "vibing", "theme": "polaroid", "border": "gradient", "pronouns": "he/him", "height": "6''2''",
            "prompt_data": [{"question": "Best season", "answer": "Winter, obviously."}]
        },
        {
            "email": "rag_test_14@example.com", "name": "Natasha R", "location": "Budapest", "job": "Ballerina", "company": "National Ballet", "school": "Vaganova", "dob": "1998-11-22", "gender": "female",
            "bio": "Grace under pressure. Discipline is freedom.",
            "about": "Ballet is my life. It requires total dedication. Off stage, I am learning to relax and enjoy the simple things like classical music and tea.",
            "interests": ["Ballet", "Dance", "Classical Music", "Tea"],
            "identity": ["Artist", "Dancer", "Disciplined"],
            "interest_caps": ["Art", "Dance", "Music"],
            "conn": "I connect best when watching a performance.",
            "energy": "focused", "mood": "calm", "theme": "glass", "border": "thin", "pronouns": "she/her", "height": "5''4''",
            "prompt_data": [{"question": "My feet are", "answer": "Always hurting, but it is worth it."}]
        },
        {
            "email": "rag_test_15@example.com", "name": "Tech Bro", "location": "San Jose, CA", "job": "VC Investor", "company": "Sequoia", "school": "Harvard", "dob": "1990-05-05", "gender": "male",
            "bio": "Disrupting industries. Crypto bull.",
            "about": "Looking for the next big thing. I work hard and play hard. Tesla owner, bio-hacker. I want someone who challenges me intellectually.",
            "interests": ["Crypto", "Investing", "Tesla", "Biohacking"],
            "identity": ["Investor", "Visionary", "Competitive"],
            "interest_caps": ["Money", "Tech", "Business"],
            "conn": "I connect best over a pitch deck.",
            "energy": "energetic", "mood": "focused", "theme": "luxury", "border": "double", "pronouns": "he/him", "height": "6''0''",
            "prompt_data": [{"question": "To the moon", "answer": "🚀🚀🚀"}]
        },
        {
            "email": "rag_test_16@example.com", "name": "Mia T", "location": "Genovia", "job": "Princess", "company": "Royal Family", "school": "Genovia High", "dob": "2001-09-01", "gender": "female",
            "bio": "Reluctant royal. Cat lover.",
            "about": "Trying to navigate royal duties while staying true to myself. I care about social causes and my cat, Fat Louie. Looking for a fairytale without the drama.",
            "interests": ["Royalty", "Cats", "Charity", "Fashion"],
            "identity": ["Princess", "Activist", "Sweet"],
            "interest_caps": ["Royalty", "Causes", "Fashion"],
            "conn": "I connect best when we can be goofy.",
            "energy": "calm", "mood": "dreamy", "theme": "glass", "border": "gradient", "pronouns": "she/her", "height": "5''8''",
            "prompt_data": [{"question": "My tiara is", "answer": "Heavy."}]
        },
        {
            "email": "rag_test_17@example.com", "name": "Tony S", "location": "Malibu, CA", "job": "Engineer", "company": "Stark Ind", "school": "MIT", "dob": "1980-05-29", "gender": "male",
            "bio": "Genius, Billionaire, Playboy, Philanthropist.",
            "about": "I build cool suits. I save the world. I am complicated. I need someone who can handle my ego and help me stay grounded.",
            "interests": ["Engineering", "Robots", "Cars", "Saving World"],
            "identity": ["Genius", "Hero", "Complicated"],
            "interest_caps": ["Tech", "Innovation", "Hero"],
            "conn": "I connect best when building something.",
            "energy": "energetic", "mood": "energetic", "theme": "neon", "border": "glow", "pronouns": "he/him", "height": "5''9''",
            "prompt_data": [{"question": "I am Iron Man", "answer": "True."}]
        },
        {
            "email": "rag_test_18@example.com", "name": "Hermione G", "location": "London, UK", "job": "Academic", "company": "Ministry", "school": "Hogwarts", "dob": "1997-09-19", "gender": "female",
            "bio": "Books! And cleverness! There are more important things.",
            "about": "I fight for justice and house elf rights. I read a lot. I am very organized. If you can''t keep up with my intellect, it won''t work.",
            "interests": ["Books", "Magic", "Activisim", "Study"],
            "identity": ["Intellectual", "Activist", "Witch"],
            "interest_caps": ["Books", "Learning", "Causes"],
            "conn": "I connect best in a library.",
            "energy": "focused", "mood": "focused", "theme": "minimal", "border": "thin", "pronouns": "she/her", "height": "5''5''",
            "prompt_data": [{"question": "It''s Levi-O-sa", "answer": "Not Levio-SA."}]
        },
        {
            "email": "rag_test_19@example.com", "name": "Geralt R", "location": "Rivia", "job": "Witcher", "company": "Wolf School", "school": "Kaer Morhen", "dob": "1900-01-01", "gender": "male",
            "bio": "Hmm. Monsters.",
            "about": "I hunt monsters for coin. I don''t like portals. I value loyalty and destiny. Not much for small talk.",
            "interests": ["Swords", "Monsters", "Gwent", "Roach"],
            "identity": ["Hunter", "Loner", "Stoic"],
            "interest_caps": ["Fantasy", "Combat", "Nature"],
            "conn": "I connect best when playing Gwent.",
            "energy": "calm", "mood": "focused", "theme": "luxury", "border": "none", "pronouns": "he/him", "height": "6''2''",
            "prompt_data": [{"question": "Wind''s howling", "answer": "Looks like rain."}]
        },
        {
            "email": "rag_test_20@example.com", "name": "Lara C", "location": "London, UK", "job": "Archaeologist", "company": "Independent", "school": "Wimbledon High", "dob": "1992-02-14", "gender": "female",
            "bio": "Raiding tombs and discovering history.",
            "about": "Adrenaline junkie with a love for history. I travel to dangerous places to find artifacts. I am independent and tough. Can you keep up?",
            "interests": ["History", "Travel", "Adventure", "Artifacts"],
            "identity": ["Explorer", "Fighter", "Historian"],
            "interest_caps": ["Adventure", "History", "Action"],
            "conn": "I connect best when exploring ruins.",
            "energy": "energetic", "mood": "energetic", "theme": "polaroid", "border": "double", "pronouns": "she/her", "height": "5''9''",
            "prompt_data": [{"question": "My weekends involved", "answer": "Scaling a cliff face."}]
        }
    ]'::jsonb;
    
    p jsonb;
BEGIN
    FOR p IN SELECT * FROM jsonb_array_elements(profiles_data) LOOP
        new_id := gen_random_uuid();
        
        -- A. Insert into USERS (Ensure identity data is here as per instruction)
        INSERT INTO users (id, email, full_name, profile_picture, location, job_title, company, school, dob, gender, interests, bio)
        VALUES (
            new_id, 
            p->>'email', 
            p->>'name', 
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name'), 
            p->>'location',
            p->>'job',
            p->>'company',
            p->>'school',
            (p->>'dob')::date,
            p->>'gender',
            ARRAY(SELECT jsonb_array_elements_text(p->'interests')),
            p->>'bio'
        );

        -- B. Insert into GALAXY_PROFILES (Populate details for RAG)
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
            prompts,
            updated_at
        ) VALUES (
            new_id,
            p->>'name',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name'),
            voice_const,
            p->>'bio',
            p->>'about',
            p->>'energy',
            p->>'mood',
            ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=' || (p->>'name')],
            ARRAY(SELECT jsonb_array_elements_text(p->'identity')),
            ARRAY(SELECT jsonb_array_elements_text(p->'interest_caps')),
            p->>'conn',
            p->>'pronouns',
            p->>'height',
            p->>'theme',
            p->>'border',
            p->'prompt_data',
            NOW()
        );
        
    END LOOP;
END $$;
