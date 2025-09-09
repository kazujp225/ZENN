import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// ヘルパー関数: ランダムな絵文字を生成
const getRandomEmoji = () => {
  const emojis = ['📝', '💡', '🚀', '⚡', '🔥', '✨', '🎯', '🛠️', '💻', '🌟', '📚', '🎨']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

// ヘルパー関数: ランダムなタグを生成
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

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.purchase.deleteMany()
  await prisma.scrapTag.deleteMany()
  await prisma.bookTag.deleteMany()
  await prisma.articleTag.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.scrapPost.deleteMany()
  await prisma.scrap.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.book.deleteMany()
  await prisma.article.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  // Create tags
  const tagData = [
    { name: 'react', slug: 'react', displayName: 'React', description: 'A JavaScript library for building user interfaces' },
    { name: 'nextjs', slug: 'nextjs', displayName: 'Next.js', description: 'The React Framework for Production' },
    { name: 'typescript', slug: 'typescript', displayName: 'TypeScript', description: 'TypeScript is a typed superset of JavaScript' },
    { name: 'javascript', slug: 'javascript', displayName: 'JavaScript', description: 'High-level, interpreted programming language' },
    { name: 'nodejs', slug: 'nodejs', displayName: 'Node.js', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine' },
    { name: 'python', slug: 'python', displayName: 'Python', description: 'High-level programming language' },
    { name: 'go', slug: 'go', displayName: 'Go', description: 'Open source programming language' },
    { name: 'rust', slug: 'rust', displayName: 'Rust', description: 'A language empowering everyone to build reliable and efficient software' },
    { name: 'docker', slug: 'docker', displayName: 'Docker', description: 'Platform for developing, shipping, and running applications' },
    { name: 'kubernetes', slug: 'kubernetes', displayName: 'Kubernetes', description: 'Open-source container orchestration platform' },
  ]

  const tags = await Promise.all(
    tagData.map(tag => 
      prisma.tag.create({ data: tag })
    )
  )

  // Create users
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const username = faker.internet.username().toLowerCase()
      
      return prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          username: username.slice(0, 20), // Ensure username is not too long
          displayName: `${firstName} ${lastName}`,
          bio: faker.lorem.paragraph(),
          avatarUrl: faker.image.avatar(),
          githubUsername: Math.random() > 0.5 ? username : null,
          twitterUsername: Math.random() > 0.5 ? username : null,
          company: Math.random() > 0.3 ? faker.company.name() : null,
          location: Math.random() > 0.3 ? faker.location.city() : null,
        }
      })
    })
  )

  // Create articles for each user
  for (const user of users) {
    const articleCount = Math.floor(Math.random() * 5) + 1
    
    for (let i = 0; i < articleCount; i++) {
      const title = faker.lorem.sentence()
      const slug = faker.helpers.slugify(title).toLowerCase()
      
      const article = await prisma.article.create({
        data: {
          slug: slug.slice(0, 50), // Ensure slug is not too long
          authorId: user.id,
          title,
          emoji: getRandomEmoji(),
          type: Math.random() > 0.3 ? 'TECH' : 'IDEA',
          content: faker.lorem.paragraphs(10, '\n\n'),
          contentHtml: `<p>${faker.lorem.paragraphs(10, '</p><p>')}</p>`,
          excerpt: faker.lorem.paragraph().slice(0, 200),
          topics: JSON.stringify(getRandomTags()),
          status: Math.random() > 0.2 ? 'PUBLISHED' : 'DRAFT',
          publishedAt: Math.random() > 0.2 ? faker.date.past() : null,
          viewsCount: Math.floor(Math.random() * 1000),
          likesCount: Math.floor(Math.random() * 100),
          commentsCount: Math.floor(Math.random() * 20),
        }
      })

      // Add tags to article
      const articleTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 3) + 1)
      for (const tag of articleTags) {
        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          }
        })
      }
    }
  }

  // Create books for some users
  const bookAuthors = faker.helpers.arrayElements(users, 5)
  for (const author of bookAuthors) {
    const title = faker.lorem.sentence()
    const slug = faker.helpers.slugify(title).toLowerCase()
    
    const book = await prisma.book.create({
      data: {
        slug: slug.slice(0, 50),
        authorId: author.id,
        title,
        description: faker.lorem.paragraphs(3),
        price: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 500 : 0,
        status: 'PUBLISHED',
        publishedAt: faker.date.past(),
        chaptersCount: Math.floor(Math.random() * 10) + 3,
        purchaseCount: Math.floor(Math.random() * 100),
        likesCount: Math.floor(Math.random() * 200),
      }
    })

    // Create chapters for the book
    const chapterCount = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < chapterCount; i++) {
      const chapterTitle = faker.lorem.sentence()
      const chapterSlug = faker.helpers.slugify(chapterTitle).toLowerCase()
      
      await prisma.chapter.create({
        data: {
          bookId: book.id,
          number: i + 1,
          title: chapterTitle,
          slug: chapterSlug.slice(0, 50),
          content: faker.lorem.paragraphs(20, '\n\n'),
          contentHtml: `<p>${faker.lorem.paragraphs(20, '</p><p>')}</p>`,
          isFree: i === 0, // First chapter is free
        }
      })
    }

    // Add tags to book
    const bookTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 3) + 1)
    for (const tag of bookTags) {
      await prisma.bookTag.create({
        data: {
          bookId: book.id,
          tagId: tag.id,
        }
      })
    }
  }

  // Create scraps for some users
  const scrapAuthors = faker.helpers.arrayElements(users, 7)
  for (const author of scrapAuthors) {
    const scrap = await prisma.scrap.create({
      data: {
        authorId: author.id,
        title: faker.lorem.sentence(),
        emoji: getRandomEmoji(),
        isPublic: Math.random() > 0.1,
        postsCount: 0,
        likesCount: Math.floor(Math.random() * 50),
      }
    })

    // Create scrap posts
    const postCount = Math.floor(Math.random() * 5) + 1
    for (let i = 0; i < postCount; i++) {
      await prisma.scrapPost.create({
        data: {
          scrapId: scrap.id,
          authorId: author.id,
          content: faker.lorem.paragraphs(2),
          contentHtml: `<p>${faker.lorem.paragraphs(2, '</p><p>')}</p>`,
        }
      })
    }

    // Update posts count
    await prisma.scrap.update({
      where: { id: scrap.id },
      data: { postsCount: postCount }
    })

    // Add tags to scrap
    const scrapTags = faker.helpers.arrayElements(tags, Math.floor(Math.random() * 2) + 1)
    for (const tag of scrapTags) {
      await prisma.scrapTag.create({
        data: {
          scrapId: scrap.id,
          tagId: tag.id,
        }
      })
    }
  }

  // Create follows
  for (const user of users) {
    const followingUsers = faker.helpers.arrayElements(
      users.filter(u => u.id !== user.id),
      Math.floor(Math.random() * 5)
    )
    
    for (const followingUser of followingUsers) {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: followingUser.id,
        }
      }).catch(() => {
        // Ignore if already exists
      })
    }
  }

  // Create likes on articles
  const articles = await prisma.article.findMany({ where: { status: 'PUBLISHED' } })
  for (const article of articles) {
    const likers = faker.helpers.arrayElements(users, Math.floor(Math.random() * 5))
    for (const liker of likers) {
      await prisma.like.create({
        data: {
          userId: liker.id,
          targetType: 'ARTICLE',
          targetId: article.id,
        }
      }).catch(() => {
        // Ignore if already exists
      })
    }
  }

  // Create comments on some articles
  const commentedArticles = faker.helpers.arrayElements(articles, Math.min(5, articles.length))
  for (const article of commentedArticles) {
    const commenters = faker.helpers.arrayElements(users, Math.floor(Math.random() * 3) + 1)
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          authorId: commenter.id,
          articleId: article.id,
          content: faker.lorem.paragraph(),
          contentHtml: `<p>${faker.lorem.paragraph()}</p>`,
          likesCount: Math.floor(Math.random() * 10),
        }
      })
    }
  }

  // Create bookmarks
  for (const user of users) {
    const bookmarkedArticles = faker.helpers.arrayElements(articles, Math.floor(Math.random() * 3))
    for (const article of bookmarkedArticles) {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          articleId: article.id,
          note: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        }
      }).catch(() => {
        // Ignore if already exists
      })
    }
  }

  // Create notifications for some users
  const notificationTypes = [
    'NEW_FOLLOWER',
    'ARTICLE_LIKED',
    'ARTICLE_COMMENTED',
  ]

  for (const user of users) {
    const notificationCount = Math.floor(Math.random() * 5)
    for (let i = 0; i < notificationCount; i++) {
      const type = faker.helpers.arrayElement(notificationTypes)
      await prisma.notification.create({
        data: {
          userId: user.id,
          type,
          title: `New ${type.toLowerCase().replace('_', ' ')}`,
          message: faker.lorem.sentence(),
          isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? faker.date.recent() : null,
        }
      })
    }
  }

  // Update user counts
  for (const user of users) {
    const articlesCount = await prisma.article.count({ where: { authorId: user.id } })
    const booksCount = await prisma.book.count({ where: { authorId: user.id } })
    const scrapsCount = await prisma.scrap.count({ where: { authorId: user.id } })
    const followersCount = await prisma.follow.count({ where: { followingId: user.id } })
    const followingCount = await prisma.follow.count({ where: { followerId: user.id } })

    await prisma.user.update({
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

  // Update tag counts
  for (const tag of tags) {
    const articlesCount = await prisma.articleTag.count({ where: { tagId: tag.id } })
    const booksCount = await prisma.bookTag.count({ where: { tagId: tag.id } })
    const scrapsCount = await prisma.scrapTag.count({ where: { tagId: tag.id } })

    await prisma.tag.update({
      where: { id: tag.id },
      data: {
        articlesCount,
        booksCount,
        scrapsCount,
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  
  // Log summary
  const userCount = await prisma.user.count()
  const articleCount = await prisma.article.count()
  const bookCount = await prisma.book.count()
  const scrapCount = await prisma.scrap.count()
  
  console.log(`
📊 Seed Summary:
- Users: ${userCount}
- Articles: ${articleCount}
- Books: ${bookCount}
- Scraps: ${scrapCount}
- Tags: ${tags.length}
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })