import { createClient } from '@/lib/supabase/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase database')
    
    // Test auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Auth connection failed:', authError.message)
      return false
    }
    
    console.log('✅ Supabase Auth is configured')
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Run test if executed directly
if (require.main === module) {
  testSupabaseConnection().then(success => {
    process.exit(success ? 0 : 1)
  })
}