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
      // エラーログ削除（セキュリティ対応）
      return false
    }
    
    // console.log削除（セキュリティ対応）
    // Test auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Auth session missing!') {
      // エラーログ削除（セキュリティ対応）
      return false
    }
    
    // console.log削除（セキュリティ対応）
    return true
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return false
  }
}

// Run test if executed directly
if (require.main === module) {
  testSupabaseConnection().then(success => {
    process.exit(success ? 0 : 1)
  })
}