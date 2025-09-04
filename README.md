# 🚀 Zenn Clone - エンジニア向け知識共有プラットフォーム

Zenn.devのクローンアプリケーションです。Next.js 15.5.2 + TypeScriptを使用して構築されており、エンジニア向けの記事・書籍・スクラップ共有機能を提供します。

## ✨ 主要機能

### 🔐 認証システム
- **3つのユーザータイプ**: 一般ユーザー、Proユーザー、管理者
- **ダミーログイン**: 開発・デモ用の簡単ログイン機能
- **ユーザープロフィール**: カスタマイズ可能なプロフィールページ

### 📝 コンテンツ機能
- **記事 (Articles)**: テクニカル記事とアイデア記事
- **書籍 (Books)**: 有料/無料の電子書籍
- **スクラップ (Scraps)**: ディスカッション形式の短文投稿
- **求人 (Jobs)**: エンジニア向け求人情報
- **相談 (Consultations)**: エキスパート相談サービス

### 🎯 ページ機能
- **パーソナライズホーム**: ログイン後の個別最適化ページ
- **Explore**: カテゴリ別コンテンツ探索
- **トレンディング**: 人気コンテンツ表示
- **プロフィール**: ユーザーページと投稿管理

## 🛠 技術スタック

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + BEM命名規則
- **State Management**: React Context API
- **Authentication**: カスタム認証システム
- **Icons**: 絵文字ベースのアイコンシステム

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### インストールと起動

```bash
# リポジトリのクローン
git clone https://github.com/kazujp225/ZENN.git
cd ZENN/zenn-clone

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで開く
# http://localhost:3000
```

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
- **テキスト**: `#0f172a` (ダークグレー) 
- **ボーダー**: `#e5e7eb` (ライトグレー)
- **背景**: `#f8fafc` (オフホワイト)

### レスポンシブブレイクポイント
- **モバイル**: `< 768px`
- **タブレット**: `768px - 1024px`
- **デスクトップ**: `> 1024px`

## 🔑 ダミーログイン認証情報

開発・デモ用の認証情報：

### 一般ユーザー 👤
- **Email**: `user@example.com`
- **Password**: `password`

### Proユーザー ⭐
- **Email**: `pro@example.com` 
- **Password**: `password`

### 管理者 🔧
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
│   │   ├── login/         # 認証ページ
│   │   └── ...           # その他のページ
│   ├── components/        # React コンポーネント
│   │   ├── cards/        # カードコンポーネント
│   │   ├── common/       # 共通コンポーネント
│   │   ├── features/     # 機能別コンポーネント
│   │   └── ui/           # UIコンポーネント
│   ├── contexts/         # React Context
│   ├── hooks/            # カスタムフック
│   └── styles/           # CSS Modules
│       ├── components/   # コンポーネントスタイル
│       ├── pages/        # ページスタイル
│       └── globals.css   # グローバルスタイル
├── .gitignore            # Git無視ファイル
├── next.config.js        # Next.js設定
├── package.json          # プロジェクト設定
└── tsconfig.json         # TypeScript設定
```

## 🎯 主要コンポーネント

### カードコンポーネント
- `ArticleCard` - 記事表示カード
- `BookCard` - 書籍表示カード
- `ScrapCard` - スクラップ表示カード
- `JobCard` - 求人表示カード

### 共通コンポーネント
- `Header` - レスポンシブヘッダー
- `Footer` - フッター
- `UserDropdown` - ユーザーメニュー
- `AuthButtons` - 認証ボタン

### 機能コンポーネント
- `PersonalizedHome` - 個人化ホームページ
- `ExploreContent` - 探索ページコンテンツ
- `TrendingSection` - トレンディングセクション

## 📱 レスポンシブ対応

- **Mobile First**: モバイル優先設計
- **Flexible Grid**: CSS GridとFlexboxの活用
- **Adaptive Typography**: デバイスに応じた文字サイズ
- **Touch Friendly**: タッチデバイス最適化

## 🎨 UI/UX特徴

### アニメーション
- **スムーススクロール**: ページ内リンク
- **ホバー効果**: カードとボタンのインタラクション
- **フェードイン**: コンテンツ表示アニメーション

### アクセシビリティ
- **キーボードナビゲーション**: 完全対応
- **スクリーンリーダー**: ARIA属性付与
- **コントラスト**: WCAG 2.2 AA準拠
- **フォーカス管理**: 明確なフォーカス表示

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

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは学習・デモ目的で作成されています。

## 🙏 謝辞

- [Zenn.dev](https://zenn.dev) - オリジナルプラットフォームへのリスペクト
- [Next.js](https://nextjs.org) - 優れたReactフレームワーク
- [TypeScript](https://www.typescriptlang.org) - 型安全性の提供

---

**開発者**: [@kazujp225](https://github.com/kazujp225)  
**リポジトリ**: https://github.com/kazujp225/ZENN.git  
**デモサイト**: http://localhost:3000 (ローカル環境)