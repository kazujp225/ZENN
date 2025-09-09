import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ========================================
// ヘルパー関数
// ========================================

const getRandomEmoji = () => {
  const emojis = ['📝', '💡', '🚀', '⚡', '🔥', '✨', '🎯', '🛠️', '💻', '🌟', '📚', '🎨']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

const getRandomTags = (count: number = 3) => {
  const tags = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js',
    'Python', 'Go', 'Rust', 'Docker', 'Kubernetes',
    'AWS', 'GCP', 'Azure', 'GraphQL', 'REST API',
    'Machine Learning', 'AI', 'DevOps', 'CI/CD', 'Testing'
  ]
  const shuffled = tags.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// バッチデータ生成用
const generateUserData = (index: number) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const username = `${faker.internet.username().toLowerCase()}_${index}`.slice(0, 20)
  
  return {
    email: `user${index}@example.com`,
    username,
    displayName: `${firstName} ${lastName}`,
    bio: faker.lorem.paragraph(),
    avatarUrl: faker.image.avatar(),
    githubUsername: Math.random() > 0.5 ? username : null,
    twitterUsername: Math.random() > 0.5 ? username : null,
    company: Math.random() > 0.3 ? faker.company.name() : null,
    location: Math.random() > 0.3 ? faker.location.city() : null,
    passwordHash: bcrypt.hashSync('password123', 10),
    emailVerified: Math.random() > 0.3 ? faker.date.past() : null,
  }
}

// ========================================
// メインシード関数（トランザクション最適化版）
// ========================================

