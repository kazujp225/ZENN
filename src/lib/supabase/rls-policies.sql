-- =============================================================================
-- Row Level Security (RLS) ポリシー
-- このファイルをSupabase SQL Editorで実行してください
-- =============================================================================

-- RLSを有効化
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
-- USERS テーブルのポリシー
-- =============================================================================

-- ユーザーは誰でも閲覧可能（公開プロフィール）
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id::text);

-- 新規ユーザー作成は認証済みユーザーのみ
CREATE POLICY "Authenticated users can create profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id::text);

-- =============================================================================
-- ARTICLES テーブルのポリシー
-- =============================================================================

-- 公開記事は誰でも閲覧可能、下書きは作成者のみ
CREATE POLICY "Articles viewable by everyone or author" ON articles
  FOR SELECT USING (published = true OR user_id::text = auth.uid());

-- 認証済みユーザーは記事を作成可能（自分のIDで）
CREATE POLICY "Users can create own articles" ON articles
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

-- 作成者は自分の記事を更新可能
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (user_id::text = auth.uid());

-- 作成者は自分の記事を削除可能
CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (user_id::text = auth.uid());

-- =============================================================================
-- BOOKS テーブルのポリシー
-- =============================================================================

-- 公開書籍は誰でも閲覧可能、下書きは作成者のみ
CREATE POLICY "Books viewable by everyone or author" ON books
  FOR SELECT USING (published = true OR user_id::text = auth.uid());

-- 認証済みユーザーは書籍を作成可能
CREATE POLICY "Users can create own books" ON books
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

-- 作成者は自分の書籍を更新可能
CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (user_id::text = auth.uid());

-- 作成者は自分の書籍を削除可能
CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (user_id::text = auth.uid());

-- =============================================================================
-- BOOK_CHAPTERS テーブルのポリシー
-- =============================================================================

-- チャプターは書籍の公開状態に従う
CREATE POLICY "Book chapters follow book visibility" ON book_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND (published = true OR user_id::text = auth.uid())
    )
  );

-- 書籍作成者はチャプターを作成可能
CREATE POLICY "Book authors can create chapters" ON book_chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()
    )
  );

-- 書籍作成者はチャプターを更新可能
CREATE POLICY "Book authors can update chapters" ON book_chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()
    )
  );

-- 書籍作成者はチャプターを削除可能
CREATE POLICY "Book authors can delete chapters" ON book_chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE id = book_id 
      AND user_id::text = auth.uid()
    )
  );

-- =============================================================================
-- SCRAPS テーブルのポリシー
-- =============================================================================

-- スクラップは誰でも閲覧可能
CREATE POLICY "Scraps are viewable by everyone" ON scraps
  FOR SELECT USING (true);

-- 認証済みユーザーはスクラップを作成可能
CREATE POLICY "Users can create own scraps" ON scraps
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

-- 作成者は自分のスクラップを更新可能
CREATE POLICY "Users can update own scraps" ON scraps
  FOR UPDATE USING (user_id::text = auth.uid());

-- 作成者は自分のスクラップを削除可能
CREATE POLICY "Users can delete own scraps" ON scraps
  FOR DELETE USING (user_id::text = auth.uid());

-- =============================================================================
-- COMMENTS テーブルのポリシー（記事・スクラップ共通）
-- =============================================================================

-- コメントは誰でも閲覧可能
CREATE POLICY "Article comments are viewable by everyone" ON article_comments
  FOR SELECT USING (true);

CREATE POLICY "Scrap comments are viewable by everyone" ON scrap_comments
  FOR SELECT USING (true);

-- 認証済みユーザーはコメントを投稿可能
CREATE POLICY "Authenticated users can create article comments" ON article_comments
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

CREATE POLICY "Authenticated users can create scrap comments" ON scrap_comments
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

-- 作成者は自分のコメントを更新可能
CREATE POLICY "Users can update own article comments" ON article_comments
  FOR UPDATE USING (user_id::text = auth.uid());

CREATE POLICY "Users can update own scrap comments" ON scrap_comments
  FOR UPDATE USING (user_id::text = auth.uid());

-- 作成者は自分のコメントを削除可能
CREATE POLICY "Users can delete own article comments" ON article_comments
  FOR DELETE USING (user_id::text = auth.uid());

CREATE POLICY "Users can delete own scrap comments" ON scrap_comments
  FOR DELETE USING (user_id::text = auth.uid());

-- =============================================================================
-- LIKES テーブルのポリシー
-- =============================================================================

-- いいねは誰でも閲覧可能
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- 認証済みユーザーはいいねを追加可能
CREATE POLICY "Authenticated users can like" ON likes
  FOR INSERT WITH CHECK (user_id::text = auth.uid());

-- ユーザーは自分のいいねを取り消し可能
CREATE POLICY "Users can remove own likes" ON likes
  FOR DELETE USING (user_id::text = auth.uid());

-- =============================================================================
-- FOLLOWS テーブルのポリシー
-- =============================================================================

-- フォロー関係は誰でも閲覧可能
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

-- 認証済みユーザーは他のユーザーをフォロー可能
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (follower_id::text = auth.uid());

-- ユーザーは自分のフォローを解除可能
CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (follower_id::text = auth.uid());

-- =============================================================================
-- TOPICS テーブルのポリシー
-- =============================================================================

-- トピックは誰でも閲覧可能
CREATE POLICY "Topics are viewable by everyone" ON topics
  FOR SELECT USING (true);

-- 認証済みユーザーはトピックを作成可能（管理者機能として後で制限可能）
CREATE POLICY "Authenticated users can create topics" ON topics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- ARTICLE_TOPICS テーブルのポリシー（記事とトピックの関連）
-- =============================================================================

-- 記事・トピック関連は誰でも閲覧可能
CREATE POLICY "Article topics are viewable by everyone" ON article_topics
  FOR SELECT USING (true);

-- 記事作成者は自分の記事のトピック関連を管理可能
CREATE POLICY "Article authors can manage article topics" ON article_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_id 
      AND user_id::text = auth.uid()
    )
  );

-- =============================================================================
-- セキュリティ機能関数
-- =============================================================================

-- ユーザーがリソースの所有者かチェックする関数
CREATE OR REPLACE FUNCTION auth.is_owner(resource_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() = resource_user_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者権限チェック関数（将来の拡張用）
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  -- 現在は全員非管理者として扱う
  -- 必要に応じて管理者テーブルを作成してチェック
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;