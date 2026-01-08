
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateEmbedding } from '@/lib/embeddings'

interface UpdateProfileData {
    about_me?: string
    identity_signals?: string[]
    connection_style?: string
    interest_capsules?: string[]
    current_mood?: string
    pronouns?: string
    height?: string
    energy_level?: string

    // Legacy / Shared
    full_name?: string
    bio?: string
    job_title?: string
    company?: string
    school?: string
    location?: string
    gender?: string
    interests?: string[]
    photos?: string[]
    prompts?: any[]
    voice_url?: string | null
    birth_date?: string
    latitude?: number | null
    longitude?: number | null

    // UI prefs
    // card_theme removed
}

export async function updateProfileAction(data: UpdateProfileData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // 1. Generate "Vibe" Text for Embedding
        // We combine all semantic fields to create a rich vector representation
        const vibeParts = [
            data.bio ? `Bio: ${data.bio}` : '',
            data.about_me ? `About Me: ${data.about_me}` : '',
            data.interest_capsules?.length ? `Interests: ${data.interest_capsules.join(', ')}` : '',
            data.interests?.length ? `More Interests: ${data.interests.join(', ')}` : '',
            data.identity_signals?.length ? `Traits: ${data.identity_signals.join(', ')}` : '',
            data.connection_style ? `Connection Style: ${data.connection_style}` : '',
            data.energy_level ? `Energy: ${data.energy_level}` : '',
            data.gender ? `Gender: ${data.gender}` : '',
            data.job_title ? `Job: ${data.job_title}` : ''
        ].filter(p => p.length > 0);

        const vibeText = vibeParts.join('\n');

        let embedding = null;
        if (vibeText.length > 10) { // Only generate if we have meaningful content
            try {
                embedding = await generateEmbedding(vibeText);
            } catch (e) {
                console.error("Embedding generation failed during profile update:", e);
                // Continue without embedding (don't block save)
            }
        }

        // 2. Prepare Update Object
        const updatePayload: any = {
            ...data,
            user_id: userId,
            updated_at: new Date().toISOString()
        };

        if (embedding) {
            updatePayload.embedding = embedding;
        }

        // Remove undefined fields to avoid overwriting with null if meant to be ignored? 
        // Actually, for a partial update, we should only pass what's in 'data'.
        // But 'data' comes from the client as a partial object from the edit form.
        // It should be safe to pass mostly as-is, but we must ensure keys match DB columns.
        // The interface 'UpdateProfileData' mostly matches DB columns.
        // 'full_name' and 'birth_date' might need to go to 'users' table or handled separately if they are not in galaxy_profiles?
        // Check schema: galaxy_profiles has full_name, birth_date. OK.

        // 3. Upsert to galaxy_profiles
        const { error: galaxyError } = await supabaseAdmin
            .from('galaxy_profiles')
            .upsert(updatePayload, { onConflict: 'user_id' });

        if (galaxyError) throw galaxyError;

        // 4. Sync specific fields to public.users (legacy support)
        if (data.photos && data.photos.length > 0) {
            await supabaseAdmin.from('users').update({
                profile_picture: data.photos[0]
            }).eq('id', userId);
        }

        if (data.full_name) {
            await supabaseAdmin.from('users').update({
                full_name: data.full_name
            }).eq('id', userId);
        }

        // 5. Invalidate Cached AI Insights for Today
        // Since profile changed, the "Vibe Check" (why you match) needs to be re-generated.
        const today = new Date().toISOString().split('T')[0];

        // We set insight/summary to NULL so next page load triggers re-generation
        await supabaseAdmin
            .from('galaxy_daily_picks')
            .update({
                insight: null,
                match_score: null,
                compatibility_summary: null
            })
            .eq('user_id', userId)
            .eq('picked_at', today);

        return { success: true };

    } catch (error: any) {
        console.error('Update profile action failed:', error);
        return { success: false, error: error.message };
    }
}
