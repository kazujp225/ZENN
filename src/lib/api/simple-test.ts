import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('Environment variables check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')

async function testBasicConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to get current user (will return null if not authenticated, but connection works)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Auth connection failed:', error.message)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase')
    console.log('✅ Auth service is working')
    
    // Test a simple query - this will fail if tables don't exist but connection is OK
    const { error: queryError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (queryError) {
      console.log('ℹ️  Database connection OK, but tables not created yet')
      console.log('   Error:', queryError.message)
      console.log('   Please run the schema.sql in Supabase Dashboard > SQL Editor')
    } else {
      console.log('✅ Database tables are available')
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

testBasicConnection().then(success => {
  console.log('\n' + '='.repeat(50))
  console.log(success ? '✅ Basic connection test PASSED' : '❌ Basic connection test FAILED')
  console.log('='.repeat(50))
  process.exit(success ? 0 : 1)
})