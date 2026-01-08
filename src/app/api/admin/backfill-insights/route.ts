
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateMatchInsightAction } from '@/app/galaxy/actions';

// Helper for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
    try {
        console.log("Starting Insights backfill (Debug Mode)...");

        // 1. Fetch picks without insights
        const { data: picks, error } = await supabaseAdmin
            .from('galaxy_daily_picks')
            .select('*')
            .is('insight', null)
            .limit(50); // Process 50 at a time

        if (error) throw error;

        if (!picks || picks.length === 0) {
            return NextResponse.json({ message: "No picks need insight backfilling." });
        }

        console.log(`Found ${picks.length} picks to process.`);

        let successCount = 0;
        let failCount = 0;
        let lastError = null;

        for (const pick of picks) {
            try {
                // Fetch User Profile
                const { data: userProfile } = await supabaseAdmin
                    .from('galaxy_profiles')
                    .select('*')
                    .eq('user_id', pick.user_id)
                    .single();

                // Fetch Candidate Profile
                const { data: candidateProfile } = await supabaseAdmin
                    .from('galaxy_profiles')
                    .select('*')
                    .eq('user_id', pick.picked_profile_id)
                    .single();

                if (!userProfile || !candidateProfile) {
                    console.timeLog(`Missing profile for pick ${pick.id}`);
                    failCount++;
                    continue;
                }

                await sleep(2000);

                const aiResult = await generateMatchInsightAction(userProfile, candidateProfile);

                // Update DB
                const { error: updateError } = await supabaseAdmin
                    .from('galaxy_daily_picks')
                    .update({
                        insight: aiResult.insight,
                        match_score: aiResult.match_score,
                        compatibility_summary: aiResult.compatibility_summary
                    })
                    .eq('id', pick.id);

                if (updateError) {
                    console.error(`Failed to update pick ${pick.id}:`, updateError);
                    lastError = updateError.message;
                    failCount++;
                } else {
                    successCount++;
                    console.log(`Success: Pick ${pick.id}`);
                }

            } catch (err: any) {
                console.error(`Error processing pick ${pick.id}:`, err);
                lastError = err.message || JSON.stringify(err);
                failCount++;
                if (err.message?.includes('429')) {
                    await sleep(5000);
                }
            }
        }

        return NextResponse.json({
            success: successCount > 0,
            processed: picks.length,
            successCount,
            failCount,
            lastError
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
