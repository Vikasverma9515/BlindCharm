'use server';

import Groq from 'groq-sdk';
import { UserIntent, StoryCard } from '@/types/ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Initialize Groq on the server
// This will automatically pick up GROQ_API_KEY from process.env
// Initialize Groq helper
const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
        console.warn("GROQ_API_KEY is missing. AI features will fail.");
        return null;
    }
    return new Groq({ apiKey });
};


const AI_MODELS = {
    FAST: 'llama-3.1-8b-instant',
    SMART: 'llama-3.3-70b-versatile',
};

export async function extractIntentAction(userInput: string): Promise<UserIntent> {
    const systemPrompt = `
      You are an emotional intelligence AI. Analyze the user's input to understand what kind of human connection they are looking for.
      Output JSON only.
      Schema:
      {
        "connection_type": "friendship" | "collaboration" | "emotional" | "romantic" | "casual",
        "energy_level": "calm" | "playful" | "focused" | "deep",
        "pace": "slow" | "no_pressure" | "open" | "intentional",
        "boundaries": ["string"]
      }
    `;

    try {
        const groq = getGroqClient();
        if (!groq) throw new Error("AI Service Unavailable");

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userInput }
            ],
            model: AI_MODELS.FAST,
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content from AI');

        const parsed = JSON.parse(content);
        return {
            raw_input: userInput,
            ...parsed
        };
    } catch (error) {
        console.error('Intent extraction failed:', error);
        // Fallback
        return {
            raw_input: userInput,
            connection_type: 'friendship',
            energy_level: 'calm',
            pace: 'open',
            boundaries: []
        };
    }
}

export async function generateStoryAction(userIntent: UserIntent, matchedUserProfile: any): Promise<StoryCard> {
    const systemPrompt = `
      Generate a "Story Card" for a potential match.
      User's Intent: ${JSON.stringify(userIntent)}
      Matched Profile: ${JSON.stringify(matchedUserProfile)}
      
      Task:
      1. Write ONE sentence explaining why this connection makes sense.
      2. Select 2 short "Visual Proof" tags (e.g., "Night-focused", "Calm energy").
      
      Rules:
      - Calm, observational tone.
      - No hype, no flirting, no percentages.
      - Never sound like an algorithm.
      
      Output JSON only:
      {
        "story_line": "string",
        "visual_proof_tags": ["string", "string"]
      }
    `;

    try {
        const groq = getGroqClient();
        if (!groq) throw new Error("AI Service Unavailable");

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt }
            ],
            model: AI_MODELS.FAST,
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content from AI');

        const parsed = JSON.parse(content);
        return {
            user_id: matchedUserProfile.id,
            photo_url: matchedUserProfile.photos?.[0] || matchedUserProfile.profile_picture,
            voice_url: matchedUserProfile.voice_url,
            story_line: parsed.story_line,
            visual_proof_tags: parsed.visual_proof_tags
        };
    } catch (error) {
        console.error('Story generation failed:', error);
        return {
            user_id: matchedUserProfile.id,
            photo_url: matchedUserProfile.photos?.[0],
            story_line: "You both seem to be looking for a similar vibe right now.",
            visual_proof_tags: ["Compatible", "Vibe Match"]
        };
    }
}

