const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  try {
    console.log('\n📊 Creating tables via Supabase API...\n')
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true })
    
    if (testError && testError.code === '42P01') {
      console.log('✅ Tables need to be created')
      console.log('\n⚠️  Please execute the following SQL in Supabase Dashboard:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n1. Go to: https://supabase.com/dashboard/project/qyvjtrdvbfxgfdydyhqe/sql/new')
      console.log('2. Copy and paste the content from: supabase/init.sql')
      console.log('3. Click "Run" button')
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return
    } else if (testError) {
      console.error('❌ Connection error:', testError.message)
      return
    }
    
    // Check existing tables
    const tables = [
      'users',
      'articles',
      'topics',
      'article_topics',
      'article_comments',
      'books',
      'book_chapters',
      'scraps',
      'scrap_comments',
      'likes',
      'follows',
      'notifications',
      'sessions'
    ]
    
    console.log('📋 Checking tables:')
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`  ❌ ${table}: Not found`)
      } else {
        console.log(`  ✅ ${table}: Exists (${count || 0} records)`)
      }
    }
    
    // Create sample data if tables are empty
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (userCount === 0) {
      console.log('\n📝 Creating sample data...')
      
      // Create test user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: 'test@example.com',
          username: 'testuser',
          display_name: 'テストユーザー',
          bio: 'これはテストアカウントです'
        })
        .select()
        .single()
      
      if (userError) {
        console.log('  ⚠️  Could not create test user:', userError.message)
      } else {
        console.log('  ✅ Created test user')
        
        // Create sample article
        const { error: articleError } = await supabase
          .from('articles')
          .insert({
            title: 'Supabaseを使ったNext.jsアプリの構築',
            content: '# はじめに\n\nSupabaseとNext.jsを組み合わせることで、フルスタックアプリケーションを簡単に構築できます。\n\n## 主な機能\n\n- リアルタイムデータベース\n- 認証システム\n- ファイルストレージ\n- Edge Functions\n\n## まとめ\n\nSupabaseは素晴らしいBaaSです！',
            slug: 'supabase-nextjs-tutorial',
            emoji: '🚀',
            author_id: userData.id,
            is_published: true
          })
        
        if (articleError) {
          console.log('  ⚠️  Could not create sample article:', articleError.message)
        } else {
          console.log('  ✅ Created sample article')
        }
      }
      
      // Create sample topics
      const topics = [
        { name: 'React', slug: 'react', description: 'Reactに関する記事' },
        { name: 'Next.js', slug: 'nextjs', description: 'Next.jsに関する記事' },
        { name: 'TypeScript', slug: 'typescript', description: 'TypeScriptに関する記事' },
        { name: 'Supabase', slug: 'supabase', description: 'Supabaseに関する記事' }
      ]
      
      for (const topic of topics) {
        const { error } = await supabase
          .from('topics')
          .insert(topic)
          .select()
        
        if (!error) {
          console.log(`  ✅ Created topic: ${topic.name}`)
        }
      }
    }
    
    console.log('\n🎉 Database check complete!')
    console.log('\n📝 Next steps:')
    console.log('  1. If tables are missing, create them via SQL Editor')
    console.log('  2. Restart the application: npm run dev')
    console.log('  3. Visit http://localhost:3000')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createTables()