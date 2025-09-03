import { ScrapLayout } from '@/components/scrap/ScrapLayout'

// サンプルデータ（実際はAPIから取得）
const getScrap = (id: string) => {
  return {
    id,
    title: 'Next.js 14でのSSGとISRの使い分けについて',
    emoji: '💭',
    author: {
      username: 'developer1',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg',
      bio: 'フロントエンドエンジニア。React/Next.jsを中心にWeb開発をしています。',
      followersCount: 1234
    },
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-16T15:30:00Z',
    isOpen: false,
    closedAt: '2025-01-16T15:30:00Z',
    likes: 45,
    topics: ['Next.js', 'SSG', 'ISR', 'パフォーマンス'],
    posts: [
      {
        id: '1',
        author: {
          username: 'developer1',
          name: '田中太郎',
          avatar: '/images/avatar-placeholder.svg',
          isOwner: true
        },
        content: `Next.js 14でSSGとISRをどう使い分けるか、実際のプロジェクトでの経験をもとに考察してみました。

## 背景
最近のプロジェクトで、コンテンツの更新頻度によってレンダリング手法を使い分ける必要がありました。

## SSGを使うべきケース
- 更新頻度が低いページ（会社概要、利用規約など）
- ビルド時にすべてのデータが確定しているページ
- SEOが重要で、初期表示速度を最優先したいページ

## ISRを使うべきケース
- 定期的に更新されるが、リアルタイム性は不要なページ
- ページ数が多く、すべてを事前ビルドするのが非現実的な場合
- キャッシュの恩恵を受けつつ、適度な鮮度を保ちたいページ

皆さんはどのような基準で使い分けていますか？`,
        publishedAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        likes: 23,
        isLiked: false
      },
      {
        id: '2',
        author: {
          username: 'nextjs_expert',
          name: '佐藤花子',
          avatar: '/images/avatar-placeholder.svg',
          isOwner: false
        },
        content: `興味深い考察ですね！私の場合は以下のような基準で使い分けています。

### 追加の観点

1. **コスト面**
   - SSG: ビルド時間のみコスト発生
   - ISR: リクエスト時にも再生成コストが発生

2. **データソースの可用性**
   - 外部APIの信頼性が低い場合はSSGで事前にキャッシュ
   - データベース直結できる場合はISRでも安定運用可能

3. **ユーザー体験**
   - B2Cサービス: ISRで鮮度重視
   - B2Bサービス: SSGで安定性重視

実際、ECサイトの商品ページではISR（revalidate: 60）を使用して、在庫情報の鮮度とパフォーマンスのバランスを取っています。`,
        publishedAt: '2025-01-15T11:30:00Z',
        updatedAt: '2025-01-15T11:30:00Z',
        likes: 18,
        isLiked: false
      },
      {
        id: '3',
        author: {
          username: 'developer1',
          name: '田中太郎',
          avatar: '/images/avatar-placeholder.svg',
          isOwner: true
        },
        content: `@nextjs_expert さん、詳細なフィードバックありがとうございます！

コスト面の観点は見落としていました。確かに大規模サイトだとISRの再生成コストも無視できないですね。

ECサイトでのrevalidate: 60の設定も参考になります。私たちのプロジェクトでは、ニュースサイトの記事ページでrevalidate: 300（5分）に設定していますが、もう少し短くしても良いかもしれません。

### 質問
ISRを使用する際、stale-while-revalidateのような挙動で古いキャッシュを返しながらバックグラウンドで更新する設定は可能でしょうか？`,
        publishedAt: '2025-01-15T14:00:00Z',
        updatedAt: '2025-01-15T14:00:00Z',
        likes: 12,
        isLiked: false
      },
      {
        id: '4',
        author: {
          username: 'web_performance_guru',
          name: '高橋健太',
          avatar: '/images/avatar-placeholder.svg',
          isOwner: false
        },
        content: `素晴らしいディスカッションですね！パフォーマンス観点から補足させてください。

## ISRのstale-while-revalidate的な挙動について

@developer1 さんの質問に答えると、Next.js 14のISRは実際にstale-while-revalidateに似た挙動をします。

\`\`\`typescript
export const revalidate = 60 // 60秒後に再検証

// この設定により：
// 1. 60秒以内のリクエスト → キャッシュから即座に返す
// 2. 60秒経過後の最初のリクエスト → 古いキャッシュを返しつつ、バックグラウンドで再生成
// 3. 再生成完了後 → 新しいキャッシュを使用
\`\`\`

## パフォーマンス測定の重要性

どの手法を選ぶにせよ、Core Web Vitalsの測定は必須です：
- **LCP (Largest Contentful Paint)**: SSGが圧倒的に有利
- **FID (First Input Delay)**: どちらも優秀
- **CLS (Cumulative Layout Shift)**: 実装次第

私のプロジェクトでは、ページタイプごとに最適な手法を選択した結果、LCPが平均1.2秒改善しました。`,
        publishedAt: '2025-01-16T09:00:00Z',
        updatedAt: '2025-01-16T09:00:00Z',
        likes: 31,
        isLiked: false
      }
    ]
  }
}

export default async function ScrapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scrap = getScrap(id)
  
  return <ScrapLayout scrap={scrap} />
}