# Zenn Clone API仕様書 v1.0

## 目次
1. [概要](#概要)
2. [基本設計](#基本設計)
3. [認証・認可](#認証認可)
4. [エラーハンドリング](#エラーハンドリング)
5. [ページネーション](#ページネーション)
6. [フィルタリング・ソート](#フィルタリングソート)
7. [レート制限](#レート制限)
8. [APIエンドポイント詳細](#apiエンドポイント詳細)

## 概要

### APIバージョン
- **バージョン**: v1
- **ベースURL**: `https://api.zenn-clone.dev/v1`
- **プロトコル**: HTTPS

### 設計原則
- RESTful設計原則に準拠
- JSONベースの通信
- UTF-8エンコーディング
- ISO 8601形式の日時表現

## 基本設計

### HTTPメソッド
| メソッド | 用途 |
|---------|------|
| GET | リソースの取得 |
| POST | リソースの作成 |
| PUT | リソースの完全更新 |
| PATCH | リソースの部分更新 |
| DELETE | リソースの削除 |

### ステータスコード
| コード | 意味 |
|--------|------|
| 200 | OK - 正常終了 |
| 201 | Created - リソース作成成功 |
| 204 | No Content - 正常終了（レスポンスボディなし） |
| 400 | Bad Request - リクエスト不正 |
| 401 | Unauthorized - 認証エラー |
| 403 | Forbidden - 権限エラー |
| 404 | Not Found - リソース未発見 |
| 409 | Conflict - 競合エラー |
| 422 | Unprocessable Entity - バリデーションエラー |
| 429 | Too Many Requests - レート制限超過 |
| 500 | Internal Server Error - サーバーエラー |

### レスポンス形式

#### 成功レスポンス
```json
{
  "success": true,
  "data": {
    // リソースデータ
  },
  "meta": {
    "timestamp": "2025-09-05T12:00:00Z",
    "version": "1.0"
  }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {
      // エラー詳細情報
    }
  },
  "meta": {
    "timestamp": "2025-09-05T12:00:00Z",
    "version": "1.0"
  }
}
```

## 認証・認可

### 認証方式
- **Bearer Token** (JWT)
- **OAuth 2.0** (GitHub, Google)

### 認証ヘッダー
```
Authorization: Bearer {token}
```

### トークン仕様
- **アルゴリズム**: RS256
- **有効期限**: アクセストークン 1時間、リフレッシュトークン 30日
- **ペイロード**:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## エラーハンドリング

### エラーコード体系
| コード | 説明 |
|--------|------|
| AUTH_001 | 認証トークンが無効 |
| AUTH_002 | 認証トークンの有効期限切れ |
| AUTH_003 | 権限不足 |
| VAL_001 | 必須パラメータ不足 |
| VAL_002 | パラメータ形式不正 |
| VAL_003 | 文字数制限超過 |
| RES_001 | リソースが見つからない |
| RES_002 | リソースが既に存在 |
| RATE_001 | レート制限超過 |
| SYS_001 | システムエラー |

## ページネーション

### クエリパラメータ
- `page`: ページ番号（デフォルト: 1）
- `per_page`: 1ページあたりの件数（デフォルト: 20、最大: 100）
- `cursor`: カーソルベースページネーション用

### レスポンス形式
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "prev_cursor": null
  }
}
```

## フィルタリング・ソート

### フィルタリング
```
GET /articles?status=published&type=tech&tags=react,typescript
```

### ソート
```
GET /articles?sort=created_at:desc,likes_count:desc
```

### 検索
```
GET /articles?q=Next.js&search_fields=title,content
```

## レート制限

### 制限値
| エンドポイント | 認証なし | 認証あり |
|---------------|---------|---------|
| 読み取り | 100/分 | 1000/分 |
| 作成・更新 | - | 60/分 |
| 削除 | - | 30/分 |
| 検索 | 30/分 | 300/分 |

### レート制限ヘッダー
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## APIエンドポイント詳細

### 1. 認証 (Auth)

#### ユーザー登録
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecureP@ss123",
  "displayName": "John Doe"
}
```

#### ログイン
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### トークンリフレッシュ
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "..."
}
```

#### ログアウト
```http
POST /auth/logout
Authorization: Bearer {token}
```

### 2. ユーザー (Users)

#### ユーザー一覧取得
```http
GET /users?page=1&per_page=20&sort=followers_count:desc
```

#### ユーザー詳細取得
```http
GET /users/{username}
```

#### 現在のユーザー取得
```http
GET /users/me
Authorization: Bearer {token}
```

#### ユーザー更新
```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "新しい名前",
  "bio": "プロフィール文",
  "avatarUrl": "https://..."
}
```

#### フォロー
```http
POST /users/{username}/follow
Authorization: Bearer {token}
```

#### フォロー解除
```http
DELETE /users/{username}/follow
Authorization: Bearer {token}
```

#### フォロワー一覧
```http
GET /users/{username}/followers?page=1&per_page=20
```

#### フォロー中一覧
```http
GET /users/{username}/following?page=1&per_page=20
```

### 3. 記事 (Articles)

#### 記事一覧取得
```http
GET /articles?status=published&type=tech&tags=react&sort=created_at:desc&page=1&per_page=20
```

#### トレンド記事取得
```http
GET /articles/trending?period=weekly&limit=10
```

#### 記事詳細取得
```http
GET /articles/{slug}
```

#### 記事作成
```http
POST /articles
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "記事タイトル",
  "emoji": "📝",
  "type": "tech",
  "topics": ["React", "TypeScript"],
  "content": "記事本文...",
  "published": true
}
```

#### 記事更新
```http
PATCH /articles/{slug}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "更新後のタイトル",
  "content": "更新後の本文"
}
```

#### 記事削除
```http
DELETE /articles/{slug}
Authorization: Bearer {token}
```

#### 記事いいね
```http
POST /articles/{slug}/like
Authorization: Bearer {token}
```

#### いいね解除
```http
DELETE /articles/{slug}/like
Authorization: Bearer {token}
```

#### ブックマーク追加
```http
POST /articles/{slug}/bookmark
Authorization: Bearer {token}
Content-Type: application/json

{
  "folder_id": "folder_uuid",
  "note": "メモ"
}
```

#### ブックマーク削除
```http
DELETE /articles/{slug}/bookmark
Authorization: Bearer {token}
```

### 4. 書籍 (Books)

#### 書籍一覧取得
```http
GET /books?status=published&is_free=true&sort=created_at:desc&page=1&per_page=20
```

#### 書籍詳細取得
```http
GET /books/{slug}
```

#### 書籍作成
```http
POST /books
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "書籍タイトル",
  "description": "書籍の説明",
  "emoji": "📚",
  "price": 0,
  "is_free": true
}
```

#### 書籍更新
```http
PATCH /books/{slug}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "更新後のタイトル",
  "description": "更新後の説明"
}
```

#### 書籍削除
```http
DELETE /books/{slug}
Authorization: Bearer {token}
```

#### チャプター一覧取得
```http
GET /books/{slug}/chapters
```

#### チャプター詳細取得
```http
GET /books/{slug}/chapters/{chapter_number}
```

#### チャプター作成
```http
POST /books/{slug}/chapters
Authorization: Bearer {token}
Content-Type: application/json

