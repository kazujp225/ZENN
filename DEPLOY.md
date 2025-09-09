# デプロイガイド

## Vercelへのデプロイ手順

### 前提条件
- Vercelアカウント
- GitHubアカウント
- Supabaseプロジェクト

### 1. GitHubリポジトリの準備

```bash
# リポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit"

# GitHubリポジトリを作成してプッシュ
git remote add origin https://github.com/your-username/zenn-clone.git
git branch -M main
git push -u origin main
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`SETUP.md`のSQLを実行
3. Storageでバケットを作成
4. 環境変数をメモ：
   - Project URL
   - Anon Key
   - Service Role Key

### 3. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. "New Project"をクリック
3. GitHubリポジトリをインポート
4. Framework Preset: Next.js
5. Root Directory: `zenn-clone`（プロジェクトのルートディレクトリ）

### 4. 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-secret-key
```

### 5. デプロイ

1. "Deploy"ボタンをクリック
2. ビルドが完了するまで待機（約2-3分）
3. デプロイ完了後、URLが表示される

### 6. 動作確認

1. デプロイされたURLにアクセス
2. `/signup`でユーザー登録
3. `/new/article`で記事投稿テスト
4. 記事が表示されることを確認

## トラブルシューティング

### ビルドエラーが発生する場合

1. **環境変数の確認**
   ```bash
   # ローカルでビルド確認
   npm run build
   ```

2. **依存関係の確認**
   ```bash
   npm install
   npm audit fix
   ```

3. **TypeScriptエラーの確認**
   ```bash
   npm run typecheck
   ```

### 500エラーが発生する場合

1. **Supabase接続確認**
   - 環境変数が正しく設定されているか
   - Supabaseプロジェクトが起動しているか
   - テーブルが作成されているか

2. **ログの確認**
   - Vercel Functions タブでログを確認
   - ブラウザのコンソールエラーを確認

### データベースエラーの場合

1. **RLSポリシーの確認**
   ```sql
   -- RLSが有効になっているか確認
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. **テーブル構造の確認**
   ```sql
   -- テーブルが存在するか確認
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## 継続的デプロイ

GitHubにプッシュすると自動的にデプロイされます：

```bash
git add .
git commit -m "Update features"
git push origin main
```

## カスタムドメインの設定

1. Vercel > Settings > Domains
2. カスタムドメインを追加
3. DNSレコードを設定：
   - CNAME: `cname.vercel-dns.com`
   - または A レコード: `76.76.21.21`

## パフォーマンス最適化

1. **画像最適化**
   - Next.js Image コンポーネントを使用
   - WebP形式を優先

2. **キャッシュ設定**
   - `vercel.json`でキャッシュヘッダーを設定
   - 静的アセットのキャッシュ期間を延長

3. **Edge Functions**
   - 地理的に近いエッジロケーションで実行
   - レイテンシーを削減

## セキュリティ

1. **環境変数の保護**
   - Service Role Keyは絶対に公開しない
   - クライアント側では`NEXT_PUBLIC_`プレフィックス付きのみ使用

2. **CORS設定**
   - `vercel.json`でCORSヘッダーを適切に設定
   - 必要なオリジンのみ許可

3. **Rate Limiting**
   - Supabase側でRate Limitingを設定
   - Vercel側でもDDoS保護を有効化

## 監視とアラート

1. **Vercel Analytics**
   - パフォーマンスメトリクスを監視
   - Web Vitalsを追跡

2. **エラー監視**
   - Sentryなどのエラー監視ツールを統合
   - リアルタイムでエラーを検知

## サポート

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)