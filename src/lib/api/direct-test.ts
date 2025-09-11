import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testDirect() {
  try {
    // console.log削除（セキュリティ対応）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // console.log削除（セキュリティ対応）
    console.log('🔑 Service Role Key:', serviceRoleKey ? `${serviceRoleKey.slice(0, 20)}...` : 'Missing')
    
    // Create client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 1: Simple health check
    // console.log削除（セキュリティ対応）
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      // エラーログ削除（セキュリティ対応）
      // Try to create a simple table to test connection
      // console.log削除（セキュリティ対応）
      const { error: createError } = await supabase
        .from('test_table')
        .select('*')
        .limit(1)
        
      // console.log削除（セキュリティ対応）
      return false
    }
    
    // console.log削除（セキュリティ対応）
    // console.log削除（セキュリティ対応）
    // Test 2: Try to insert a test user
    // console.log削除（セキュリティ対応）
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
      // エラーログ削除（セキュリティ対応）
    } else {
      // console.log削除（セキュリティ対応）
      // Clean up - delete the test user
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id)
      
      // console.log削除（セキュリティ対応）
    }
    
    // Test 3: Check other tables
    // console.log削除（セキュリティ対応）
    const tables = ['articles', 'books', 'scraps', 'topics']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        // console.log削除（セキュリティ対応）
      } else {
        // console.log削除（セキュリティ対応）
      }
    }
    
    // console.log削除（セキュリティ対応）
    return true
    
  } catch (error: any) {
    // エラーログ削除（セキュリティ対応）
    return false
  }
}

testDirect().then(success => {
  console.log('\n' + '='.repeat(50))
  // console.log削除（セキュリティ対応）
  console.log('='.repeat(50))
  
  if (success) {
    // console.log削除（セキュリティ対応）
    // console.log削除（セキュリティ対応）
    // console.log削除（セキュリティ対応）
  }
  
  process.exit(success ? 0 : 1)
})