{
  "number": 1,
  "title": "第1章",
  "content": "章の内容...",
  "is_free": false
}
```

#### チャプター更新
```http
PATCH /books/{slug}/chapters/{chapter_number}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "更新後のタイトル",
  "content": "更新後の内容"
}
```

#### チャプター削除
```http
DELETE /books/{slug}/chapters/{chapter_number}
Authorization: Bearer {token}
```

### 5. スクラップ (Scraps)

#### スクラップ一覧取得
```http
GET /scraps?is_public=true&sort=updated_at:desc&page=1&per_page=20
```

#### スクラップ詳細取得
```http
GET /scraps/{id}
```

#### スクラップ作成
```http
POST /scraps
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "スクラップタイトル",
  "emoji": "📌",
  "is_public": true,
  "allow_comments": true
}
```

#### スクラップ更新
```http
PATCH /scraps/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "更新後のタイトル",
  "is_public": false
}
```

#### スクラップ削除
```http
DELETE /scraps/{id}
Authorization: Bearer {token}
```

#### スクラップ投稿一覧取得
```http
GET /scraps/{id}/posts?page=1&per_page=20
```

#### スクラップ投稿作成
```http
POST /scraps/{id}/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "投稿内容..."
}
```

#### スクラップ投稿更新
```http
PATCH /scraps/{id}/posts/{post_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "更新後の内容"
}
```

#### スクラップ投稿削除
```http
DELETE /scraps/{id}/posts/{post_id}
Authorization: Bearer {token}
```

### 6. コメント (Comments)

#### コメント一覧取得
```http
GET /articles/{slug}/comments?sort=created_at:desc&page=1&per_page=20
GET /books/{slug}/comments?sort=created_at:desc&page=1&per_page=20
GET /scraps/{id}/comments?sort=created_at:desc&page=1&per_page=20
```

#### コメント作成
```http
POST /articles/{slug}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "コメント内容",
  "parent_id": null
}
```

#### コメント更新
```http
PATCH /comments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "更新後のコメント"
}
```

#### コメント削除
```http
DELETE /comments/{id}
Authorization: Bearer {token}
```

#### コメントいいね
```http
POST /comments/{id}/like
Authorization: Bearer {token}
```

### 7. タグ (Tags)

#### タグ一覧取得
```http
GET /tags?is_popular=true&category=frontend&sort=articles_count:desc&page=1&per_page=50
```

#### タグ詳細取得
```http
GET /tags/{slug}
```

#### タグフォロー
```http
POST /tags/{slug}/follow
Authorization: Bearer {token}
```

#### タグフォロー解除
```http
DELETE /tags/{slug}/follow
Authorization: Bearer {token}
```

#### タグ関連記事取得
```http
GET /tags/{slug}/articles?page=1&per_page=20
```

### 8. 検索 (Search)

#### 統合検索
```http
GET /search?q=Next.js&type=all&sort=relevance&page=1&per_page=20
```

#### 記事検索
```http
GET /search/articles?q=React&tags=typescript&author=johndoe&date_from=2025-01-01&date_to=2025-12-31&sort=relevance&page=1&per_page=20
```

#### ユーザー検索
```http
GET /search/users?q=john&sort=followers_count:desc&page=1&per_page=20
```

#### タグ検索
```http
GET /search/tags?q=java&sort=articles_count:desc&limit=10
```

#### 検索候補取得
```http
GET /search/suggestions?q=reac&limit=5
```

### 9. 通知 (Notifications)

#### 通知一覧取得
```http
GET /notifications?is_read=false&type=comment&sort=created_at:desc&page=1&per_page=20
Authorization: Bearer {token}
```

#### 未読数取得
```http
GET /notifications/unread_count
Authorization: Bearer {token}
```

#### 通知既読化
```http
PATCH /notifications/{id}/read
Authorization: Bearer {token}
```

#### 全通知既読化
```http
POST /notifications/read_all
Authorization: Bearer {token}
```

#### 通知削除
```http
DELETE /notifications/{id}
Authorization: Bearer {token}
```

### 10. ブックマーク (Bookmarks)

#### ブックマーク一覧取得
```http
GET /bookmarks?folder_id={id}&type=article&sort=created_at:desc&page=1&per_page=20
Authorization: Bearer {token}
```

#### ブックマークフォルダ一覧取得
```http
GET /bookmarks/folders
Authorization: Bearer {token}
```

#### ブックマークフォルダ作成
```http
POST /bookmarks/folders
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "フォルダ名",
  "description": "説明",
  "emoji": "📁",
  "color": "#3B82F6",
  "is_public": false
}
```

#### ブックマークフォルダ更新
```http
PATCH /bookmarks/folders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "新しいフォルダ名",
  "is_public": true
}
```

#### ブックマークフォルダ削除
```http
DELETE /bookmarks/folders/{id}
Authorization: Bearer {token}
```

### 11. ファイルアップロード (Upload)

#### 画像アップロード
```http
POST /upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": (binary),
  "type": "avatar|cover|content"
}
```

レスポンス:
```json
{
  "url": "https://cdn.zenn-clone.dev/images/...",
  "thumbnail_url": "https://cdn.zenn-clone.dev/images/thumb/...",
  "size": 1024000,
  "mime_type": "image/jpeg",
  "width": 1920,
  "height": 1080
}
```

### 12. 統計・分析 (Analytics)

#### ユーザー統計取得
```http
GET /users/{username}/stats
```

レスポンス:
```json
{
  "articles_count": 50,
  "books_count": 3,
  "scraps_count": 20,
  "total_views": 10000,
  "total_likes": 500,
  "followers_count": 150,
  "following_count": 80
}
```

#### 記事統計取得
```http
GET /articles/{slug}/stats
Authorization: Bearer {token}
```

レスポンス:
```json
{
  "views": 5000,
  "unique_views": 3000,
  "likes": 150,
  "comments": 30,
  "bookmarks": 75,
  "read_time_avg": 180,
  "bounce_rate": 0.3
}
```

#### トレンド分析取得
```http
GET /analytics/trends?entity_type=tag&period=weekly&limit=10
```

### 13. 設定 (Settings)

#### ユーザー設定取得
```http
GET /settings
Authorization: Bearer {token}
```

#### ユーザー設定更新
```http
PATCH /settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "email_notification_enabled": true,
  "theme": "dark",
  "default_editor": "markdown",
  "auto_save_draft": true
}
```

#### APIキー一覧取得
```http
GET /settings/api_keys
Authorization: Bearer {token}
```

#### APIキー作成
```http
POST /settings/api_keys
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": ["read:articles", "write:articles"],
  "expires_at": "2026-01-01T00:00:00Z"
}
```

#### APIキー削除
```http
DELETE /settings/api_keys/{id}
Authorization: Bearer {token}
```

## WebSocket API

### 接続
```javascript
const ws = new WebSocket('wss://api.zenn-clone.dev/ws');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'Bearer ...'
}));
```

### イベント購読
```javascript
// 記事のリアルタイム更新を購読
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'article:slug123',
  events: ['comment', 'like']
}));
```

### イベント受信
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // {
  //   type: 'event',
  //   channel: 'article:slug123',
  //   event: 'comment',
  //   data: { ... }
  // }
};
```

## GraphQL API (将来実装予定)

### エンドポイント
```
POST /graphql
```

### クエリ例
```graphql
query GetArticleWithAuthor($slug: String!) {
  article(slug: $slug) {
    id
    title
    content
    author {
      username
      displayName
      avatarUrl
    }
    comments(first: 10) {
      edges {
        node {
          id
          content
          author {
            username
          }
        }
      }
    }
  }
}
```

## SDKサポート

### JavaScript/TypeScript
```typescript
import { ZennClient } from '@zenn-clone/sdk';

const client = new ZennClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.zenn-clone.dev/v1'
});

// 記事取得
const articles = await client.articles.list({
  status: 'published',
  page: 1,
  perPage: 20
});
```

## 変更履歴

### v1.0.0 (2025-09-05)
- 初回リリース
- 基本的なCRUD操作
- 認証・認可システム
- ページネーション・フィルタリング
- WebSocket対応

### 今後の予定
- GraphQL API
- 管理者用API
- 分析API拡充
- Webhook対応
- バッチAPI

---

*このAPI仕様書は継続的に更新されます。最新の情報はGitHubリポジトリを参照してください。*