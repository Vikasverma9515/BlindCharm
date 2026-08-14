// Demo mode: Supabase tables are currently wiped, so this module supplies static
// mock data across the app (swipe deck, picks, matches, chat) and a fixed demo
// user id used by a dedicated NextAuth "demo" provider. Flip DEMO_MODE to false
// once the real database is restored to go back to live data everywhere.
export const DEMO_MODE = true;

export const DEMO_USER_ID = 'demo-user-000';

export const DEMO_CURRENT_USER_PROFILE = {
    user_id: DEMO_USER_ID,
    full_name: 'Aarav Sharma',
    bio: 'Product designer by day, amateur chef by night. Always up for a spontaneous road trip.',
    about_me: 'Product designer by day, amateur chef by night. Always up for a spontaneous road trip.',
    job_title: 'Product Designer',
    company: 'Nimbus Labs',
    school: 'NID Ahmedabad',
    location: 'Bangalore, India',
    gender: 'male',
    pronouns: 'he/him',
    height: `5'11"`,
    interests: ['Cooking', 'Hiking', 'Design', 'Travel'],
    interest_capsules: ['Cooking', 'Hiking', 'Design', 'Travel'],
    identity_signals: ['Dog person', 'Early riser', 'Foodie'],
    connection_style: 'Slow burn, deep conversations',
    current_mood: 'Curious',
    energy_level: 'Balanced',
    photos: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
    ],
    prompts: [
        { question: 'A perfect Sunday looks like', answer: 'Farmers market, a new recipe, and a long walk.' },
    ],
    voice_url: null as string | null,
    birth_date: '1998-04-12',
};

interface MockProfile {
    user_id: string;
    full_name: string;
    age: number;
    location: string;
    bio: string;
    job_title: string;
    company?: string;
    school?: string;
    gender: string;
    pronouns: string;
    height: string;
    photo: string;
    photos: string[];
    interests: string[];
    connection_style: string;
    current_mood: string;
}

const RAW_PROFILES: MockProfile[] = [
    {
        user_id: 'demo-profile-1', full_name: 'Meera Iyer', age: 26, location: 'Bangalore, India',
        bio: 'Bookworm, weekend trekker, and a firm believer in second breakfasts.',
        job_title: 'UX Researcher', company: 'Fable Studio', school: 'IIT Bombay',
        gender: 'female', pronouns: 'she/her', height: `5'5"`,
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
        ],
        interests: ['Reading', 'Trekking', 'Pottery'],
        connection_style: 'Slow and steady', current_mood: 'Adventurous',
    },
    {
        user_id: 'demo-profile-2', full_name: 'Kabir Malhotra', age: 28, location: 'Mumbai, India',
        bio: 'Building startups and terrible puns in equal measure. Coffee snob.',
        job_title: 'Founder', company: 'Loopwork', school: 'BITS Pilani',
        gender: 'male', pronouns: 'he/him', height: `6'0"`,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
        ],
        interests: ['Startups', 'Coffee', 'Cricket'],
        connection_style: 'Straightforward', current_mood: 'Ambitious',
    },
    {
        user_id: 'demo-profile-3', full_name: 'Ananya Reddy', age: 24, location: 'Hyderabad, India',
        bio: 'Classically trained dancer who now spends most of her time debugging Python.',
        job_title: 'Data Scientist', company: 'Vertex AI', school: 'IIIT Hyderabad',
        gender: 'female', pronouns: 'she/her', height: `5'4"`,
        photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1000&fit=crop',
        ],
        interests: ['Dance', 'Python', 'Photography'],
        connection_style: 'Playful banter first', current_mood: 'Playful',
    },
    {
        user_id: 'demo-profile-4', full_name: 'Rohan Verma', age: 27, location: 'Delhi, India',
        bio: 'Marathon runner, occasional stand-up comic, full-time dog dad.',
        job_title: 'Software Engineer', company: 'Quanta Systems', school: 'DTU',
        gender: 'male', pronouns: 'he/him', height: `5'10"`,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop',
        ],
        interests: ['Running', 'Comedy', 'Dogs'],
        connection_style: 'Deep conversations', current_mood: 'Chill',
    },
    {
        user_id: 'demo-profile-5', full_name: 'Ishita Kapoor', age: 25, location: 'Pune, India',
        bio: 'Architect obsessed with old buildings and new cafes.',
        job_title: 'Architect', company: 'Studio Line', school: 'CEPT University',
        gender: 'female', pronouns: 'she/her', height: `5'6"`,
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
        ],
        interests: ['Architecture', 'Cafes', 'Sketching'],
        connection_style: 'Slow burn', current_mood: 'Curious',
    },
    {
        user_id: 'demo-profile-6', full_name: 'Vivaan Chatterjee', age: 29, location: 'Kolkata, India',
        bio: 'Journalist who talks too much about football and too little about anything else.',
        job_title: 'Journalist', company: 'The Daily Wire', school: 'Jadavpur University',
        gender: 'male', pronouns: 'he/him', height: `5'9"`,
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
        ],
        interests: ['Football', 'Writing', 'Travel'],
        connection_style: 'Witty back and forth', current_mood: 'Energetic',
    },
];