async function seedWithTransaction() {
  console.log('🌱 Starting optimized database seeding...')
  
  const startTime = Date.now()
  
  try {
    await prisma.$transaction(async (tx) => {
      // ========================================
      // 1. データクリーンアップ
      // ========================================
      console.log('🧹 Cleaning up existing data...')
      
      // 依存関係の順序でデータを削除
      await tx.analyticsEvent.deleteMany()
      await tx.auditLog.deleteMany()
      await tx.eventPrize.deleteMany()
      await tx.eventSubmission.deleteMany()
      await tx.event.deleteMany()
      await tx.tagFollow.deleteMany()
      await tx.scrapTag.deleteMany()
      await tx.bookTag.deleteMany()
      await tx.articleTag.deleteMany()
      await tx.tag.deleteMany()
      await tx.payout.deleteMany()
      await tx.earning.deleteMany()
      await tx.purchase.deleteMany()
      await tx.badgeTransaction.deleteMany()
      await tx.badge.deleteMany()
      await tx.notification.deleteMany()
      await tx.bookmark.deleteMany()
      await tx.follow.deleteMany()
      await tx.comment.deleteMany()
      await tx.like.deleteMany()
      await tx.scrapPost.deleteMany()
      await tx.scrap.deleteMany()
      await tx.chapter.deleteMany()
      await tx.book.deleteMany()
      await tx.article.deleteMany()
      await tx.publicationMember.deleteMany()
      await tx.publication.deleteMany()
      await tx.userSettings.deleteMany()
      await tx.session.deleteMany()
      await tx.authProvider.deleteMany()
      await tx.user.deleteMany()
      
      // ========================================
      // 2. マスターデータ作成
      // ========================================
      console.log('📋 Creating master data...')
      
      // タグの作成
      const tagData = [
        { name: 'react', slug: 'react', displayName: 'React', description: 'A JavaScript library for building user interfaces', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'nextjs', slug: 'nextjs', displayName: 'Next.js', description: 'The React Framework for Production', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'typescript', slug: 'typescript', displayName: 'TypeScript', description: 'TypeScript is a typed superset of JavaScript', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'javascript', slug: 'javascript', displayName: 'JavaScript', description: 'High-level, interpreted programming language', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'nodejs', slug: 'nodejs', displayName: 'Node.js', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'python', slug: 'python', displayName: 'Python', description: 'High-level programming language', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'go', slug: 'go', displayName: 'Go', description: 'Open source programming language', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'rust', slug: 'rust', displayName: 'Rust', description: 'A language empowering everyone to build reliable and efficient software', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'docker', slug: 'docker', displayName: 'Docker', description: 'Platform for developing, shipping, and running applications', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
        { name: 'kubernetes', slug: 'kubernetes', displayName: 'Kubernetes', description: 'Open-source container orchestration platform', articlesCount: 0, booksCount: 0, scrapsCount: 0 },
      ]
      
      await tx.tag.createMany({ data: tagData })
      const tags = await tx.tag.findMany()
      
      // バッジの作成
      const badgeData = [
        { name: 'Good Job', emoji: '👍', price: 100, description: 'Nice work!' },
        { name: 'Awesome', emoji: '🎉', price: 200, description: 'Amazing contribution!' },
        { name: 'Hero', emoji: '🦸', price: 500, description: 'You are a hero!' },
        { name: 'Star', emoji: '⭐', price: 1000, description: 'Outstanding work!' },
      ]
      
      await tx.badge.createMany({ data: badgeData })
      const badges = await tx.badge.findMany()
      
      // ========================================
      // 3. ユーザーとコンテンツの作成（バッチ最適化）
      // ========================================
      console.log('👥 Creating users...')
      
      const userCount = 20
      const userData = Array.from({ length: userCount }, (_, i) => generateUserData(i))
      
      // ユーザーをバッチで作成
      await tx.user.createMany({ data: userData })
      const users = await tx.user.findMany()
      
      // 各ユーザーの設定を作成
      const userSettingsData = users.map(user => ({
        userId: user.id,
        emailNotifications: JSON.stringify({ likes: true, comments: true, follows: true, mentions: true }),
        privacySettings: JSON.stringify({ profilePublic: true, showEmail: false }),
        editorSettings: JSON.stringify({ theme: 'light', fontSize: 16, autoSave: true }),
      }))
      
      await tx.userSettings.createMany({ data: userSettingsData })
      
      // OAuth プロバイダーの設定（一部のユーザー）
      const authProviderData = users.slice(0, 10).map(user => ({
        userId: user.id,
        provider: faker.helpers.arrayElement(['github', 'google', 'twitter']),
        providerUserId: faker.string.uuid(),
        accessToken: faker.string.alphanumeric(40),
      }))
      
      await tx.authProvider.createMany({ data: authProviderData })
      
      // ========================================
      // 4. パブリケーションの作成
      // ========================================
      console.log('📚 Creating publications...')
      
      const publicationData = [
        {
          name: 'tech-blog',
          displayName: 'Tech Blog',
          description: 'Technical articles and tutorials',
          createdBy: users[0].id,
        },
        {
          name: 'dev-notes',
          displayName: 'Dev Notes',
          description: 'Development notes and tips',
          createdBy: users[1].id,
        },
      ]
      
      await tx.publication.createMany({ data: publicationData })
      const publications = await tx.publication.findMany()
      
      // パブリケーションメンバー追加
      const pubMemberData = []
      for (const pub of publications) {
        // オーナー
        pubMemberData.push({
          publicationId: pub.id,
          userId: pub.createdBy,
          role: 'owner'
        })
        // メンバー
        const members = faker.helpers.arrayElements(users, 3)
        for (const member of members) {
          if (member.id !== pub.createdBy) {
            pubMemberData.push({
              publicationId: pub.id,
              userId: member.id,
              role: 'member'
            })
          }
        }
      }
      
      await tx.publicationMember.createMany({ data: pubMemberData })
      
      // ========================================
      // 5. 記事の作成（バッチ処理）
      // ========================================
      console.log('📝 Creating articles...')
      
      const articleData = []
      const articleTagData = []
      
      for (const user of users) {
        const articleCount = Math.floor(Math.random() * 5) + 1
        
        for (let i = 0; i < articleCount; i++) {
          const title = faker.lorem.sentence()
          const slug = faker.helpers.slugify(title).toLowerCase().slice(0, 50)
          const articleId = faker.string.uuid()
          const isPublished = Math.random() > 0.2
          
          articleData.push({
            id: articleId,
            slug,
            authorId: user.id,
            publicationId: Math.random() > 0.7 ? faker.helpers.arrayElement(publications).id : null,
            title,
            emoji: getRandomEmoji(),
            type: Math.random() > 0.3 ? 'TECH' : 'IDEA',
            content: faker.lorem.paragraphs(10, '\n\n'),
            contentHtml: `<p>${faker.lorem.paragraphs(10, '</p><p>')}</p>`,
            excerpt: faker.lorem.paragraph().slice(0, 200),
            topics: JSON.stringify(getRandomTags()),
            status: isPublished ? 'PUBLISHED' : 'DRAFT',
            publishedAt: isPublished ? faker.date.past() : null,
            readingTime: Math.floor(Math.random() * 15) + 3,
            viewsCount: Math.floor(Math.random() * 1000),
            likesCount: 0,
            commentsCount: 0,
          })
          
          // タグ関連付け
          const selectedTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 3) + 1)
          for (const tag of selectedTags) {
            articleTagData.push({
              articleId,
              tagId: tag.id,
            })
          }
        }
      }
      
      await tx.article.createMany({ data: articleData })
      await tx.articleTag.createMany({ data: articleTagData })
      
      // ========================================
      // 6. 書籍とチャプターの作成
      // ========================================
      console.log('📚 Creating books and chapters...')
      
      const bookAuthors = faker.helpers.arrayElements(users, 5)
      const bookData = []
      const chapterData = []
      const bookTagData = []
      
      for (const author of bookAuthors) {
        const title = faker.lorem.sentence()
        const slug = faker.helpers.slugify(title).toLowerCase().slice(0, 50)
        const bookId = faker.string.uuid()
        const chapterCount = Math.floor(Math.random() * 5) + 3
        
        bookData.push({
          id: bookId,
          slug,
          authorId: author.id,
          title,
          description: faker.lorem.paragraphs(3),
          price: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 500 : 0,
          status: 'PUBLISHED',
          publishedAt: faker.date.past(),
          chaptersCount: chapterCount,
          purchaseCount: 0,
          likesCount: 0,
          viewsCount: Math.floor(Math.random() * 500),
        })
        
        // チャプター作成
        for (let i = 0; i < chapterCount; i++) {
          const chapterTitle = faker.lorem.sentence()
          const chapterSlug = faker.helpers.slugify(chapterTitle).toLowerCase().slice(0, 50)
          
          chapterData.push({
            bookId,
            number: i + 1,
            title: chapterTitle,
            slug: chapterSlug,
            content: faker.lorem.paragraphs(20, '\n\n'),
            contentHtml: `<p>${faker.lorem.paragraphs(20, '</p><p>')}</p>`,
            isFree: i === 0,
          })
        }
        
        // タグ関連付け
        const selectedTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 3) + 1)
        for (const tag of selectedTags) {
          bookTagData.push({
            bookId,
            tagId: tag.id,
          })
        }
      }
      
      await tx.book.createMany({ data: bookData })
      await tx.chapter.createMany({ data: chapterData })
      await tx.bookTag.createMany({ data: bookTagData })
      
      // ========================================
      // 7. スクラップの作成
      // ========================================
      console.log('💭 Creating scraps...')
      
      const scrapAuthors = faker.helpers.arrayElements(users, 7)
      const scrapData = []
      const scrapPostData = []
      const scrapTagData = []
      
      for (const author of scrapAuthors) {
        const scrapId = faker.string.uuid()
        const postCount = Math.floor(Math.random() * 5) + 1
        
        scrapData.push({
          id: scrapId,
          authorId: author.id,
          title: faker.lorem.sentence(),
          emoji: getRandomEmoji(),
          isPublic: Math.random() > 0.1,
          isClosed: Math.random() > 0.8,
          closedAt: Math.random() > 0.8 ? faker.date.recent() : null,
          postsCount: postCount,
          likesCount: 0,
        })
        
        // スクラップ投稿作成
        for (let i = 0; i < postCount; i++) {
          scrapPostData.push({
            scrapId,
            authorId: author.id,
            content: faker.lorem.paragraphs(2),
            contentHtml: `<p>${faker.lorem.paragraphs(2, '</p><p>')}</p>`,
          })
        }
        
        // タグ関連付け
        const selectedTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 2) + 1)
        for (const tag of selectedTags) {
          scrapTagData.push({
            scrapId,
            tagId: tag.id,
          })
        }
      }
      
      await tx.scrap.createMany({ data: scrapData })
      await tx.scrapPost.createMany({ data: scrapPostData })
      await tx.scrapTag.createMany({ data: scrapTagData })
      
      // ========================================
      // 8. インタラクションデータの作成
      // ========================================
      console.log('❤️ Creating interactions...')
      
      // フォロー関係
      const followData = []
      for (const user of users) {
        const followingUsers = faker.helpers.arrayElements(
          users.filter(u => u.id !== user.id),
          Math.floor(Math.random() * 5)
        )
        
        for (const followingUser of followingUsers) {
          followData.push({
            followerId: user.id,
            followingId: followingUser.id,
          })
        }
      }
      
      // 重複を除去
      const uniqueFollows = Array.from(new Map(
        followData.map(f => [`${f.followerId}-${f.followingId}`, f])
      ).values())
      
      await tx.follow.createMany({ data: uniqueFollows })
      
      // いいね
      const articles = await tx.article.findMany({ where: { status: 'PUBLISHED' } })
      const books = await tx.book.findMany({ where: { status: 'PUBLISHED' } })
      
      const likeData = []
      
      for (const article of articles.slice(0, 20)) {
        const likers = faker.helpers.arrayElements(users, Math.floor(Math.random() * 5))
        for (const liker of likers) {
          likeData.push({
            userId: liker.id,
            targetType: 'ARTICLE',
            targetId: article.id,
          })
        }
      }
      
      for (const book of books) {
        const likers = faker.helpers.arrayElements(users, Math.floor(Math.random() * 3))
        for (const liker of likers) {
          likeData.push({
            userId: liker.id,
            targetType: 'BOOK',
            targetId: book.id,
          })
        }
      }
      
      await tx.like.createMany({ data: likeData, skipDuplicates: true })
      
      // コメント
      const commentData = []
      const commentedArticles = faker.helpers.arrayElements(articles, Math.min(10, articles.length))
      
      for (const article of commentedArticles) {
        const commenters = faker.helpers.arrayElements(users, Math.floor(Math.random() * 3) + 1)
        for (const commenter of commenters) {
          commentData.push({
            authorId: commenter.id,
            articleId: article.id,
            content: faker.lorem.paragraph(),
            contentHtml: `<p>${faker.lorem.paragraph()}</p>`,
            likesCount: Math.floor(Math.random() * 10),
          })
        }
      }
      
      await tx.comment.createMany({ data: commentData })
      
      // ブックマーク
      const bookmarkData = []
      
      for (const user of users) {
        const bookmarkedArticles = faker.helpers.arrayElements(articles, Math.floor(Math.random() * 3))
        for (const article of bookmarkedArticles) {
          bookmarkData.push({
            userId: user.id,
            articleId: article.id,
            note: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          })
        }
      }
      
      await tx.bookmark.createMany({ data: bookmarkData, skipDuplicates: true })
      
      // ========================================
      // 9. 通知の作成
      // ========================================
      console.log('🔔 Creating notifications...')
      
      const notificationTypes = ['NEW_FOLLOWER', 'ARTICLE_LIKED', 'ARTICLE_COMMENTED', 'MENTION', 'BADGE']
      const notificationData = []
      
      for (const user of users) {
        const notificationCount = Math.floor(Math.random() * 5)
        for (let i = 0; i < notificationCount; i++) {
          const type = faker.helpers.arrayElement(notificationTypes)
          notificationData.push({
            userId: user.id,
            type,
            title: `New ${type.toLowerCase().replace('_', ' ')}`,
            message: faker.lorem.sentence(),
            isRead: Math.random() > 0.5,
            readAt: Math.random() > 0.5 ? faker.date.recent() : null,
          })
        }
      }
      
      await tx.notification.createMany({ data: notificationData })
      
      // ========================================
      // 10. イベントの作成
      // ========================================
      console.log('🎉 Creating events...')
      
      const eventData = [
        {
          slug: 'hackathon-2025',
          title: 'Zenn Hackathon 2025',
          description: 'Build something amazing!',
          type: 'hackathon',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-28'),
          submissionDeadline: new Date('2025-02-25'),
          isActive: true,
        },
        {
          slug: 'writing-contest',
          title: 'Technical Writing Contest',
          description: 'Share your knowledge!',
          type: 'contest',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-03-31'),
          submissionDeadline: new Date('2025-03-28'),
          isActive: true,
        },
      ]
      
      await tx.event.createMany({ data: eventData })
      
      // ========================================
      // 11. カウントの更新
      // ========================================
      console.log('📊 Updating counts...')
      
      // ユーザーカウント更新
      for (const user of users) {
        const articlesCount = await tx.article.count({ where: { authorId: user.id } })
        const booksCount = await tx.book.count({ where: { authorId: user.id } })
        const scrapsCount = await tx.scrap.count({ where: { authorId: user.id } })
        const followersCount = await tx.follow.count({ where: { followingId: user.id } })
        const followingCount = await tx.follow.count({ where: { followerId: user.id } })
        
        await tx.user.update({
          where: { id: user.id },
          data: {
            articlesCount,
            booksCount,
            scrapsCount,
            followersCount,
            followingCount,
          }
        })
      }
      
      // タグカウント更新
      for (const tag of tags) {
        const articlesCount = await tx.articleTag.count({ where: { tagId: tag.id } })
        const booksCount = await tx.bookTag.count({ where: { tagId: tag.id } })
        const scrapsCount = await tx.scrapTag.count({ where: { tagId: tag.id } })
        
        await tx.tag.update({
          where: { id: tag.id },
          data: {
            articlesCount,
            booksCount,
            scrapsCount,
          }
        })
      }
      
      // 記事のいいね・コメント数更新
      for (const article of articles) {
        const likesCount = await tx.like.count({ 
          where: { targetType: 'ARTICLE', targetId: article.id } 
        })
        const commentsCount = await tx.comment.count({ 
          where: { articleId: article.id } 
        })
        
        await tx.article.update({
          where: { id: article.id },
          data: { likesCount, commentsCount }
        })
      }
      
      // 書籍のいいね数更新
      for (const book of books) {
        const likesCount = await tx.like.count({ 
          where: { targetType: 'BOOK', targetId: book.id } 
        })
        
        await tx.book.update({
          where: { id: book.id },
          data: { likesCount }
        })
      }
    }, {
      maxWait: 10000, // 最大待機時間: 10秒
      timeout: 60000, // タイムアウト: 60秒
    })
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`✅ Database seeded successfully in ${duration.toFixed(2)} seconds!`)
    
    // 統計情報の表示
    const stats = await getStatistics()
    console.log(`
📊 Seed Summary:
- Users: ${stats.users}
- Articles: ${stats.articles}
- Books: ${stats.books}
- Scraps: ${stats.scraps}
- Tags: ${stats.tags}
- Comments: ${stats.comments}
- Likes: ${stats.likes}
- Follows: ${stats.follows}
    `)
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// 統計情報取得関数
async function getStatistics() {
  return {
    users: await prisma.user.count(),
    articles: await prisma.article.count(),
    books: await prisma.book.count(),
    scraps: await prisma.scrap.count(),
    tags: await prisma.tag.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.like.count(),
    follows: await prisma.follow.count(),
  }
}

// メイン実行
seedWithTransaction()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })