import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// console.log削除（セキュリティ対応）
// console.log削除（セキュリティ対応）
// console.log削除（セキュリティ対応）
// console.log削除（セキュリティ対応）
// console.log削除（セキュリティ対応）
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
      // エラーログ削除（セキュリティ対応）
      return false
    }
    
    // console.log削除（セキュリティ対応）
    // console.log削除（セキュリティ対応）
    // Test a simple query - this will fail if tables don't exist but connection is OK
    const { error: queryError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (queryError) {
      // console.log削除（セキュリティ対応）
      // console.log削除（セキュリティ対応）
      // console.log削除（セキュリティ対応）
    } else {
      // console.log削除（セキュリティ対応）
    }
    
    return true
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return false
  }
}

testBasicConnection().then(success => {
  console.log('\n' + '='.repeat(50))
  // console.log削除（セキュリティ対応）
  console.log('='.repeat(50))
  process.exit(success ? 0 : 1)
})