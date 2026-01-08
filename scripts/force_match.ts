
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function forceMatch() {
    const matchId = 'ce02e29c-830c-4eab-9033-2a18b98b8722';
    console.log(`Forcing match for ID: ${matchId}`);

    const { error } = await supabaseAdmin
        .from('galaxy_matches')
        .update({ status: 'matched', matched_at: new Date().toISOString() })
        .eq('id', matchId);

    if (error) {
        console.error("Error updating match:", error);
    } else {
        console.log("Success! Match status set to 'matched'.");
    }
}

forceMatch();
