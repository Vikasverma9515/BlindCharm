
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manually parse .env.local
try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Found .env.local, parsing...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // remove quotes
                process.env[key] = value;
            }
        });
    } else {
        console.log('.env.local not found');
    }
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Checked process.env and .env.local');
    console.error('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.error('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    console.log('Checking storage buckets...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error fetching buckets:', error);
    } else {
        console.log('Buckets found:', data?.map(b => b.name));
    }
}

async function checkProfiles() {
    await checkBuckets();
    console.log('Checking galaxy_profiles table...');

    const { data, error, count } = await supabase
        .from('galaxy_profiles')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log(`Found ${count} profiles.`);
        if (data && data.length > 0) {
            console.log('First profile sample:', data[0]);
        } else {
            console.log('No profiles found in galaxy_profiles table.');
        }
    }
}

checkProfiles();
