# 🚀 Zenn Clone - エンジニア向け知識共有プラットフォーム

Zenn.devのクローンアプリケーションです。Next.js 14 + TypeScriptを使用して構築されており、エンジニア向けの記事・書籍・スクラップ共有機能を提供します。

## ✨ 主要機能

### 🔐 認証システム
- **2つの認証システム**: AuthContextとEnhancedAuthProviderの統合
- **3つのユーザータイプ**: 一般ユーザー、Proユーザー、管理者
- **ダミーログイン**: 開発・デモ用の簡単ログイン機能
- **セッション管理**: LocalStorage基盤の認証状態管理

### 📝 コンテンツ機能
- **記事 (Articles)**: テクニカル記事とアイデア記事の投稿・管理
- **書籍 (Books)**: 有料/無料の電子書籍
- **スクラップ (Scraps)**: ディスカッション形式の短文投稿
- **求人 (Jobs)**: エンジニア向け求人情報
- **相談 (Consultations)**: エキスパート相談サービス

### 🎯 ダッシュボード機能
- **統合ダッシュボード**: 記事、書籍、スクラップの一元管理
- **リアルタイム統計**: 閲覧数、いいね、コメント数の表示
- **収益管理**: 有料コンテンツの収益追跡
- **分析機能**: コンテンツパフォーマンスの可視化

### ⚙️ 設定システム
- **プロフィール設定**: アバター、自己紹介、ソーシャルリンク
- **アカウント設定**: パスワード変更、2要素認証、セッション管理
- **通知設定**: メール、プッシュ、デスクトップ通知の管理
- **表示設定**: テーマ、フォントサイズ、コードブロックのカスタマイズ
- **プライバシー設定**: プロフィール公開範囲、データ管理
- **外部連携**: GitHub、Twitter、Slack連携、Webhook、API管理
- **収益設定**: 支払い方法、税務情報、出金管理

### 🤖 AI機能
- **AIアシスタント**: スマートな記事推薦とコンテンツ提案
- **個別最適化**: ユーザー行動に基づくパーソナライゼーション

## 🛠 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Styling**: CSS Modules + BEM命名規則
- **State Management**: React Context API + カスタムフック
- **Authentication**: Supabase Auth + デュアル認証システム
- **UI/UX**: レスポンシブデザイン、ダークモード対応準備

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Git
- Supabaseアカウント

### ⚠️ 重要：環境変数の設定

**アプリケーションを起動する前に、必ず環境変数を設定してください。**

1. **`.env.local`ファイルを作成**:
```bash
cp .env.example .env.local
```

2. **Supabaseプロジェクトを作成し、以下の値を取得**:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-secret-key
```

3. **セットアップガイドを確認**: `/setup`ページで詳細な手順を確認できます。

### インストールと起動

```bash
# リポジトリのクローン
git clone https://github.com/kazujp225/ZENN.git
cd ZENN/zenn-clone

# 依存関係のインストール
npm install

# 環境変数を設定（上記参照）

# 開発サーバーの起動
npm run dev

# ブラウザで開く
# http://localhost:3000
```

**環境変数が未設定の場合**: `/setup`ページにアクセスして設定手順を確認してください。

### ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# 型チェック
npm run type-check

# Linting
npm run lint
```

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: `#2563eb` (ブルー)
- **成功**: `#10b981` (グリーン)
- **警告**: `#f59e0b` (オレンジ)
- **エラー**: `#dc2626` (レッド)
- **テキスト**: `#0f172a` (ダークグレー)
- **ボーダー**: `#e5e7eb` (ライトグレー)
- **背景**: `#f8fafc` (オフホワイト)

### レスポンシブブレイクポイント
- **モバイル**: `< 768px`
- **タブレット**: `768px - 1024px`
- **デスクトップ**: `> 1024px`

## 🔑 ログイン方法

### テスト用ログイン

テストログインページ: `/test-login`

任意のメールアドレスとパスワードでログイン可能です。

### ダミーアカウント

#### 一般ユーザー 👤
- **Email**: `user@example.com`
- **Password**: `password`

#### Proユーザー ⭐
- **Email**: `pro@example.com`
- **Password**: `password`

#### 管理者 🔧
- **Email**: `admin@example.com`
- **Password**: `password`

## 📁 プロジェクト構造

