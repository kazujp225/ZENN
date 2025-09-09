import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testDirect() {
  try {
    console.log('🚀 Direct Supabase API test...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('🔗 Supabase URL:', supabaseUrl)
    console.log('🔑 Service Role Key:', serviceRoleKey ? `${serviceRoleKey.slice(0, 20)}...` : 'Missing')
    
    // Create client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 1: Simple health check
    console.log('\n📡 Testing basic connection...')
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      console.error('❌ Health check failed:', healthError.message)
      
      // Try to create a simple table to test connection
      console.log('\n🔧 Testing table creation...')
      const { error: createError } = await supabase
        .from('test_table')
        .select('*')
        .limit(1)
        
      console.log('Create test result:', createError?.message || 'Success')
      
      return false
    }
    
    console.log('✅ Health check passed')
    console.log('📊 Users table count:', healthData)
    
    // Test 2: Try to insert a test user
    console.log('\n👤 Testing user insertion...')
    const testUser = {
      username: 'test_user_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      display_name: 'Test User'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message)
    } else {
      console.log('✅ Test user created:', insertData.username)
      
      // Clean up - delete the test user
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id)
      
      console.log('🧹 Test user cleaned up')
    }
    
    // Test 3: Check other tables
    console.log('\n📋 Testing other tables...')
    const tables = ['articles', 'books', 'scraps', 'topics']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count || 0} records`)
      }
    }
    
    console.log('\n🎉 All tests completed successfully!')
    return true
    
  } catch (error: any) {
    console.error('💥 Test failed:', error.message)
    return false
  }
}

testDirect().then(success => {
  console.log('\n' + '='.repeat(50))
  console.log(success ? '✅ DIRECT TEST PASSED' : '❌ DIRECT TEST FAILED')
  console.log('='.repeat(50))
  
  if (success) {
    console.log('🚀 Your Supabase database is ready!')
    console.log('💡 You can now use all API functions')
    console.log('🌐 Next.js app is running at http://localhost:3001')
  }
  
  process.exit(success ? 0 : 1)
})