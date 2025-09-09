import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('📊 Checking database status...\n')

  try {
    // Check users
    const { data: users, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log(`👤 Users: ${usersCount || 0} total`)
    if (users && users.length > 0) {
      console.log('   Sample users:')
      users.forEach(u => console.log(`   - ${u.username} (${u.display_name})`))
    }

    // Check topics
    const { data: topics, count: topicsCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact' })
      .limit(10)
    
    console.log(`\n🏷️ Topics: ${topicsCount || 0} total`)
    if (topics && topics.length > 0) {
      console.log('   Sample topics:', topics.map(t => t.display_name || t.name).join(', '))
    }

    // Check articles
    const { data: articles, count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log(`\n📝 Articles: ${articlesCount || 0} total`)
    if (articles && articles.length > 0) {
      console.log('   Recent articles:')
      articles.forEach(a => console.log(`   - ${a.title}`))
    }

    // Check books
    const { data: books, count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log(`\n📚 Books: ${booksCount || 0} total`)
    if (books && books.length > 0) {
      console.log('   Sample books:')
      books.forEach(b => console.log(`   - ${b.title} (${b.is_free ? 'Free' : `¥${b.price}`})`))
    }

    // Check scraps
    const { data: scraps, count: scrapsCount } = await supabase
      .from('scraps')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log(`\n💭 Scraps: ${scrapsCount || 0} total`)
    if (scraps && scraps.length > 0) {
      console.log('   Recent scraps:')
      scraps.forEach(s => console.log(`   - ${s.title} (${s.closed ? 'Closed' : 'Open'})`))
    }

    console.log('\n✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
    process.exit(1)
  }
}

// Run the check
checkDatabase()