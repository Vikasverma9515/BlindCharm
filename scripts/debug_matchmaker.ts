
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

function cosineSimilarity(A: number[], B: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function debug() {
    console.log('🔍 Manual Distance Check...');

    // 1. Fetch Aria Chen (Seeded User)
    const { data: profile, error } = await supabase
        .from('galaxy_profiles')
        .select('full_name, embedding')
        .ilike('full_name', '%Aria%')
        .limit(1)
        .single();

    if (error || !profile) {
        console.error('Could not find Aria Chen:', error);
        return;
    }

    const profileVector = typeof profile.embedding === 'string' ? JSON.parse(profile.embedding) : profile.embedding;

    // 2. Generate Query Embedding
    console.log('🤖 Generating "coding" embedding...');
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'coding',
    });
    const queryVector = response.data[0].embedding;

    // 3. Compute Similarity
    const similarity = cosineSimilarity(profileVector, queryVector);
    const distance = 1 - similarity;

    console.log(`User: ${profile.full_name}`);
    console.log(`Cosine Similarity: ${similarity.toFixed(4)}`);
    console.log(`Cosine Distance: ${distance.toFixed(4)}`);
    console.log(`Threshold Check (0.1): ${similarity > 0.1 ? 'PASS' : 'FAIL'}`);

    // 4. Check RPC with this profile specifically
    console.log('--- RPC Check ---');
    const { data: rpcMatch, error: rpcError } = await supabase.rpc('match_profiles_by_vibe_v2', {
        query_embedding: queryVector,
        match_threshold: 0.01,
        match_count: 10,
        user_gender_preference: ['everyone'],
        min_age: 0,
        max_age: 1000,
        exclude_user_ids: []
    });

    if (rpcError) {
        console.error('❌ RPC Error:', rpcError);
        return;
    }

    const foundInRpc = rpcMatch?.find((m: any) => m.full_name === profile.full_name);
    console.log(`RPC returned ${rpcMatch?.length} matches.`);
    console.log(`Aria Chen in RPC results: ${foundInRpc ? 'YES' : 'NO'}`);
}

debug();