export async function generateMatchInsightAction(userProfile: any, candidateProfile: any): Promise<{ insight: string, match_score: number, compatibility_summary: string }> {
    const sanitizeProfile = (profile: any) => {
        const { embedding, ...rest } = profile;
        return rest;
    };

    const systemPrompt = `
      You are an expert matchmaker and a mutual friend. Analyze the two profiles provided below.
      
      User Profile: ${JSON.stringify(sanitizeProfile(userProfile))}
      Candidate Profile: ${JSON.stringify(sanitizeProfile(candidateProfile))}
      
      Task:
      1. 'insight': Write ONE snappy, observational sentence (max 10 words).
         - Style: Witty, "I see you", mutual friend vibe.
         - Example: "You're both chaotic goods who love cats." 
      2. 'match_score': Assign a compatibility score between 60 and 99 based on actual overlap.
      3. 'compatibility_summary': Write a balanced, human "Vibe Check" (2-3 sentences).
         - ACT LIKE A FRIEND: honestly weigh the pros ("goods") and potential quirks ("odds").
         - USE FACTUAL DETAILS: "Since you like X and they like Y..."
         - NO HALLUCINATIONS: Do not invent traits (like "cats" or "mystery") if they aren't in the JSON.
         - IF PROFILE IS EMPTY: Say "I need more info to judge this properly, but based on basics..."
         - Tone: Grounded, smart, slightly cheeky but sincere. NOT a generic horoscope.
      
      Output JSON only:
      {
        "insight": "string",
        "match_score": number,
        "compatibility_summary": "string"
      }
    `;

    try {
        try {
            // First Try: SMART Model (70b)
            const groq = getGroqClient();
            if (!groq) throw new Error("AI Service Unavailable");

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                model: AI_MODELS.SMART,
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content from match insight AI');

            const parsed = JSON.parse(content);
            return {
                insight: parsed.insight,
                match_score: parsed.match_score,
                compatibility_summary: parsed.compatibility_summary
            };

        } catch (smartError: any) {
            // Check for Rate Limit (429)
            if (smartError?.status === 429 || smartError?.message?.includes('429')) {
                console.warn('Rate limit hit on SMART model. Falling back to FAST model.');

                // Second Try: FAST Model (8b) - Cheaper/Higher Limits
                const groq = getGroqClient();
                if (!groq) throw new Error("AI Service Unavailable");

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: systemPrompt }
                    ],
                    model: AI_MODELS.FAST,
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                });

                const content = completion.choices[0]?.message?.content;
                if (!content) throw new Error('No content from fallback AI');

                const parsed = JSON.parse(content);
                return {
                    insight: parsed.insight,
                    match_score: parsed.match_score,
                    compatibility_summary: parsed.compatibility_summary
                };
            }
            throw smartError; // Re-throw other errors to hit the general fallback
        }
    } catch (error) {
        console.error('Match insight generation failed (All Models):', error);
        // "Wingman" Style Fallback
        return {
            insight: "Trust me, you two would hit it off instantly.",
            match_score: 88,
            compatibility_summary: "I stepped in because the AI brain is taking a nap, but looking at your profiles, this feels like a solid match. You should definitely say hi!"
        };
    }
}

