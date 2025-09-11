// Direct check of RLS status using Supabase client
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRLSStatus() {
  try {
    console.log('🔍 Checking database tables and RLS status...\n');
    
    // Check if tables exist
    const tables = ['users', 'articles', 'books', 'scraps', 'likes', 'follows'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: Error - ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🔐 Testing RLS (Row Level Security):');
    
    // Try to access as anonymous user (should be blocked for writes)
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test read access (should work for published content)
    const { data: articles, error: readError } = await anonClient
      .from('articles')
      .select('id, title, published')
      .limit(1);
    
    if (readError) {
      console.log(`❌ Anonymous read test: ${readError.message}`);
    } else {
      console.log(`✅ Anonymous read test: Can read ${articles?.length} articles`);
    }
    
    // Test write access (should be blocked without auth)
    const { error: writeError } = await anonClient
      .from('articles')
      .insert({
        title: 'Test Article',
        content: 'Test content',
        slug: `test-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000000'
      });
    
    if (writeError) {
      console.log(`✅ Anonymous write test: Properly blocked - ${writeError.message}`);
    } else {
      console.log(`❌ Anonymous write test: Should have been blocked but wasn't!`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRLSStatus();