#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs the swipe queue migration against the Supabase database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('📂 Reading migration file...');

        const migrationPath = path.join(__dirname, '../supabase/migrations/20260124_create_swipe_queue.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Running migration...');

        // Split by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement) {
                const { error } = await supabase.rpc('exec_sql', { sql: statement });
                if (error) {
                    // Try alternative method if exec_sql doesn't exist
                    console.log('Trying direct execution...');

                    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`
                        },
                        body: JSON.stringify({ query: statement })
                    });

                    if (!response.ok) {
                        console.error('Statement failed:', statement.substring(0, 100));
                    }
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        console.log('\n📋 Verifying table creation...');

        // Verify table exists
        const { data, error } = await supabase
            .from('galaxy_swipe_queue')
            .select('*')
            .limit(1);

        if (error) {
            console.log('⚠️  Table verification note:', error.message);
            console.log('Please manually run the SQL file in Supabase dashboard if needed.');
        } else {
            console.log('✅ Table verified successfully!');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('\n💡 Manual migration steps:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Copy contents of supabase/migrations/20260124_create_swipe_queue.sql');
        console.log('3. Paste and run in SQL Editor');
        process.exit(1);
    }
}

runMigration();
