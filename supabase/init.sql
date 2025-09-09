-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '📝',
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- トピックテーブル
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事トピック関連テーブル
CREATE TABLE IF NOT EXISTS article_topics (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, topic_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 書籍テーブル
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  cover_url TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 書籍チャプターテーブル
CREATE TABLE IF NOT EXISTS book_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, slug)
);

-- スクラップテーブル
CREATE TABLE IF NOT EXISTS scraps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_closed BOOLEAN DEFAULT false,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- スクラップコメントテーブル
CREATE TABLE IF NOT EXISTS scrap_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrap_id UUID REFERENCES scraps(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment', 'scrap')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- フォローテーブル
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- セッションテーブル（認証用）
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_scraps_author ON scraps(author_id);
CREATE INDEX IF NOT EXISTS idx_scraps_slug ON scraps(slug);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Row Level Security (RLS) の有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（基本的なもの）

-- Users: 誰でも閲覧可能
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Users: 自分のプロフィールは編集可能
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Articles: 公開記事は誰でも閲覧可能
CREATE POLICY "Published articles are viewable by everyone" ON articles
  FOR SELECT USING (is_published = true);

-- Articles: 認証ユーザーは記事を作成可能
CREATE POLICY "Authenticated users can create articles" ON articles
  FOR INSERT WITH CHECK (true);

-- Articles: 自分の記事は編集・削除可能
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (auth.uid()::text = author_id::text);

-- Comments: 誰でも閲覧可能
CREATE POLICY "Comments are viewable by everyone" ON article_comments
  FOR SELECT USING (true);

-- Comments: 認証ユーザーはコメント可能
CREATE POLICY "Authenticated users can comment" ON article_comments
  FOR INSERT WITH CHECK (true);

-- Likes: 誰でも閲覧可能
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- Likes: 認証ユーザーはいいね可能
CREATE POLICY "Authenticated users can like" ON likes
  FOR INSERT WITH CHECK (true);

-- Likes: 自分のいいねは削除可能
CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- サンプルデータの挿入（オプション）

-- テストユーザー
INSERT INTO users (email, username, display_name, bio) VALUES
  ('test@example.com', 'testuser', 'テストユーザー', 'テストアカウントです'),
  ('demo@example.com', 'demouser', 'デモユーザー', 'デモンストレーション用アカウント')
ON CONFLICT (email) DO NOTHING;

-- サンプルトピック
INSERT INTO topics (name, slug, description) VALUES
  ('React', 'react', 'Reactに関する記事'),
  ('Next.js', 'nextjs', 'Next.jsに関する記事'),
  ('TypeScript', 'typescript', 'TypeScriptに関する記事'),
  ('Supabase', 'supabase', 'Supabaseに関する記事'),
  ('Web開発', 'web-dev', 'Web開発全般に関する記事')
ON CONFLICT (name) DO NOTHING;

-- RPC関数: いいね数のインクリメント/デクリメント
CREATE OR REPLACE FUNCTION increment_likes_count(table_name TEXT, row_id UUID, increment_by INTEGER)
RETURNS void AS $$
BEGIN
  CASE table_name
    WHEN 'articles' THEN
      UPDATE articles SET likes_count = likes_count + increment_by WHERE id = row_id;
    WHEN 'books' THEN
      UPDATE books SET likes_count = likes_count + increment_by WHERE id = row_id;
    WHEN 'scraps' THEN
      UPDATE scraps SET likes_count = likes_count + increment_by WHERE id = row_id;
    WHEN 'article_comments' THEN
      UPDATE article_comments SET likes_count = likes_count + increment_by WHERE id = row_id;
    ELSE
      RAISE EXCEPTION 'Invalid table name: %', table_name;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;