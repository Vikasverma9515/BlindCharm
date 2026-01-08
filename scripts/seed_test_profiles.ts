import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
    console.error('Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// --- Data Templates ---
const FIRST_NAMES = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Skyler',
    'Dakota', 'Reese', 'Rowan', 'Hayden', 'Emerson', 'Finley', 'River', 'Sage', 'Phoenix', 'Rory',
    'Kai', 'Eden', 'Remi', 'Zion', 'Micah', 'Elliot', 'Charlie', 'Sawyer', 'Parker', 'Logan'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const CITIES = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'San Francisco, CA', 'Austin, TX',
    'Seattle, WA', 'Denver, CO', 'Boston, MA', 'London, UK', 'Toronto, CA',
    'Berlin, DE', 'Tokyo, JP', 'Sydney, AU', 'Miami, FL', 'Portland, OR'
];

const JOBS = [
    'Software Engineer', 'UX Designer', 'Product Manager', 'Data Scientist', 'Artist',
    'Writer', 'Chef', 'Teacher', 'Nurse', 'Architect',
    'Musician', 'Photographer', 'Entrepreneur', 'Student', 'Researcher'
];

// Rich Personas
const PERSONAS = [
    {
        vibe: 'tech',
        bios: [
            "Full-stack developer who loves clean code and cleaner coffee. Looking for a hackathon partner.",
            "Tech enthusiast building the future of AI. Let's debate React vs Vue.",
            "Cybersecurity analyst. I break things to fix them. Gamer by night.",
            "Building apps and taking naps. Passionate about open source and digital rights."
        ],
        interests: ['Coding', 'Tech', 'AI', 'Gaming', 'Coffee', 'Sci-Fi'],
        traits: ['Logical', 'Geeky', 'Ambitious']
    },
    {
        vibe: 'nature',
        bios: [
            "Always exploring. Hiking, camping, and getting lost in the woods. Nature is my church.",
            "Mountain climber and photographer. Chasing horizons and sunsets.",
            "Eco-warrior living sustainably. Plant parent to 40+ succulents.",
            "Van-life enthusiast. Home is where you park it."
        ],
        interests: ['Hiking', 'Camping', 'Nature', 'Photography', 'Travel', 'Environment'],
        traits: ['Adventurous', 'Free-spirited', 'Grounded']
    },
    {
        vibe: 'creative',
        bios: [
            "Painter and poet. Finding beauty in the mundane. Let's create something beautiful.",
            "Jazz musician living for the groove. Vinyl collector and night owl.",
            "Writer working on my first novel. Bookworm and tea lover.",
            "Indie filmmaker. I see life through a lens. Cinema is truth."
        ],
        interests: ['Art', 'Music', 'Writing', 'Jazz', 'Cinema', 'Design'],
        traits: ['Creative', 'Deep', 'Expressive']
    },
    {
        vibe: 'foodie',
        bios: [
            "Chef by trade, glutton by heart. Food is the best love language.",
            "Exploring the world one plate at a time. Spicy food addict.",
            "Baking is my therapy. Sweet tooth with a savory soul."
        ],
        interests: ['Cooking', 'Food', 'Wine', 'Baking', 'Dining', 'Travel'],
        traits: ['Passionate', 'Sensorial', 'Warm']
    }
];

// --- Helper Functions ---
function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray<T>(arr: T[], size: number): T[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

function calculateAge(dob: string): number {
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.trim().replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

// --- Main Seed Function ---
async function seed() {
    console.log('🌱 Starting Seed Process...');

    for (let i = 0; i < 30; i++) {
        // 1. Generate Profile Data
        const firstName = getRandomElement(FIRST_NAMES);
        const lastName = getRandomElement(LAST_NAMES);
        const fullName = `${firstName} ${lastName}`;
        const location = getRandomElement(CITIES);
        const job = getRandomElement(JOBS);
        const persona = getRandomElement(PERSONAS);

        const bio = getRandomElement(persona.bios);
        const interests = getRandomSubarray(persona.interests, 3);
        const traits = getRandomSubarray(persona.traits, 2);

        const randomYear = Math.floor(Math.random() * (2000 - 1985 + 1)) + 1985;
        const dob = `${randomYear}-01-01`;
        const gender = Math.random() > 0.5 ? 'male' : 'female';

        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`;

        // 2. Generate UUID
        const { data: idData, error: idError } = await supabase.rpc('gen_random_uuid'); // Does not exist usually unless exposed
        // Fallback or use a library, but simplest is to let Postgres generate it OR just use a placeholder if we assume 'create user' works. 
        // Better: Just make up a UUID-like string or use crypto.
        const userId = crypto.randomUUID();

        console.log(`Creating User ${i + 1}: ${fullName} (${persona.vibe})...`);

        // 3. Insert into USERS table (Public)
        // Note: This creates a record in the public profile table. It might NOT create a login-able auth user.
        // But for testing matching, it is sufficient.
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: `test_user_${i}_${Date.now()}@example.com`,
                full_name: fullName,
                profile_picture: avatarUrl,
                // dob: dob, // dob might not be in users either, checking previous error, only is_onboarded was complained about but checking seed script logic again
            });

        if (userError) {
            console.error('Error creating user:', userError);
            continue;
        }

        // 4. Construct Narrative for Embedding
        const narrative = `User Profile Overview:
Name: ${fullName}
Age: ${calculateAge(dob)}
Location: ${location}
Occupation: ${job}
Gender: ${gender}

Personal Details & Vibe:
Bio: "${bio}"
Personality Traits: ${traits.join(', ')}
Interests: ${interests.join(', ')}
`;

        // 5. Generate Embedding
        const embedding = await generateEmbedding(narrative);

        // 6. Insert into GALAXY_PROFILES
        const { error: profileError } = await supabase
            .from('galaxy_profiles')
            .insert({
                user_id: userId,
                full_name: fullName,
                bio: bio,
                about_me: bio, // Using bio for both
                location: location,
                job_title: job,
                company: 'Tech Corp', // Added filler
                school: 'University', // Added filler
                gender: gender,
                birth_date: dob,
                photos: [avatarUrl, avatarUrl], // Mock photos
                interests: interests,
                identity_signals: traits,
                interest_capsules: interests,
                embedding: embedding, // PRE-FILLED EMBEDDING!
                updated_at: new Date(),
                onboarding_completed: true // Correct column in galaxy_profiles
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
        } else {
            console.log(`✅ Created ${fullName} with embedding.`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('🎉 Seeding Complete!');
}

seed();
