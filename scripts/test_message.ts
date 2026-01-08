
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testMessage() {
    const matchId = 'ce02e29c-830c-4eab-9033-2a18b98b8722';
    const senderId = 'a3be83c8-2c5a-4ad6-a19c-43fd04610eec'; // Phase 2 User A

    console.log(`Testing message insert for Match ID: ${matchId}`);

    const { data, error } = await supabaseAdmin
        .from('private_messages')
        .insert({
            chat_id: matchId,
            sender_id: senderId,
            content: 'Hello from Galaxy Check script!'
        })
        .select();

    if (error) {
        console.error("Error inserting message:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success! Message inserted.", data);
    }
}

testMessage();
