import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StoryCard as StoryCardType } from '@/types/ai';

const PAGE_SIZE = 10;

export const useExploreFeed = (userId: string, interestedIn: string[] = ['everyone']) => {
    return useInfiniteQuery({
        queryKey: ['exploreFeed', userId, interestedIn],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            let currentOffset = pageParam as number;
            let foundCards: StoryCardType[] = [];
            let iterations = 0;
            const MAX_ITERATIONS = 10;
            const BATCH_SIZE = 50;

            // 1. Fetch Excluded IDs
            const { data: interactions } = await supabase
                .from('galaxy_matches')
                .select('user_a, user_b')
                .or(`user_a.eq.${userId},user_b.eq.${userId}`)
                .limit(2000);

            const excludedIds = new Set([userId]);
            if (interactions) {
                interactions.forEach((i: any) => {
                    if (i.user_a === userId) excludedIds.add(i.user_b);
                    else excludedIds.add(i.user_a);
                });
            }

            // 2. Fetch Until Found Loop
            while (foundCards.length < 5 && iterations < MAX_ITERATIONS) {
                let query = supabase
                    .from('galaxy_profiles')
                    .select(`*, users!inner(face_verified)`)
                    .neq('user_id', userId)
                    .order('created_at', { ascending: false }) // Deterministic sort
                    .range(currentOffset, currentOffset + BATCH_SIZE - 1);

                if (interestedIn && interestedIn.length > 0 && !interestedIn.includes('everyone')) {
                    query = query.in('gender', interestedIn);
                }

                const { data: profilesData, error } = await query;
                if (error) throw error;
                if (!profilesData || profilesData.length === 0) break; // End of DB

                const validBatch = profilesData.filter((p: any) => !excludedIds.has(p.user_id));

                const mappedBatch: StoryCardType[] = validBatch.map((p: any) => {
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
                        photo_url: userData?.profile_picture || '',
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

                foundCards.push(...mappedBatch);
                currentOffset += profilesData.length;
                iterations++;

                if (profilesData.length < BATCH_SIZE) break;
            }

            // Shuffle the found batch for variety
            foundCards = foundCards.sort(() => Math.random() - 0.5);

            return {
                cards: foundCards,
                nextOffset: foundCards.length > 0 ? currentOffset : null
            };
        },
        getNextPageParam: (lastPage: any) => {
            return lastPage.nextOffset;
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
};
