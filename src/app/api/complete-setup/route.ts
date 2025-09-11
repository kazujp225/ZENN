import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  // 🚨 CRITICAL SECURITY: This endpoint has been disabled - it can drop all tables and disable all security policies
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Complete database setup endpoints are extremely dangerous and not available'
  }, { status: 403 })
  
  /*
  try {
    const supabase = createAdminClient()

    console.log('Starting complete database setup...')

    // Step 1: Create exec_sql function if it doesn't exist
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionQuery })
    if (functionError) {
      console.log('Function creation failed, trying alternative method...')
      // If RPC doesn't work, we'll use the admin client directly
    }

    // Step 2: Drop all existing RLS policies
    const dropPoliciesQueries = [
      'DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON users;',
      'DROP POLICY IF EXISTS "Users can insert own profile" ON users;',
      'DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON articles;',
      'DROP POLICY IF EXISTS "Users can insert own articles" ON articles;',
      'DROP POLICY IF EXISTS "Users can update own articles" ON articles;',
      'DROP POLICY IF EXISTS "Users can delete own articles" ON articles;',
      'DROP POLICY IF EXISTS "Topics are viewable by everyone" ON topics;',
      'DROP POLICY IF EXISTS "Authenticated users can insert topics" ON topics;',
      'DROP POLICY IF EXISTS "Article topics are viewable by everyone" ON article_topics;',
      'DROP POLICY IF EXISTS "Users can manage own article topics" ON article_topics;',
      'DROP POLICY IF EXISTS "Published books are viewable by everyone" ON books;',
      'DROP POLICY IF EXISTS "Users can insert own books" ON books;',
      'DROP POLICY IF EXISTS "Users can update own books" ON books;',
      'DROP POLICY IF EXISTS "Users can delete own books" ON books;',
      'DROP POLICY IF EXISTS "Public scraps are viewable by everyone" ON scraps;',
      'DROP POLICY IF EXISTS "Users can insert own scraps" ON scraps;',
      'DROP POLICY IF EXISTS "Users can update own scraps" ON scraps;',
      'DROP POLICY IF EXISTS "Users can delete own scraps" ON scraps;',
      'DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;',
      'DROP POLICY IF EXISTS "Authenticated users can like" ON likes;',
      'DROP POLICY IF EXISTS "Users can delete own likes" ON likes;',
      'DROP POLICY IF EXISTS "Comments are viewable by everyone" ON article_comments;',
      'DROP POLICY IF EXISTS "Authenticated users can comment" ON article_comments;',
      'DROP POLICY IF EXISTS "Users can update own comments" ON article_comments;',
      'DROP POLICY IF EXISTS "Users can delete own comments" ON article_comments;',
      'DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;',
      'DROP POLICY IF EXISTS "Users can follow others" ON follows;',
      'DROP POLICY IF EXISTS "Users can unfollow" ON follows;',
      'DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "System can create notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;'
    ]

    // Step 3: Disable RLS temporarily
    const disableRLSQueries = [
      'ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS articles DISABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE IF EXISTS topics DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS article_topics DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS books DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS scraps DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS article_comments DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS follows DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;'
    ]

    // Step 4: Recreate all tables with correct schema
    const recreateTablesQueries = [
      // Drop tables in correct order
      'DROP TABLE IF EXISTS notifications CASCADE;',
      'DROP TABLE IF EXISTS follows CASCADE;',
      'DROP TABLE IF EXISTS article_comments CASCADE;',
      'DROP TABLE IF EXISTS likes CASCADE;',
      'DROP TABLE IF EXISTS scraps CASCADE;',
      'DROP TABLE IF EXISTS books CASCADE;',
      'DROP TABLE IF EXISTS article_topics CASCADE;',
      'DROP TABLE IF EXISTS articles CASCADE;',
      'DROP TABLE IF EXISTS topics CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',

      // Enable extensions
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',

      // Create tables
      `CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        website_url TEXT,
        twitter_username TEXT,
        github_username TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '📝',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        published BOOLEAN DEFAULT false,
        type VARCHAR(50) DEFAULT 'tech',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE topics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        articles_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE books (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '📚',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        published BOOLEAN DEFAULT false,
        price INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE scraps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '💭',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT true,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE article_topics (
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (article_id, topic_id)
      );`,

      `CREATE TABLE likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        target_id UUID NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_id, target_type)
      );`,

      `CREATE TABLE article_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      `CREATE TABLE follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );`,

      `CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_id UUID,
        entity_type VARCHAR(50),
        action_url TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    ]

    // Step 5: Create simple RLS policies (no auth.uid() dependency)
    const simplePoliciesQueries = [
      // Temporarily allow all operations for testing
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true);',
      
      'ALTER TABLE articles ENABLE ROW LEVEL SECURITY;', 
      'CREATE POLICY "Allow all articles operations" ON articles FOR ALL USING (true);',
      
      'ALTER TABLE topics ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all topics operations" ON topics FOR ALL USING (true);',
      
      'ALTER TABLE books ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all books operations" ON books FOR ALL USING (true);',
      
      'ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all scraps operations" ON scraps FOR ALL USING (true);',
      
      'ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all article_topics operations" ON article_topics FOR ALL USING (true);',
      
      'ALTER TABLE likes ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all likes operations" ON likes FOR ALL USING (true);',
      
      'ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all comments operations" ON article_comments FOR ALL USING (true);',
      
      'ALTER TABLE follows ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all follows operations" ON follows FOR ALL USING (true);',
      
      'ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Allow all notifications operations" ON notifications FOR ALL USING (true);'
    ]

    // Execute all queries
    const allQueries = [
      ...dropPoliciesQueries,
      ...disableRLSQueries, 
      ...recreateTablesQueries,
      ...simplePoliciesQueries
    ]

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const query of allQueries) {
      try {
        console.log(`Executing: ${query.substring(0, 80)}...`)
        
        // Try using RPC first, fall back to direct query if needed
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.error(`RPC Error: ${query}`, error)
          results.push({ 
            query: query.substring(0, 80) + '...', 
            status: 'error', 
            error: error.message 
          })
          errorCount++
        } else {
          results.push({ 
            query: query.substring(0, 80) + '...', 
            status: 'success' 
          })
          successCount++
        }
      } catch (directError) {
        console.error(`Direct execution error: ${query}`, directError)
        results.push({ 
          query: query.substring(0, 80) + '...', 
          status: 'error', 
          error: directError.message 
        })
        errorCount++
      }
    }

    console.log(`Setup completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: errorCount === 0,
      message: `Database setup completed: ${successCount} success, ${errorCount} errors`,
      summary: {
        total: allQueries.length,
        success: successCount,
        errors: errorCount
      },
      details: results
    })

  } catch (error) {
    console.error('Complete setup error:', error)
    return NextResponse.json(
      { error: 'Complete setup failed', details: error.message },
      { status: 500 }
    )
  }
  */
}