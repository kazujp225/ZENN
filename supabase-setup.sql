-- =============================================================================
-- Supabase Setup Script - Run this in Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE CREATION (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
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
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '📝',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'tech' CHECK (type IN ('tech', 'idea')),
  topics TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '📚',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  price INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS book_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  position INTEGER NOT NULL,
  free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, slug)
);

CREATE TABLE IF NOT EXISTS scraps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '💭',
  closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scrap_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrap_id UUID REFERENCES scraps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  likeable_type TEXT NOT NULL CHECK (likeable_type IN ('article', 'book', 'scrap', 'comment')),
  likeable_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, likeable_id, likeable_type)
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  description TEXT,
  icon_url TEXT,
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_topics (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, topic_id)
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (if any)
-- =============================================================================

DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can create profile" ON users;

DROP POLICY IF EXISTS "Articles viewable by everyone or author" ON articles;
DROP POLICY IF EXISTS "Users can create own articles" ON articles;
DROP POLICY IF EXISTS "Users can update own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON articles;

DROP POLICY IF EXISTS "Books viewable by everyone or author" ON books;
DROP POLICY IF EXISTS "Users can create own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

DROP POLICY IF EXISTS "Book chapters follow book visibility" ON book_chapters;
DROP POLICY IF EXISTS "Book authors can create chapters" ON book_chapters;
DROP POLICY IF EXISTS "Book authors can update chapters" ON book_chapters;
DROP POLICY IF EXISTS "Book authors can delete chapters" ON book_chapters;

DROP POLICY IF EXISTS "Scraps are viewable by everyone" ON scraps;
DROP POLICY IF EXISTS "Users can create own scraps" ON scraps;
DROP POLICY IF EXISTS "Users can update own scraps" ON scraps;
DROP POLICY IF EXISTS "Users can delete own scraps" ON scraps;

DROP POLICY IF EXISTS "Article comments are viewable by everyone" ON article_comments;
DROP POLICY IF EXISTS "Scrap comments are viewable by everyone" ON scrap_comments;
DROP POLICY IF EXISTS "Authenticated users can create article comments" ON article_comments;
DROP POLICY IF EXISTS "Authenticated users can create scrap comments" ON scrap_comments;
DROP POLICY IF EXISTS "Users can update own article comments" ON article_comments;
DROP POLICY IF EXISTS "Users can update own scrap comments" ON scrap_comments;
DROP POLICY IF EXISTS "Users can delete own article comments" ON article_comments;
DROP POLICY IF EXISTS "Users can delete own scrap comments" ON scrap_comments;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON likes;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON follows;

DROP POLICY IF EXISTS "Topics are viewable by everyone" ON topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON topics;

DROP POLICY IF EXISTS "Article topics are viewable by everyone" ON article_topics;
DROP POLICY IF EXISTS "Article authors can manage article topics" ON article_topics;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- USERS
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can create profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- ARTICLES
CREATE POLICY "Articles viewable by everyone or author" ON articles
  FOR SELECT USING (published = true OR user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own articles" ON articles
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- BOOKS
CREATE POLICY "Books viewable by everyone or author" ON books
  FOR SELECT USING (published = true OR user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own books" ON books
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- BOOK CHAPTERS
CREATE POLICY "Book chapters follow book visibility" ON book_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND (published = true OR user_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Book authors can create chapters" ON book_chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Book authors can update chapters" ON book_chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Book authors can delete chapters" ON book_chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()::text
    )
  );

-- SCRAPS
CREATE POLICY "Scraps are viewable by everyone" ON scraps
  FOR SELECT USING (true);

CREATE POLICY "Users can create own scraps" ON scraps
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own scraps" ON scraps
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own scraps" ON scraps
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- COMMENTS
CREATE POLICY "Article comments are viewable by everyone" ON article_comments
  FOR SELECT USING (true);

CREATE POLICY "Scrap comments are viewable by everyone" ON scrap_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create article comments" ON article_comments
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Authenticated users can create scrap comments" ON scrap_comments
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own article comments" ON article_comments
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own scrap comments" ON scrap_comments
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own article comments" ON article_comments
  FOR DELETE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own scrap comments" ON scrap_comments
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- LIKES
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON likes
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can remove own likes" ON likes
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- FOLLOWS
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (follower_id::text = auth.uid()::text);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (follower_id::text = auth.uid()::text);

-- TOPICS
CREATE POLICY "Topics are viewable by everyone" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON topics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ARTICLE TOPICS
CREATE POLICY "Article topics are viewable by everyone" ON article_topics
  FOR SELECT USING (true);

CREATE POLICY "Article authors can manage article topics" ON article_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_id 
      AND user_id::text = auth.uid()::text
    )
  );

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_scraps_user_id ON scraps(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_likeable ON likes(likeable_id, likeable_type);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- =============================================================================
-- CREATE FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_chapters_updated_at BEFORE UPDATE ON book_chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scraps_updated_at BEFORE UPDATE ON scraps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scrap_comments_updated_at BEFORE UPDATE ON scrap_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CREATE VIEWS (for better data fetching)
-- =============================================================================

CREATE OR REPLACE VIEW trending_articles AS
SELECT 
  a.*,
  u.username,
  u.display_name,
  u.avatar_url
FROM articles a
JOIN users u ON a.user_id = u.id
WHERE a.published = true
ORDER BY a.likes_count DESC, a.created_at DESC;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Log setup completion
SELECT 'Supabase setup completed successfully! 🎉' as status;