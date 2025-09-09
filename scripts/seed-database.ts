import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Create users
    console.log('Creating users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          username: 'takashi_dev',
          display_name: '田中たかし',
          email: 'takashi@example.com',
          bio: 'フルスタックエンジニア。React、Next.js、TypeScriptが得意です。',
          avatar_url: '/images/avatar-placeholder.svg',
          twitter_username: 'takashi_dev',
          github_username: 'takashi-dev',
          website_url: 'https://takashi.dev'
        },
        {
          username: 'yuki_engineer',
          display_name: '佐藤ゆき',
          email: 'yuki@example.com',
          bio: 'バックエンドエンジニア。Go、Rust、Kubernetesを勉強中。',
          avatar_url: '/images/avatar-placeholder.svg',
          twitter_username: 'yuki_eng',
          github_username: 'yuki-engineer'
        },
        {
          username: 'kenji_frontend',
          display_name: '山田けんじ',
          email: 'kenji@example.com',
          bio: 'フロントエンドエンジニア。UI/UXデザインも好きです。',
          avatar_url: '/images/avatar-placeholder.svg',
          github_username: 'kenji-frontend'
        },
        {
          username: 'ai_researcher',
          display_name: '鈴木あい',
          email: 'ai@example.com',
          bio: 'AI/ML研究者。PyTorch、TensorFlow、深層学習について発信。',
          avatar_url: '/images/avatar-placeholder.svg',
          twitter_username: 'ai_researcher'
        },
        {
          username: 'mobile_dev',
          display_name: '伊藤もばいる',
          email: 'mobile@example.com',
          bio: 'モバイルアプリ開発者。Flutter、React Native、Swift。',
          avatar_url: '/images/avatar-placeholder.svg'
        }
      ])
      .select()

    if (usersError) {
      console.error('Error creating users:', usersError)
      return
    }
    console.log(`✅ Created ${users.length} users`)

    // 2. Create topics (check for existing ones first)
    console.log('Creating topics...')
    const topicsToCreate = [
      { name: 'react', display_name: 'React' },
      { name: 'nextjs', display_name: 'Next.js' },
      { name: 'typescript', display_name: 'TypeScript' },
      { name: 'javascript', display_name: 'JavaScript' },
      { name: 'nodejs', display_name: 'Node.js' },
      { name: 'go', display_name: 'Go' },
      { name: 'rust', display_name: 'Rust' },
      { name: 'python', display_name: 'Python' },
      { name: 'docker', display_name: 'Docker' },
      { name: 'kubernetes', display_name: 'Kubernetes' },
      { name: 'aws', display_name: 'AWS' },
      { name: 'gcp', display_name: 'GCP' },
      { name: 'ai', display_name: 'AI' },
      { name: 'machinelearning', display_name: 'Machine Learning' },
      { name: 'flutter', display_name: 'Flutter' },
      { name: 'swift', display_name: 'Swift' },
      { name: 'testing', display_name: 'Testing' },
      { name: 'cicd', display_name: 'CI/CD' },
      { name: 'git', display_name: 'Git' },
      { name: 'database', display_name: 'Database' },
      { name: 'api', display_name: 'API' },
      { name: 'backend', display_name: 'Backend' },
      { name: 'frontend', display_name: 'Frontend' },
      { name: 'webdesign', display_name: 'Web Design' },
      { name: 'css', display_name: 'CSS' },
      { name: 'chatgpt', display_name: 'ChatGPT' },
      { name: 'productivity', display_name: 'Productivity' },
      { name: 'performance', display_name: 'Performance' },
      { name: 'devops', display_name: 'DevOps' },
      { name: 'mobile', display_name: 'Mobile' },
      { name: 'dart', display_name: 'Dart' }
    ]

    // Check existing topics
    const { data: existingTopics } = await supabase
      .from('topics')
      .select('name')
    
    const existingNames = new Set(existingTopics?.map(t => t.name) || [])
    const newTopics = topicsToCreate.filter(t => !existingNames.has(t.name))

    let topics = existingTopics || []
    if (newTopics.length > 0) {
      const { data: createdTopics, error: topicsError } = await supabase
        .from('topics')
        .insert(newTopics)
        .select()

      if (topicsError) {
        console.error('Error creating topics:', topicsError)
        return
      }
      topics = [...topics, ...(createdTopics || [])]
      console.log(`✅ Created ${createdTopics?.length || 0} new topics`)
    } else {
      console.log(`ℹ️ All topics already exist`)
    }
    
    // Fetch all topics for reference
    const { data: allTopics } = await supabase.from('topics').select()
    topics = allTopics || []

    // 3. Create articles
    console.log('Creating articles...')
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .insert([
        {
          user_id: users[0].id,
          title: 'Next.js 14 App Routerの完全ガイド',
          slug: 'nextjs-14-app-router-guide',
          content: `# Next.js 14 App Routerの完全ガイド\n\nNext.js 14で導入されたApp Routerは、Reactアプリケーションの構築方法を大きく変えました。\n\n## 主な特徴\n\n- Server Components by default\n- Nested Layouts\n- Improved Data Fetching\n- Built-in SEO support\n\n## 使い方\n\n\`\`\`tsx\n// app/page.tsx\nexport default function Page() {\n  return <h1>Hello, Next.js!</h1>\n}\n\`\`\`\n\nこのような形で簡単にページを作成できます。`,
          emoji: '🚀',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['nextjs', 'react', 'typescript']
        },
        {
          user_id: users[1].id,
          title: 'Go言語で作る高性能WebAPI',
          slug: 'go-high-performance-api',
          content: `# Go言語で作る高性能WebAPI\n\nGoは高性能なWebAPIを構築するのに最適な言語です。\n\n## なぜGoなのか\n\n- 高速な実行速度\n- 優れた並行処理\n- シンプルな文法\n- 充実した標準ライブラリ`,
          emoji: '⚡',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['go', 'api', 'backend']
        },
        {
          user_id: users[2].id,
          title: 'モダンCSSテクニック集2024',
          slug: 'modern-css-techniques-2024',
          content: `# モダンCSSテクニック集2024\n\n2024年に知っておくべきCSSテクニックをまとめました。\n\n## Container Queries\n\n要素のサイズに基づいてスタイルを適用できるようになりました。`,
          emoji: '🎨',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['css', 'frontend', 'webdesign']
        },
        {
          user_id: users[3].id,
          title: 'ChatGPT APIを使った開発効率化',
          slug: 'chatgpt-api-development',
          content: `# ChatGPT APIを使った開発効率化\n\nChatGPT APIを活用して開発効率を大幅に向上させる方法を紹介します。\n\n## 活用例\n\n- コード生成\n- ドキュメント作成\n- テストケース生成\n- コードレビュー`,
          emoji: '🤖',
          type: 'idea',
          published_at: new Date().toISOString(),
          topics: ['ai', 'chatgpt', 'productivity']
        },
        {
          user_id: users[4].id,
          title: 'Flutter 3.0の新機能まとめ',
          slug: 'flutter-3-new-features',
          content: `# Flutter 3.0の新機能まとめ\n\nFlutter 3.0で追加された新機能を詳しく解説します。\n\n## Material 3対応\n\n新しいMaterial Designに完全対応しました。`,
          emoji: '📱',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['flutter', 'mobile', 'dart']
        },
        {
          user_id: users[0].id,
          title: 'TypeScriptの型パズル入門',
          slug: 'typescript-type-puzzles',
          content: `# TypeScriptの型パズル入門\n\nTypeScriptの高度な型機能を使った型パズルを解いてみましょう。\n\n## Conditional Types\n\n条件によって型を変更する強力な機能です。`,
          emoji: '🧩',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['typescript', 'javascript']
        },
        {
          user_id: users[1].id,
          title: 'Kubernetes入門ガイド',
          slug: 'kubernetes-beginner-guide',
          content: `# Kubernetes入門ガイド\n\nKubernetesの基本から実践まで分かりやすく解説します。\n\n## Kubernetesとは\n\nコンテナオーケストレーションツールです。`,
          emoji: '☸️',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['kubernetes', 'docker', 'devops']
        },
        {
          user_id: users[2].id,
          title: 'Reactのパフォーマンス最適化',
          slug: 'react-performance-optimization',
          content: `# Reactのパフォーマンス最適化\n\nReactアプリケーションのパフォーマンスを改善するテクニック集。\n\n## React.memo\n\n不要な再レンダリングを防ぐ。`,
          emoji: '⚛️',
          type: 'tech',
          published_at: new Date().toISOString(),
          topics: ['react', 'performance', 'frontend']
        }
      ])
      .select()

    if (articlesError) {
      console.error('Error creating articles:', articlesError)
      return
    }
    console.log(`✅ Created ${articles.length} articles`)

    // 4. Create books
    console.log('Creating books...')
    const { data: books, error: booksError } = await supabase
      .from('books')
      .insert([
        {
          user_id: users[0].id,
          title: 'Next.js実践入門',
          slug: 'nextjs-practical-guide',
          description: 'Next.jsを使った実践的なWebアプリケーション開発を学ぶ',
          cover_image_url: '/images/book-placeholder.svg',
          price: 2980,
          is_free: false,
          published_at: new Date().toISOString(),
          topics: ['nextjs', 'react', 'typescript']
        },
        {
          user_id: users[1].id,
          title: 'Go言語によるWebアプリケーション開発',
          slug: 'go-web-development',
          description: 'Go言語でゼロからWebアプリケーションを作る',
          cover_image_url: '/images/book-placeholder.svg',
          price: 0,
          is_free: true,
          published_at: new Date().toISOString(),
          topics: ['go', 'backend']
        },
        {
          user_id: users[3].id,
          title: '実践機械学習',
          slug: 'practical-machine-learning',
          description: 'Pythonで学ぶ機械学習の基礎から応用まで',
          cover_image_url: '/images/book-placeholder.svg',
          price: 3480,
          is_free: false,
          published_at: new Date().toISOString(),
          topics: ['python', 'machinelearning', 'ai']
        },
        {
          user_id: users[4].id,
          title: 'はじめてのFlutter',
          slug: 'flutter-for-beginners',
          description: 'Flutterでモバイルアプリを作ろう',
          cover_image_url: '/images/book-placeholder.svg',
          price: 0,
          is_free: true,
          published_at: new Date().toISOString(),
          topics: ['flutter', 'mobile']
        }
      ])
      .select()

    if (booksError) {
      console.error('Error creating books:', booksError)
      return
    }
    console.log(`✅ Created ${books.length} books`)

    // 5. Create scraps
    console.log('Creating scraps...')
    const { data: scraps, error: scrapsError } = await supabase
      .from('scraps')
      .insert([
        {
          user_id: users[0].id,
          title: 'React Server Componentsの使い所',
          slug: 'react-server-components-use-cases',
          content: 'React Server Componentsって実際どういう場面で使うのが適切なんだろう？\n\n皆さんの意見を聞きたいです。',
          emoji: '💭',
          closed: false,
          topics: ['react', 'nextjs']
        },
        {
          user_id: users[1].id,
          title: 'Go vs Rust - どちらを選ぶ？',
          slug: 'go-vs-rust',
          content: 'バックエンド開発でGoとRust、どちらを選ぶべきか悩んでいます。\n\nそれぞれのメリット・デメリットを議論しましょう。',
          emoji: '🤔',
          closed: false,
          topics: ['go', 'rust', 'backend']
        },
        {
          user_id: users[2].id,
          title: 'CSSフレームワークは必要？',
          slug: 'css-framework-necessary',
          content: 'TailwindCSSやBootstrapなどのCSSフレームワーク、本当に必要でしょうか？\n\n素のCSSで十分という意見もありますが...',
          emoji: '🎨',
          closed: true,
          topics: ['css', 'frontend']
        },
        {
          user_id: users[3].id,
          title: 'AIツールの活用方法',
          slug: 'ai-tools-usage',
          content: 'GitHub Copilot、ChatGPT、Cursor...みんなはどのAIツールをどう使い分けてる？',
          emoji: '🤖',
          closed: false,
          topics: ['ai', 'productivity']
        },
        {
          user_id: users[4].id,
          title: 'クロスプラットフォーム開発の未来',
          slug: 'cross-platform-future',
          content: 'Flutter、React Native、.NET MAUI...クロスプラットフォーム開発の未来はどうなると思いますか？',
          emoji: '🌍',
          closed: false,
          topics: ['flutter', 'mobile']
        }
      ])
      .select()

    if (scrapsError) {
      console.error('Error creating scraps:', scrapsError)
      return
    }
    console.log(`✅ Created ${scraps.length} scraps`)

    console.log('\n✨ Database seeding completed successfully!')
    console.log(`
Summary:
- Users: ${users.length}
- Topics: ${topics.length}
- Articles: ${articles.length}
- Books: ${books.length}
- Scraps: ${scraps.length}
    `)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding
seedDatabase()