
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import GalaxyFeed from '@/features/ai-dating/components/galaxy/GalaxyFeed';
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
        // Load from persistent swipe queue
        const { getSwipeQueueAction } = await import('@/app/(ai-dating)/galaxy/actions');
        const queueProfiles = await getSwipeQueueAction(10);

        if (queueProfiles && queueProfiles.length > 0) {
            initialFeed = queueProfiles.map((p: any) => {
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
                    is_verified: userData.face_verified || false
                };
            });
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