function toStoryCard(p: MockProfile, index: number) {
    const themes = ['modern', 'polaroid'];
    const colors = ['#a855f7', '#ec4899', '#f97316', '#22d3ee'];
    const borders = ['thin', 'gradient'];

    return {
        user_id: p.user_id,
        full_name: p.full_name,
        age: p.age,
        location: p.location,
        bio: p.bio,
        about_me: p.bio,
        story_line: p.bio.length > 100 ? p.bio.substring(0, 100) : p.bio,
        story_sentence: p.bio.length > 100 ? p.bio.substring(0, 100) : p.bio,
        photos: p.photos,
        photo_url: p.photo,
        visual_cue: 'Galaxy Member',
        visual_proof_tags: p.interests.slice(0, 3),
        match_score: 78 + ((index * 7) % 20),
        voice_url: undefined,
        pronouns: p.pronouns,
        height: p.height,
        job_title: p.job_title,
        company: p.company,
        school: p.school,
        gender: p.gender,
        identity_signals: p.interests,
        interest_capsules: p.interests,
        connection_style: p.connection_style,
        prompts: [],
        current_mood: p.current_mood,
        energy_level: 'Balanced',
        intent_history: null,
        avatar_url: p.photo,
        theme: themes[index % themes.length],
        color: colors[index % colors.length],
        mood: p.current_mood.toLowerCase(),
        border: borders[index % borders.length],
        is_verified: index % 2 === 0,
    };
}

export const MOCK_STORY_CARDS = RAW_PROFILES.map(toStoryCard);

export function getMockProfile(userId: string) {
    const raw = RAW_PROFILES.find((p) => p.user_id === userId);
    return raw ? toStoryCard(raw, RAW_PROFILES.indexOf(raw)) : undefined;
}

// Pre-seeded matches so the chat list / thread demo "just works" without a live DB.
export const DEMO_MATCHES = [
    {
        id: 'demo-match-1',
        otherUserId: 'demo-profile-1',
        name: 'Meera Iyer',
        avatar: RAW_PROFILES[0].photo,
        lastMessage: "Haha okay you've convinced me, trek this weekend? 😄",
        time: '2:14 PM',
        unread: 1,
    },
    {
        id: 'demo-match-2',
        otherUserId: 'demo-profile-4',
        name: 'Rohan Verma',
        avatar: RAW_PROFILES[3].photo,
        lastMessage: 'My dog approves of you, just so you know.',
        time: 'Yesterday',
        unread: 0,
    },
];

export const DEMO_REQUESTS = [
    {
        id: 'demo-request-1',
        requesterId: 'demo-profile-3',
        name: 'Ananya Reddy',
        avatar: RAW_PROFILES[2].photo,
        bio: RAW_PROFILES[2].bio,
        time: '1h ago',
    },
];

// matchId -> { userA, userB } so the chat thread page can verify "ownership" without a DB.
export const DEMO_MATCH_PARTICIPANTS: Record<string, { otherUserId: string }> = {
    'demo-match-1': { otherUserId: 'demo-profile-1' },
    'demo-match-2': { otherUserId: 'demo-profile-4' },
};

export const DEMO_MESSAGES: Record<string, Array<{ id: string; sender_id: string; content: string; created_at: string; type: string }>> = {
    'demo-match-1': [
        { id: 'm1', sender_id: 'demo-profile-1', content: "Hey! Loved your trekking photos 😄", created_at: '2026-08-13T09:00:00Z', type: 'text' },
        { id: 'm2', sender_id: DEMO_USER_ID, content: 'Thank you! That one was in Coorg, absolutely worth the climb', created_at: '2026-08-13T09:05:00Z', type: 'text' },
        { id: 'm3', sender_id: 'demo-profile-1', content: "I've been wanting to go there for ages", created_at: '2026-08-13T09:07:00Z', type: 'text' },
        { id: 'm4', sender_id: DEMO_USER_ID, content: "We should plan one, I know a great trail", created_at: '2026-08-14T14:10:00Z', type: 'text' },
        { id: 'm5', sender_id: 'demo-profile-1', content: "Haha okay you've convinced me, trek this weekend? 😄", created_at: '2026-08-14T14:14:00Z', type: 'text' },
    ],
    'demo-match-2': [
        { id: 'm1', sender_id: 'demo-profile-4', content: 'Your dog is adorable, what breed?', created_at: '2026-08-12T18:00:00Z', type: 'text' },
        { id: 'm2', sender_id: DEMO_USER_ID, content: "He's a golden retriever, total menace though", created_at: '2026-08-12T18:03:00Z', type: 'text' },
        { id: 'm3', sender_id: 'demo-profile-4', content: 'My dog approves of you, just so you know.', created_at: '2026-08-13T11:00:00Z', type: 'text' },
    ],
};

export const DEMO_PICKS = RAW_PROFILES.slice(0, 3).map((p, index) => {
    const card = toStoryCard(p, index);
    return {
        id: p.user_id,
        user_id: p.user_id,
        name: p.full_name,
        age: p.age,
        location: p.location,
        photo_url: p.photo,
        photos: p.photos,
        voice_url: null,
        connection_insight: `You both value ${p.interests[0].toLowerCase()} and deep conversations.`,
        match_percentage: card.match_score,
        compatibility_summary: `${p.full_name} and you share a love for ${p.interests.slice(0, 2).join(' and ').toLowerCase()} — a great spark to start with.`,
        ...card,
    };
});
