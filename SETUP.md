# Zenn Clone セットアップガイド

## 必要な環境

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - Anon Key
   - Service Role Key

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# セッション設定
SESSION_SECRET=your-secret-key-here
```

### 3. データベースの初期化

Supabase SQL Editorで以下のSQLを実行：

```sql
-- ユーザーテーブル
CREATE TABLE users (
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
CREATE TABLE articles (
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
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事トピック関連テーブル
CREATE TABLE article_topics (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, topic_id)
);

-- コメントテーブル
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- いいねテーブル
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- フォローテーブル
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 通知テーブル
CREATE TABLE notifications (
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

-- インデックスの作成
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_article_comments_article ON article_comments(article_id);
CREATE INDEX idx_likes_target ON likes(target_id, target_type);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

### 4. Storage バケットの作成

Supabase Storage セクションで以下のバケットを作成：

1. `avatars` - ユーザーアバター用
2. `article-images` - 記事画像用
3. `book-covers` - 書籍カバー画像用

各バケットを公開（Public）に設定。

### 5. RLS (Row Level Security) の設定

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Articles policies  
CREATE POLICY "Published articles are viewable by everyone" ON articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON article_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON article_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON article_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON article_comments
  FOR DELETE USING (auth.uid() = author_id);
```

### 6. アプリケーションの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 7. 初回ユーザー登録

1. http://localhost:3000/signup にアクセス
2. メールアドレスとパスワードで登録
3. ログイン後、記事投稿が可能に

## トラブルシューティング

### 記事が投稿できない場合

1. 環境変数が正しく設定されているか確認
2. Supabaseのテーブルが作成されているか確認
3. RLSポリシーが正しく設定されているか確認
4. ブラウザのコンソールでエラーを確認

### データベース接続エラーの場合

1. Supabase URLとキーが正しいか確認
2. Supabaseプロジェクトが起動しているか確認
3. ネットワーク接続を確認

## サポート

問題が解決しない場合は、以下を確認してください：

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- プロジェクトのissueトラッカー