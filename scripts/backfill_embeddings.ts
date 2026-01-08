import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
    console.error('Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Helper to calculate age from DOB string/date
function calculateAge(dob: string | Date | null): number | null {
    if (!dob) return null;
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.trim().replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

async function backfill() {
    console.log('Starting rich embedding backfill...');

    // 1. Fetch all profiles AND join with users to get birth_date if missing (or location)
    // Note: supabase-js joins require explicit relationship definitions or matching columns. 
    // 'galaxy_profiles' has user_id, 'users' has id.
    const { data: profiles, error } = await supabase
        .from('galaxy_profiles')
        .select(`
        *,
        users (
            dob
        )
    `);

    if (error) {
        console.error('Error fetching profiles:', error);
        process.exit(1);
    }

    console.log(`Found ${profiles.length} profiles to update.`);

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
        // 2. Construct RICH Narrative Text
        // This format is designed to be understood by the LLM as a complete person description.

        // Determine Age
        // galaxy_profiles doesn't have birth_date directly in schema usually, it's on users table.
        // The join returns 'users' object.
        const age = calculateAge(profile.users?.dob);

        // Build the narrative
        let summary = `User Profile Overview:\n`;
        summary += `Name: ${profile.full_name || 'Unknown'}\n`;
        if (age) summary += `Age: ${age}\n`;
        if (profile.gender) summary += `Gender: ${profile.gender}\n`;
        if (profile.location) summary += `Location: ${profile.location}\n`;
        if (profile.height) summary += `Height: ${profile.height} cm\n`;
        if (profile.job_title) summary += `Occupation: ${profile.job_title}\n`;
        if (profile.company) summary += `Company: ${profile.company}\n`;
        if (profile.school) summary += `School: ${profile.school}\n`;

        summary += `\nPersonal Details & Vibe:\n`;
        if (profile.bio) summary += `Bio: "${profile.bio}"\n`;
        if (profile.about_me) summary += `About Me: "${profile.about_me}"\n`;
        if (profile.energy_level) summary += `Energy Level: ${profile.energy_level}\n`;
        if (profile.connection_style) summary += `Connection Style: ${profile.connection_style}\n`;

        if (profile.identity_signals && profile.identity_signals.length > 0) {
            summary += `Personality Traits: ${profile.identity_signals.join(', ')}\n`;
        }

        if (profile.interest_capsules && profile.interest_capsules.length > 0) {
            summary += `Interests: ${profile.interest_capsules.join(', ')}\n`;
        }

        if (profile.interests && profile.interests.length > 0) {
            summary += `More Interests: ${profile.interests.join(', ')}\n`;
        }

        // Add prompt answers if any
        if (profile.prompts && Array.isArray(profile.prompts)) {
            summary += `\nQ&A:\n`;
            profile.prompts.forEach((p: any) => {
                if (p.question && p.answer) {
                    summary += `Q: ${p.question}\nA: ${p.answer}\n`;
                }
            });
        }

        // Safety check - if mostly empty
        if (summary.length < 50) {
            console.log(`Skipping User ${profile.user_id} (insufficient data)`);
            continue;
        }

        try {
            console.log(`Generating rich embedding for User ${profile.user_id} (${profile.full_name})...`);
            const embedding = await generateEmbedding(summary);

            const { error: updateError } = await supabase
                .from('galaxy_profiles')
                .update({ embedding })
                .eq('user_id', profile.user_id);

            if (updateError) throw updateError;

            console.log(`✅ User ${profile.user_id} updated.`);
            successCount++;
        } catch (e) {
            console.error(`❌ Failed for user ${profile.user_id}:`, e);
            errorCount++;
        }

        // Rate limit safety
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`Backfill complete. Success: ${successCount}, Errors: ${errorCount}`);
}

backfill();
