import 'dotenv/config';
import { supabaseAdmin } from './src/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
    console.log('🚀 Applying chat migration...\n');

    const migrationPath = path.join(__dirname, 'supabase/migrations/20260104_enable_galaxy_chat.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('SQL to execute:');
    console.log(sql);
    console.log('\n---\n');

    try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // Try raw query instead
            console.log('Trying raw query...\n');
            const lines = sql.split(';').filter(line => line.trim());

            for (const line of lines) {
                if (!line.trim()) continue;

                console.log(`Executing: ${line.substring(0, 60)}...`);
                const result = await supabaseAdmin.rpc('exec_sql', { sql_query: line + ';' });

                if (result.error) {
                    console.error(`❌ Error: ${result.error.message}`);
                } else {
                    console.log('✅ Success');
                }
            }
        } else {
            console.log('✅ Migration applied successfully!');
        }

        console.log('\n🎉 Done! Try sending a message now.');
    } catch (err) {
        console.error('❌ Failed to apply migration:', err);
        console.log('\n📋 MANUAL STEPS:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the following SQL:\n');
        console.log(sql);
        console.log('\n4. Click "Run"');
    }
}

applyMigration();
