import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getSwipeQueueAction } from '@/app/galaxy/actions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const limit = body.limit || 5;

        const profiles = await getSwipeQueueAction(limit);

        // Map to StoryCard format
        const cards = profiles.map((p: any) => {
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

        return NextResponse.json({
            profiles: cards,
            hasMore: profiles.length >= limit
        });
    } catch (error: any) {
        console.error('Queue API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
