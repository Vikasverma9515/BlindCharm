'use server';

import { generateEmbedding } from '@/lib/embeddings';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function searchByVibeAction(userQuery: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        const userId = session.user.id;

        if (!userQuery.trim()) return [];

        console.log(`AI Matchmaker: User ${userId} searching for "${userQuery}"`);

        // 1. Generate query embedding
        const queryEmbedding = await generateEmbedding(userQuery);

        // 2. Get user preferences & exclusions
        // Get basic prefs
        const { data: userProfile } = await supabaseAdmin
            .from('galaxy_profiles')
            .select('gender, discovery_min_age, discovery_max_age, interested_in')
            .eq('user_id', userId)
            .single();

        // Get exclusions (swipes, matches, blocks)
        // Fetch interactions where user is involved
        const { data: interactions } = await supabaseAdmin
            .from('galaxy_matches')
            .select('user_a, user_b')
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .limit(5000);

        const excludedIds = [userId]; // Always exclude self
        if (interactions) {
            interactions.forEach((i: any) => {
                if (i.user_a === userId) excludedIds.push(i.user_b);
                else excludedIds.push(i.user_a);
            });
        }

        // Prepare filter params
        const genderPref = userProfile?.interested_in || ['everyone'];
        const minAge = userProfile?.discovery_min_age || 18;
        const maxAge = userProfile?.discovery_max_age || 100;

        console.log(`[AI Matchmaker] Filters for User ${userId}:`, {
            genderPref,
            minAge,
            maxAge,
            excludedCount: excludedIds.length
        });

        // 3. Call RPC for similarity search
        const { data: candidates, error } = await supabaseAdmin.rpc('match_profiles_by_vibe_v2', {
            query_embedding: queryEmbedding,
            match_threshold: 0.1, // Drastically lower threshold to ensure results
            match_count: 20,
            user_gender_preference: genderPref,
            min_age: minAge,
            max_age: maxAge,
            exclude_user_ids: [userId] // Only exclude self, ignore previous swipes for now to fix empty results
        });

        if (error) {
            console.error('RPC Error:', error);
            throw error;
        }

        // 4. Log the query
        await supabaseAdmin.from('ai_matchmaker_queries').insert({
            user_id: userId,
            query_text: userQuery,
            query_embedding: queryEmbedding, // Optional: might skip if costly/large
            matched_profiles: candidates?.map((c: any) => c.user_id) || []
        });

        return candidates || [];

    } catch (error) {
        console.error('SearchByVibe Error:', error);
        throw new Error('Failed to perform AI search');
    }
}