export async function swipeAction(targetId: string, action: 'like' | 'pass') {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');

    const userId = session.user.id;

    // Check if target profile is paused
    const { data: targetProfile } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('is_paused')
        .eq('user_id', targetId)
        .single();

    if (targetProfile?.is_paused) {
        return { error: 'This profile is currently unavailable', match: false };
    }

    if (action === 'pass') {
        // Record rejection
        await supabaseAdmin.from('galaxy_matches').insert({
            user_a: userId,
            user_b: targetId,
            status: 'rejected'
        });

        // Also mark as swiped in queue
        await supabaseAdmin
            .from('galaxy_swipe_queue')
            .update({ swiped_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('profile_id', targetId);

        return { match: false };
    }

    if (action === 'like') {
        // Check for reverse like (user_b = Me, user_a = Target, status = pending)
        const { data: reverseLike } = await supabaseAdmin
            .from('galaxy_matches')
            .select('*')
            .eq('user_a', targetId)
            .eq('user_b', userId)
            .eq('status', 'pending')
            .maybeSingle();

        if (reverseLike) {
            // It's a MATCH! Update the reverse record.
            // We use the Existing Record as the "Match" Source of Truth.
            const { error } = await supabaseAdmin
                .from('galaxy_matches')
                .update({ status: 'matched', matched_at: new Date().toISOString() })
                .eq('id', reverseLike.id);

            if (error) throw error;

            // Mark as swiped in queue
            await supabaseAdmin
                .from('galaxy_swipe_queue')
                .update({ swiped_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('profile_id', targetId);

            // TODO: Trigger Notification here (or rely on DB trigger)

            return { match: true, matchId: reverseLike.id };
        } else {
            // Just a one-way like for now
            const { error } = await supabaseAdmin
                .from('galaxy_matches')
                .insert({
                    user_a: userId,
                    user_b: targetId,
                    status: 'pending'
                });

            if (error) throw error;

            // Mark as swiped in queue
            await supabaseAdmin
                .from('galaxy_swipe_queue')
                .update({ swiped_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('profile_id', targetId);

            return { match: false };
        }
    }
}

export async function resetUserHistoryAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');

    const userId = session.user.id;

    // Delete 'pending' (likes sent) and 'rejected' (passes)
    // Keep 'matched' connections!
    await supabaseAdmin
        .from('galaxy_matches')
        .delete()
        .eq('user_a', userId)
        .in('status', ['pending', 'rejected']);

    // ALSO CLEAR DAILY PICKS FOR TODAY (To allow "Next Day" simulation)
    const today = new Date().toISOString().split('T')[0];
    await supabaseAdmin
        .from('galaxy_daily_picks')
        .delete()
        .eq('user_id', userId)
        .eq('picked_at', today);

    return { success: true };
}

// Unmatch a Galaxy match
export async function unmatchAction(matchId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const userId = (session.user as any).id;

    const { error } = await supabaseAdmin
        .from('galaxy_matches')
        .update({
            status: 'unmatched',
            unmatched_by: userId,
            unmatched_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

    if (error) throw error;
    return { success: true };
}

// Block a Galaxy match
export async function blockMatchAction(matchId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const userId = (session.user as any).id;

    const { error } = await supabaseAdmin
        .from('galaxy_matches')
        .update({
            status: 'blocked',
            blocked_by: userId,
            blocked_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

    if (error) throw error;
    return { success: true };
}

// Respond to an incoming request (Accept/Reject)
export async function respondToRequestAction(matchId: string, action: 'accept' | 'reject') {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const userId = (session.user as any).id;

    // Verify the match exists and is pending and I am the target (user_b)
    const { data: match, error: fetchError } = await supabaseAdmin
        .from('galaxy_matches')
        .select('*')
        .eq('id', matchId)
        .eq('user_b', userId)
        .eq('status', 'pending')
        .single();

    if (fetchError || !match) {
        throw new Error('Request not found or already processed');
    }

    const newStatus = action === 'accept' ? 'matched' : 'rejected';
    const updates: any = { status: newStatus };

    if (action === 'accept') {
        updates.matched_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
        .from('galaxy_matches')
        .update(updates)
        .eq('id', matchId);

    if (error) throw error;
    return { success: true };
}

// Toggle pause activity status
export async function togglePauseActivityAction(isPaused: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');

    const userId = session.user.id;

    const { error } = await supabaseAdmin
        .from('galaxy_profiles')
        .update({ is_paused: isPaused })
        .eq('user_id', userId);

    if (error) throw error;
    return { success: true, isPaused };
}

// Get blocked users
export async function getBlockedUsersAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');
    const userId = session.user.id;

    // Fetch matches where blocked_by = current_user
    const { data: blockedMatches, error } = await supabaseAdmin
        .from('galaxy_matches')
        .select('*')
        .eq('status', 'blocked')
        .eq('blocked_by', userId);

    if (error) throw error;
    if (!blockedMatches || blockedMatches.length === 0) return [];

    // Get the User IDs of the BLOCKED users (the other person)
    const blockedUserIds = blockedMatches.map(m => m.user_a === userId ? m.user_b : m.user_a);

    // Fetch their profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('user_id, full_name, photos')
        .in('user_id', blockedUserIds);

    if (profileError) throw profileError;

    // Map back to a nice structure
    return blockedMatches.map(match => {
        const otherId = match.user_a === userId ? match.user_b : match.user_a;
        const profile = profiles?.find(p => p.user_id === otherId);
        return {
            matchId: match.id,
            userId: otherId,
            name: profile?.full_name || 'Unknown User',
            photo: profile?.photos?.[0] || null,
            blockedAt: match.blocked_at
        };
    });
}

// Unblock user
export async function unblockUserAction(matchId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');
    const userId = session.user.id;

    // Delete the match record entirely to allow "fresh start"
    const { error } = await supabaseAdmin
        .from('galaxy_matches')
        .delete()
        .eq('id', matchId)
        .eq('blocked_by', userId);

    if (error) throw error;
    return { success: true };
}

// Report a user
export async function reportUserAction(reportedId: string, reason: string, details?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');
    const reporterId = session.user.id;

    // Insert into galaxy_reports
    const { error } = await supabaseAdmin
        .from('galaxy_reports')
        .insert({
            reporter_id: reporterId,
            reported_id: reportedId,
            reason,
            details,
            status: 'pending'
        });

    if (error) throw error;
    return { success: true };
}

// --- Admin Actions ---

export async function getAdminReportsAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    const { data: reports, error } = await supabaseAdmin
        .from('galaxy_reports')
        .select(`
            *,
            reporter:users!reporter_id(full_name, profile_picture),
            reported:users!reported_id(full_name, profile_picture)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Attach Evidence (Last 15 messages if they matched)
    const expandedReports = await Promise.all(reports.map(async (report: any) => {
        // Find match ID (using OR to check both directions)
        const { data: match } = await supabaseAdmin
            .from('galaxy_matches')
            .select('id')
            .or(`and(user_a.eq.${report.reporter_id},user_b.eq.${report.reported_id}),and(user_a.eq.${report.reported_id},user_b.eq.${report.reporter_id})`)
            .maybeSingle();

        let chatLogs: any[] = [];
        if (match) {
            const { data: messages } = await supabaseAdmin
                .from('match_messages')
                .select('*')
                .eq('match_id', match.id)
                .order('created_at', { ascending: false })
                .limit(15);
            chatLogs = messages ? messages.reverse() : [];
        }

        return {
            ...report,
            evidence: {
                matchId: match?.id || null,
                chatLogs
            }
        };
    }));

    return expandedReports;
}

export async function getFullMatchChatHistoryAction(matchId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    const { data: messages, error } = await supabaseAdmin
        .from('match_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true }); // Oldest first for reading flow

    if (error) throw error;
    return messages || [];
}

export async function resolveReportAction(reportId: string, action: 'dismiss' | 'ban') {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    // Get report details
    const { data: report } = await supabaseAdmin.from('galaxy_reports').select('reported_id').eq('id', reportId).single();
    if (!report) throw new Error("Report not found");

    if (action === 'ban') {
        // Ban the user
        await supabaseAdmin.from('users').update({ is_banned: true }).eq('id', report.reported_id);
    }

    // Update report status
    const status = action === 'ban' ? 'resolved' : 'dismissed';
    const { error } = await supabaseAdmin.from('galaxy_reports').update({ status }).eq('id', reportId);

    if (error) throw error;
    return { success: true };
}

export async function getAdminStatsAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    // Fetch data for aggregation
    // 1. User Stats & Verification (Source of Truth: users table)
    const { data: usersData } = await supabaseAdmin
        .from('users')
        .select('created_at, face_verified');

    // 2. Swipes & Matches (Source of Truth: galaxy_matches table)
    const { data: matchesData } = await supabaseAdmin
        .from('galaxy_matches')
        .select('created_at, status');

    // 3. Demographics (Source of Truth: galaxy_profiles table)
    const { data: profilesData } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('gender');

    // 4. Pending Reports
    const { count: reportCount } = await supabaseAdmin
        .from('galaxy_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Aggregations
    const userCount = usersData?.length || 0;
    const verifiedCount = usersData?.filter((u: any) => u.face_verified).length || 0;

    // Swipes = Total interaction records (pending + rejected + matched)
    // Note: each row represents an initiator's action
    const totalSwipes = matchesData?.length || 0;
    const matchCount = matchesData?.filter((m: any) => m.status === 'matched').length || 0;

    // Growth Series (Last 30 Days)
    const dailyGrowth: Record<string, number> = {};
    const dailyMatches: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyGrowth[key] = 0;
        dailyMatches[key] = 0;
    }

    usersData?.forEach((u: any) => {
        const key = u.created_at.split('T')[0];
        if (dailyGrowth[key] !== undefined) dailyGrowth[key]++;
    });

    matchesData?.forEach((m: any) => {
        if (m.status === 'matched') {
            const key = m.created_at.split('T')[0];
            if (dailyMatches[key] !== undefined) dailyMatches[key]++;
        }
    });

    const growthSeries = Object.keys(dailyGrowth).sort().map(date => ({
        date,
        users: dailyGrowth[date],
        matches: dailyMatches[date]
    }));

    // Demographics Aggregation
    const demographics = {
        male: 0,
        female: 0,
        other: 0,
        verified: verifiedCount
    };

    profilesData?.forEach((p: any) => {
        if (!p.gender) {
            demographics.other++;
            return;
        }

        const g = p.gender.toLowerCase().trim();
        if (['male', 'man', 'he/him'].includes(g)) demographics.male++;
        else if (['female', 'woman', 'she/her'].includes(g)) demographics.female++;
        else demographics.other++;
    });

    // If we have more users than profiles, account for them in 'Other' (or Unknown)
    const profilesCount = profilesData?.length || 0;
    if (userCount > profilesCount) {
        demographics.other += (userCount - profilesCount);
    }

    return {
        users: userCount,
        pendingReports: reportCount || 0,
        matches: matchCount,
        growthSeries,
        demographics,
        funnel: {
            views: Math.round(totalSwipes * 1.2), // Heuristic: 20% bounce/exit before action
            swipes: totalSwipes,
            matches: matchCount
        }
    };
}

export async function getAdminUsersAction(search?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    let query = supabaseAdmin
        .from('users')
        .select(`
            id, 
            full_name, 
            email, 
            profile_picture, 
            is_banned, 
            face_verified,
            created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (search) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);

        if (isUUID) {
            query = query.or(`id.eq.${search},full_name.ilike.%${search}%,email.ilike.%${search}%`);
        } else {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
    }

    const { data: usersData, error: usersError } = await query;
    if (usersError) throw usersError;

    // Fetch profiles manually because Foreign Key might be missing or typed as Text
    const userIds = usersData.map((u: any) => u.id);

    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabaseAdmin
            .from('galaxy_profiles')
            .select('*')
            .in('user_id', userIds);

        if (!profilesError && profilesData) {
            profilesData.forEach((p: any) => {
                profilesMap[p.user_id] = p;
            });
        }
    }

    // Merge logic
    return usersData.map((user: any) => ({
        ...user,
        profile: profilesMap[user.id] || null
    }));
}

export async function toggleUserBanAction(targetId: string, shouldBan: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    const { error } = await supabaseAdmin.from('users').update({ is_banned: shouldBan }).eq('id', targetId);
    if (error) throw error;
    return { success: true };
}

export async function toggleUserVerificationAction(targetId: string, shouldVerify: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    const updates: any = { face_verified: shouldVerify };
    if (shouldVerify) {
        updates.face_verified_at = new Date().toISOString();
    } else {
        updates.face_verified_at = null;
    }

    const { error } = await supabaseAdmin.from('users').update(updates).eq('id', targetId);
    if (error) throw error;
    return { success: true };
}

export async function toggleUserPauseAction(targetId: string, shouldPause: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;

    // Check admin status
    const { data: userData } = await supabaseAdmin.from('users').select('is_admin').eq('id', userId).single();
    if (!userData?.is_admin) throw new Error("Unauthorized: Admin only");

    const { error } = await supabaseAdmin
        .from('galaxy_profiles')
        .update({ is_paused: shouldPause })
        .eq('user_id', targetId);

    if (error) throw error;
    return { success: true };
}

// --- Swipe Queue Management ---

/**
 * Get the next batch of profiles from the user's swipe queue
 * If no queue exists, generates a new one
 */
export async function getSwipeQueueAction(limit: number = 10) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');
    const userId = session.user.id;

    // Get next unswiped profiles from queue
    const { data: queueItems } = await supabaseAdmin
        .from('galaxy_swipe_queue')
        .select('profile_id, queue_position')
        .eq('user_id', userId)
        .is('swiped_at', null)
        .order('queue_position', { ascending: true })
        .limit(limit);

    if (!queueItems || queueItems.length === 0) {
        // Generate new queue
        console.log('📋 No queue found, generating new queue...');
        return await generateSwipeQueueAction(limit);
    }

    console.log(`📋 Found ${queueItems.length} profiles in queue`);

    // Load full profiles
    const profileIds = queueItems.map(q => q.profile_id);
    const { data: profiles } = await supabaseAdmin
        .from('galaxy_profiles')
        .select(`*, users!inner(face_verified, profile_picture)`)
        .in('user_id', profileIds);

    if (!profiles || profiles.length === 0) return [];

    // Sort by queue position to maintain order
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    const orderedProfiles = queueItems
        .map(q => profileMap.get(q.profile_id))
        .filter(p => p != null);

    return orderedProfiles;
}

/**
 * Generate new entries for the swipe queue
 * Fetches profiles based on user preferences and adds them to queue
 */
export async function generateSwipeQueueAction(count: number = 10) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Not authenticated');
    const userId = session.user.id;

    console.log(`🎲 Generating ${count} new queue entries...`);

    // Get max position to append new entries
    const { data: maxPos } = await supabaseAdmin
        .from('galaxy_swipe_queue')
        .select('queue_position')
        .eq('user_id', userId)
        .order('queue_position', { ascending: false })
        .limit(1)
        .maybeSingle();

    let startPosition = (maxPos?.queue_position || 0) + 1;

    // Fetch excluded IDs (interactions + existing queue)
    const { data: interactions } = await supabaseAdmin
        .from('galaxy_matches')
        .select('user_a, user_b')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .limit(5000);

    const excludedIds = new Set([userId]);
    if (interactions) {
        interactions.forEach((i: any) => {
            if (i.user_a === userId) excludedIds.add(i.user_b);
            else excludedIds.add(i.user_a);
        });
    }

    // Also exclude profiles already in queue
    const { data: existingQueue } = await supabaseAdmin
        .from('galaxy_swipe_queue')
        .select('profile_id')
        .eq('user_id', userId);

    if (existingQueue) {
        existingQueue.forEach(q => excludedIds.add(q.profile_id));
    }

    console.log(`🚫 Excluding ${excludedIds.size} profiles`);

    // Fetch user preferences
    const { data: userProfile } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('interested_in, gender')
        .eq('user_id', userId)
        .maybeSingle();

    const interestedIn = userProfile?.interested_in || ['everyone'];

    // Fetch candidates
    let query = supabaseAdmin
        .from('galaxy_profiles')
        .select('user_id')
        .neq('user_id', userId)
        .eq('is_paused', false);

    if (!interestedIn.includes('everyone')) {
        query = query.in('gender', interestedIn);
    }

    query = query.limit(500);

    const { data: candidates } = await query;

    if (!candidates || candidates.length === 0) {
        console.log('⚠️ No candidates found');
        return [];
    }

    // Filter excluded and shuffle for variety
    const validCandidates = candidates
        .filter(c => !excludedIds.has(c.user_id))
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

    console.log(`✅ Selected ${validCandidates.length} new profiles for queue`);

    if (validCandidates.length === 0) return [];

    // Insert into queue
    const queueInserts = validCandidates.map((c, index) => ({
        user_id: userId,
        profile_id: c.user_id,
        queue_position: startPosition + index
    }));

    const { error: insertError } = await supabaseAdmin
        .from('galaxy_swipe_queue')
        .insert(queueInserts);

    if (insertError) {
        console.error('❌ Queue insert failed:', insertError);
        throw insertError;
    }

    // Return full profiles
    const profileIds = validCandidates.map(c => c.user_id);
    const { data: profiles } = await supabaseAdmin
        .from('galaxy_profiles')
        .select(`*, users!inner(face_verified, profile_picture)`)
        .in('user_id', profileIds);

    // Maintain the shuffled order by mapping back
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const orderedProfiles = validCandidates
        .map(c => profileMap.get(c.user_id))
        .filter(p => p != null);

    return orderedProfiles || [];
}

/**
 * Mark a profile as viewed in the queue
 * Used for analytics and tracking user engagement
 */
export async function markProfileViewedAction(profileId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return; // Silent fail
    const userId = session.user.id;

    await supabaseAdmin
        .from('galaxy_swipe_queue')
        .update({ viewed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .is('viewed_at', null); // Only update if not already viewed
}