```
zenn-clone/
├── public/                 # 静的ファイル
│   └── images/            # 画像アセット
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── [username]/    # 動的ユーザーページ
│   │   ├── articles/      # 記事関連ページ
│   │   ├── books/         # 書籍関連ページ
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── settings/      # 設定ページ群
│   │   │   ├── layout.tsx # 設定共通レイアウト
│   │   │   ├── profile/   # プロフィール設定
│   │   │   ├── account/   # アカウント設定
│   │   │   ├── notifications/ # 通知設定
│   │   │   ├── appearance/    # 表示設定
│   │   │   ├── privacy/       # プライバシー設定
│   │   │   ├── integrations/  # 連携設定
│   │   │   └── revenue/       # 収益設定
│   │   ├── login/         # 認証ページ
│   │   └── ...           # その他のページ
│   ├── components/        # React コンポーネント
│   │   ├── ai/           # AIアシスタント
│   │   ├── auth/         # 認証関連
│   │   ├── cards/        # カードコンポーネント
│   │   ├── common/       # 共通コンポーネント
│   │   ├── features/     # 機能別コンポーネント
│   │   └── ui/           # UIコンポーネント
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx # 認証コンテキスト
│   ├── hooks/            # カスタムフック
│   │   └── useEnhancedAuth.tsx # 拡張認証フック
│   ├── utils/            # ユーティリティ関数
│   │   └── articleStore.ts # 記事データ管理
│   └── styles/           # CSS Modules
│       ├── components/   # コンポーネントスタイル
│       ├── pages/        # ページスタイル
│       └── globals.css   # グローバルスタイル
├── .gitignore            # Git無視ファイル
├── next.config.js        # Next.js設定
├── package.json          # プロジェクト設定
├── README.md             # このファイル
└── tsconfig.json         # TypeScript設定
```

## 🎯 主要コンポーネント

### 認証コンポーネント
- `AuthProvider` - 認証コンテキストプロバイダー
- `UserDropdown` - ユーザーメニュードロップダウン
- `AuthButtons` - ログイン/サインアップボタン

### ダッシュボードコンポーネント
- `DashboardPage` - 統合ダッシュボード
- `ArticleManagement` - 記事管理
- `StatsCards` - 統計カード
- `RevenueChart` - 収益グラフ

### 設定コンポーネント
- `SettingsLayout` - 設定ページ共通レイアウト
- `ProfileSettings` - プロフィール設定
- `NotificationSettings` - 通知設定
- `PrivacySettings` - プライバシー設定

### AI機能
- `AIAssistant` - AIアシスタントウィジェット
- `AIRecommendations` - AI推薦エンジン

## 📱 レスポンシブ対応

- **Mobile First**: モバイル優先設計
- **Flexible Grid**: CSS GridとFlexboxの活用
- **Adaptive Typography**: デバイスに応じた文字サイズ
- **Touch Friendly**: タッチデバイス最適化
- **Hamburger Menu**: モバイル用ハンバーガーメニュー

## 🎨 UI/UX特徴

### アニメーション
- **スムーススクロール**: ページ内リンク
- **ホバー効果**: カードとボタンのインタラクション
- **フェードイン**: コンテンツ表示アニメーション
- **ローディング状態**: スケルトンスクリーンとスピナー

### アクセシビリティ
- **キーボードナビゲーション**: 完全対応
- **スクリーンリーダー**: ARIA属性付与
- **コントラスト**: WCAG 2.2 AA準拠
- **フォーカス管理**: 明確なフォーカス表示

## 🐛 既知の問題と解決策

### 認証システム
- **問題**: 2つの認証システムが混在
- **解決**: AuthContextがEnhancedAuthのLocalStorageキーも読み取るように対応済み

### z-index問題
- **問題**: ドロップダウンメニューが他の要素の下に隠れる
- **解決**: z-index階層を適切に設定（9999）

## 🚀 デプロイ

### Vercel (推奨)
```bash
npm i -g vercel
vercel --prod
```

### その他のプラットフォーム
- **Netlify**: `npm run build` → `out/` フォルダをデプロイ
- **AWS Amplify**: Git連携で自動デプロイ
- **GitHub Pages**: Static Export対応

## 📈 パフォーマンス

### 目標メトリクス
- **Lighthouse Score**: 90+
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### 最適化施策
- 画像の最適化 (Next.js Image)
- コード分割
- CSS最適化
- フォント最適化
- 遅延読み込み

## 🔄 今後の改善予定

- [ ] リアルタイムデータベース統合
- [ ] WebSocket通知システム
- [ ] ダークモード完全実装
- [ ] 国際化（i18n）対応
- [ ] PWA対応
- [ ] テスト自動化（Jest + React Testing Library）
- [ ] E2Eテスト（Playwright）
- [ ] CI/CDパイプライン構築

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは学習・デモ目的で作成されています。商用利用の際はご注意ください。

## 🙏 謝辞

- [Zenn.dev](https://zenn.dev) - オリジナルプラットフォームへのリスペクト
- [Next.js](https://nextjs.org) - 優れたReactフレームワーク
- [TypeScript](https://www.typescriptlang.org) - 型安全性の提供
- [Vercel](https://vercel.com) - ホスティングプラットフォーム

---

**開発者**: [@kazujp225](https://github.com/kazujp225)  
**リポジトリ**: https://github.com/kazujp225/ZENN.git  
**最終更新**: 2025年1月

## 📞 お問い合わせ

バグ報告や機能リクエストは [Issues](https://github.com/kazujp225/ZENN/issues) までお願いします。