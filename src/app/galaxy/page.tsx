
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import GalaxyFeed from '@/components/galaxy/GalaxyFeed';
import { redirect } from 'next/navigation';
import { StoryCard as StoryCardType } from '@/types/ai';

// Next.js Server Component
export default async function GalaxyEntryPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        redirect('/login');
    }

    const userId = (session.user as any).id;

    console.log('🚀 Galaxy Server Init for User:', userId);

    // 1. Fetch User Profile (for Onboarding check & Preferences)
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
    }

    const isOnboarding = !profile?.onboarding_completed;

    // 2. Fetch Initial Feed (if not onboarding)
    let initialFeed: StoryCardType[] = [];

    if (!isOnboarding) {
        // A. Fetch Interactions (Swipes, Matches, Blocks) - GLOBAL
        // We must fetch ALL interactions where I am involved to exclude them
        const { data: interactions } = await supabaseAdmin
            .from('galaxy_matches')
            .select('user_a, user_b')
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .limit(5000);

        const excludedIds = new Set([userId]); // Always exclude self
        if (interactions) {
            interactions.forEach((i: any) => {
                // Exclude the OTHER person
                if (i.user_a === userId) excludedIds.add(i.user_b);
                else excludedIds.add(i.user_a);
            });
        }

        const interestedIn = profile?.interested_in || ['everyone'];

        let query = supabaseAdmin
            .from('galaxy_profiles')
            .select(`
                *,
                users!inner(face_verified)
            `)
            .neq('user_id', userId)
            .order('created_at', { ascending: false });

        if (interestedIn && interestedIn.length > 0 && !interestedIn.includes('everyone')) {
            query = query.in('gender', interestedIn);
        }

        // Fetch extra because we filter in JS
        // Fetch a larger batch for the initial server load to increase chance of finding unswiped users
        // Since we filter in memory, if the first 200 are all swiped, we show empty.
        // A better approach would be to use a random offset, but ensuring consistency is hard.
        // For now, we stick to 1000 which covers most casual sessions.
        query = query.limit(1000);

        const { data: profilesData } = await query;

        if (profilesData) {
            // Filter excluded IDs
            const filteredProfiles = profilesData
                .filter((p: any) => !excludedIds.has(p.user_id))
                .slice(0, 50); // Take top 50 valid ones

            initialFeed = filteredProfiles.map((p: any) => {
                const userData = p.users || {};
                return {
                    user_id: p.user_id,
                    full_name: p.full_name || 'BlindCharm User',
                    age: p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 25,
                    birth_date: p.birth_date,
                    location: p.location || 'Unknown',
                    bio: p.bio || '',
                    about_me: p.about_me || p.bio || '',
                    story_line: p.about_me ? p.about_me.substring(0, 100) : (p.bio ? p.bio.substring(0, 100) : "Ready to connect."),
                    story_sentence: p.bio ? p.bio.substring(0, 100) : "Ready to connect.",
                    photos: p.photos && p.photos.length > 0 ? p.photos : [userData.profile_picture],
                    photo_url: userData.profile_picture || '',
                    visual_cue: "Galaxy Member",
                    visual_proof_tags: p.identity_signals ? p.identity_signals.slice(0, 3) : (p.interests ? p.interests.slice(0, 3) : []),
                    match_score: 80,
                    voice_url: p.voice_url,
                    pronouns: p.pronouns,
                    height: p.height,
                    job_title: p.job_title,
                    company: p.company,
                    school: p.school,
                    gender: p.gender,
                    identity_signals: p.identity_signals || [],
                    interest_capsules: p.interest_capsules || p.interests || [],
                    connection_style: p.connection_style,
                    prompts: p.prompts || [],
                    current_mood: p.current_mood || 'Chill',
                    energy_level: p.energy_level,
                    intent_history: p.intent_history,
                    avatar_url: userData?.profile_picture || p.photos?.[0],
                    theme: p.card_theme || 'modern',
                    color: p.card_color || p.primary_color || '#a855f7',
                    mood: p.current_mood || 'vibing',
                    border: p.card_border || 'thin',
                    is_verified: userData.face_verified || false // Add verification status
                };
            }).sort(() => Math.random() - 0.5);
        }
    }

    return (
        <GalaxyFeed
            initialProfile={profile}
            initialFeed={initialFeed}
            isOnboardingParam={isOnboarding}
            userId={userId}
        />
    );
}
