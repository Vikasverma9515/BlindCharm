
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateEmbedding } from '@/lib/embeddings';

export async function GET() {
    try {
        console.log("Starting backfill...");

        // 1. Fetch profiles without embeddings (or just all to be safe?)
        // Let's just do ones where embedding is null
        const { data: profiles, error } = await supabaseAdmin
            .from('galaxy_profiles')
            .select('*')
            .is('embedding', null);

        if (error) throw error;

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ message: "No profiles need backfilling." });
        }

        console.log(`Found ${profiles.length} profiles to process.`);

        let successCount = 0;
        let failCount = 0;

        for (const profile of profiles) {
            try {
                // Construct Vibe Text
                const vibeParts = [
                    profile.bio ? `Bio: ${profile.bio}` : '',
                    profile.about_me ? `About Me: ${profile.about_me}` : '',
                    profile.interest_capsules?.length ? `Interests: ${profile.interest_capsules.join(', ')}` : '',
                    profile.interests?.length ? `More Interests: ${profile.interests.join(', ')}` : '',
                    profile.identity_signals?.length ? `Traits: ${profile.identity_signals.join(', ')}` : '',
                    profile.connection_style ? `Connection Style: ${profile.connection_style}` : '',
                    profile.energy_level ? `Energy: ${profile.energy_level}` : '',
                    profile.gender ? `Gender: ${profile.gender}` : '',
                    profile.job_title ? `Job: ${profile.job_title}` : ''
                ].filter(p => p.length > 0);

                let vibeText = vibeParts.join('\n');

                // Fallback for empty/dummy profiles
                if (vibeText.length < 5) {
                    vibeText = `Gender: ${profile.gender || 'unknown'} User`;
                }

                const embedding = await generateEmbedding(vibeText);

                // Update
                const { error: updateError } = await supabaseAdmin
                    .from('galaxy_profiles')
                    .update({ embedding: embedding })
                    .eq('user_id', profile.user_id);

                if (updateError) {
                    console.error(`Failed to update user ${profile.user_id}:`, updateError);
                    failCount++;
                } else {
                    successCount++;
                }

            } catch (err) {
                console.error(`Error processing user ${profile.user_id}:`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: profiles.length,
            successCount,
            failCount
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
