
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import PicksFeed from '@/features/ai-dating/components/galaxy/PicksFeed';
import { redirect } from 'next/navigation';
import { generateMatchInsightAction } from '@/app/(ai-dating)/galaxy/actions';


export default async function GalaxyPicksPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        redirect('/login');
    }

    const userId = (session.user as any).id;
    let finalPicks: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    try {
        // 0. Fetch Excluded IDs (Swipes, Matches, Blocks) - GLOBAL
        // We must fetch ALL interactions where I am involved
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

        // 1. Check for Saved Picks for TODAY
        const { data: savedPicks } = await supabaseAdmin
            .from('galaxy_daily_picks')
            .select('picked_profile_id, insight, match_score, compatibility_summary') // Select AI data
            .eq('user_id', userId)
            .eq('picked_at', today);

        let profilesToEnrich: any[] = [];

        if (savedPicks && savedPicks.length > 0) {
            // LOAD EXISTING PICKS
            // Filter picks that haven't been acted on
            const validSavedPicks = savedPicks.filter(p => !excludedIds.has(p.picked_profile_id));

            if (validSavedPicks.length > 0) {
                const pickedIds = validSavedPicks.map(p => p.picked_profile_id);
                const { data: profiles } = await supabaseAdmin
                    .from('galaxy_profiles')
                    .select('*')
                    .in('user_id', pickedIds);

                if (profiles) {
                    // Enrich profile with SAVED AI data
                    // Map profiles to validSavedPicks to get the stored insight
                    profilesToEnrich = profiles.map(profile => {
                        const savedData = validSavedPicks.find(p => p.picked_profile_id === profile.user_id);
                        return {
                            ...profile,
                            _saved_insight: savedData?.insight,
                            _saved_match_score: savedData?.match_score,
                            _saved_compatibility_summary: savedData?.compatibility_summary
                        };
                    });
                }
            }
        } else {
            // GENERATE NEW PICKS (Existing Logic)

            // 1. Fetch User's Preferences
            const { data: userProfile } = await supabaseAdmin
                .from('galaxy_profiles')
                .select('interested_in, bio, interests, gender, embedding')
                .eq('user_id', userId)
                .single();

            const interestedIn = userProfile?.interested_in || ['everyone'];

            // 2. Query Logic
            let selectedProfiles: any[] = [];

            // Primary Query: Match Preferences
            if (!interestedIn.includes('everyone')) {
                const { data: preferred } = await supabaseAdmin
                    .from('galaxy_profiles')
                    .select('*')
                    .neq('user_id', userId)
                    .eq('is_paused', false) // Hide paused users
                    .in('gender', interestedIn)
                    .limit(50); // Fetch more to filter in JS

                if (preferred && preferred.length > 0) {
                    // Filter out excluded
                    selectedProfiles = preferred.filter((p: any) => !excludedIds.has(p.user_id));
                }
            }

            // Fallback / Vibe Match Query
            if (selectedProfiles.length < 5) {
                try {
                    // Get User's Embedding
                    let userEmbedding = userProfile?.embedding;

                    // If missing, generate on the fly
                    if (!userEmbedding && userProfile?.bio) {
                        try {
                            const { generateEmbedding } = await import('@/lib/embeddings');
                            const vibeText = `
                                Gender: ${userProfile.gender || 'unknown'}
                                Interested In: ${interestedIn.join(', ')}
                                Bio: ${userProfile.bio}
                                Interests: ${userProfile.interests ? userProfile.interests.join(', ') : ''}
                             `.trim();
                            userEmbedding = await generateEmbedding(vibeText);

                            // Save for next time
                            await supabaseAdmin.from('galaxy_profiles')
                                .update({ embedding: userEmbedding })
                                .eq('user_id', userId);
                        } catch (e) { console.error("Fly embedding failed", e); }
                    }

                    if (userEmbedding) {
                        // RPC Vibe Match
                        const { data: vectorMatches } = await supabaseAdmin.rpc('match_profiles', {
                            query_embedding: userEmbedding,
                            match_threshold: 0.1, // Low threshold to get *something* (1 is perfect, -1 opposite)
                            match_count: 20,
                            exclude_user_id: userId
                        });

                        if (vectorMatches) {
                            const existingIds = new Set(selectedProfiles.map(p => p.user_id));
                            // Transform RPC result to Profile shape (it only returns partial)
                            // Actually, RPC returns what we defined. We defined id, user_id, full_name, similarity.
                            // We need FULL profile for the card.
                            // So we take IDs and fetch full profiles.

                            const vectorIds = vectorMatches.map((m: any) => m.user_id || m.id)
                                .filter((id: any) => !existingIds.has(id) && !excludedIds.has(id));

                            if (vectorIds.length > 0) {
                                let vectorQuery = supabaseAdmin
                                    .from('galaxy_profiles')
                                    .select('*')
                                    .eq('is_paused', false) // Hide paused users
                                    .in('user_id', vectorIds);

                                // CRITICAL: Filter by gender preference
                                if (!interestedIn.includes('everyone')) {
                                    vectorQuery = vectorQuery.in('gender', interestedIn);
                                }

                                const { data: fullProfiles } = await vectorQuery;

                                if (fullProfiles) {
                                    selectedProfiles = [...selectedProfiles, ...fullProfiles];
                                }
                            }
                        }
                    } else {
                        // ORIGINAL FALLBACK (If no embedding possible)
                        let query = supabaseAdmin
                            .from('galaxy_profiles')
                            .select('*')
                            .eq('is_paused', false) // Hide paused users
                            .neq('user_id', userId);

                        // CRITICAL: Filter by gender preference
                        if (!interestedIn.includes('everyone')) {
                            query = query.in('gender', interestedIn);
                        }

                        if (selectedProfiles.length > 0) {
                            query = query.limit(40);
                        } else {
                            query = query.limit(20);
                        }

                        const { data: fallback } = await query;
                        if (fallback) {
                            const existingIds = new Set(selectedProfiles.map(p => p.user_id));
                            const newCandidates = fallback.filter((p: any) =>
                                !existingIds.has(p.user_id) && !excludedIds.has(p.user_id)
                            );
                            selectedProfiles = [...selectedProfiles, ...newCandidates];
                        }
                    }

                } catch (error) {
                    console.error("Vector match failed:", error);
                    // Silent fail to standard logic is fine, logic continues below
                }
            }

            // Standard Random Fallback if still low
            if (selectedProfiles.length < 5) {
                let query = supabaseAdmin
                    .from('galaxy_profiles')
                    .select('*')
                    .eq('is_paused', false) // Hide paused users
                    .neq('user_id', userId);

                // CRITICAL: Filter by gender preference
                if (!interestedIn.includes('everyone')) {
                    query = query.in('gender', interestedIn);
                }

                query = query.limit(30);

                const { data: fallback } = await query;
                if (fallback) {
                    const existingIds = new Set(selectedProfiles.map(p => p.user_id));
                    const newCandidates = fallback.filter((p: any) =>
                        !existingIds.has(p.user_id) && !excludedIds.has(p.user_id)
                    );
                    selectedProfiles = [...selectedProfiles, ...newCandidates];
                }
            }

            if (selectedProfiles.length > 0) {
                // Randomly select 5 (or however many needed)
                const uniqueProfilesMap = new Map();
                selectedProfiles.forEach((item: any) => {
                    uniqueProfilesMap.set(item.user_id, item);
                });
                const uniqueProfiles = Array.from(uniqueProfilesMap.values());
                profilesToEnrich = uniqueProfiles.sort(() => 0.5 - Math.random()).slice(0, 5);

                // WE DO NOT INSERT HERE ANYMORE.
                // We defer insert until AFTER AI generation.
            }
        }

        // 3. Enrich / Read AI Insights
        // Note: We might want to persist insights too to avoid re-generation cost, 
        // but for now re-generating ensures fresh "Hooks" if the prompt changes.

        if (profilesToEnrich.length > 0) {
            // Need user profile for AI if we didn't fetch it earlier (e.g. valid savedPicks path)
            const { data: userProfile } = await supabaseAdmin
                .from('galaxy_profiles')
                .select('*') // Fetch EVERYTHING so AI sees full profile (about_me, connection_style, etc.)
                .eq('user_id', userId)
                .single();

            finalPicks = await Promise.all(profilesToEnrich.map(async (p: any) => {
                let insight = p._saved_insight;
                let matchScore = p._saved_match_score;
                let compatibilitySummary = p._saved_compatibility_summary;

                // If NO saved insight (New Pick), Generate & Save
                if (!insight) {
                    try {
                        const aiResult = await generateMatchInsightAction(userProfile, p);
                        insight = aiResult.insight;
                        matchScore = aiResult.match_score;

                        // Handle formatting
                        if ('compatibility_summary' in aiResult) {
                            compatibilitySummary = (aiResult as any).compatibility_summary;
                        }

                        // SAVE TO DB NOW (Generate Once)
                        await supabaseAdmin.from('galaxy_daily_picks').insert({
                            user_id: userId,
                            picked_profile_id: p.user_id,
                            picked_at: today,
                            insight: insight,
                            match_score: matchScore,
                            compatibility_summary: compatibilitySummary
                        });

                    } catch (e) {
                        console.error("AI Insight failed, using fallback", e);
                        insight = "Your energy levels seem to align perfectly.";
                        matchScore = Math.floor(Math.random() * (98 - 75) + 75); // Use a random fallback
                        // Even if failed, we should probably save the fallback to avoid re-trying error
                    }
                }

                // Bio Gate Check for Display
                // Relaxed: Unlocks if user has Bio OR Interests OR Traits OR Vector
                const hasBio = (userProfile?.bio && userProfile.bio.length > 5);
                const hasInterests = (userProfile?.interests && userProfile.interests.length > 0);
                const hasTraits = (userProfile?.identity_signals && userProfile.identity_signals.length > 0);
                const hasVector = !!userProfile?.embedding;

                const isProfileRichEnough = hasBio || hasInterests || hasTraits || hasVector;

                let displaySummary = compatibilitySummary;

                if (!isProfileRichEnough) {
                    displaySummary = "Our expert matchmaker needs to know more about you! Complete your bio, add interests, or select your traits to unlock the Vibe Check.";
                }

                // Map to display format
                return {
                    ...p,
                    id: p.user_id,
                    name: p.full_name?.split(' ')[0] || 'Member',
                    age: p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 25,
                    location: p.location || 'Unknown',
                    photo_url: p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
                    photos: p.photos || [],
                    voice_url: p.voice_url,
                    connection_insight: insight,
                    match_percentage: matchScore,
                    compatibility_summary: displaySummary
                };
            }));
        }

    } catch (error) {
        console.error("Error loading picks server side:", error);
    }

    return (
        <PicksFeed initialPicks={finalPicks} />
    );
}
