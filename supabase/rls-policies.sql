-- RLS ポリシーの設定

-- RLS を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブル のポリシー
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- 記事テーブル のポリシー
CREATE POLICY "Published articles are viewable by everyone" ON articles FOR SELECT USING (published = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own articles" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON articles FOR DELETE USING (auth.uid() = user_id);

-- トピックテーブル のポリシー
CREATE POLICY "Topics are viewable by everyone" ON topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert topics" ON topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 記事トピック関連テーブル のポリシー
CREATE POLICY "Article topics are viewable by everyone" ON article_topics FOR SELECT USING (true);
CREATE POLICY "Users can manage own article topics" ON article_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM articles WHERE articles.id = article_topics.article_id AND articles.user_id = auth.uid())
);

-- 本テーブル のポリシー
CREATE POLICY "Published books are viewable by everyone" ON books FOR SELECT USING (published = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own books" ON books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON books FOR DELETE USING (auth.uid() = user_id);

-- スクラップテーブル のポリシー
CREATE POLICY "Public scraps are viewable by everyone" ON scraps FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own scraps" ON scraps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scraps" ON scraps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scraps" ON scraps FOR DELETE USING (auth.uid() = user_id);

-- いいねテーブル のポリシー
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- コメントテーブル のポリシー
CREATE POLICY "Comments are viewable by everyone" ON article_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON article_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON article_comments FOR DELETE USING (auth.uid() = user_id);

-- フォロー関係テーブル のポリシー
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 通知テーブル のポリシー
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);