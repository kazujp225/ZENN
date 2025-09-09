#!/usr/bin/env node

/**
 * SQLiteからPostgreSQLへのデータ移行スクリプト
 * 
 * 使用方法:
 * 1. 環境変数を設定: 
 *    - SQLITE_URL: SQLiteデータベースのパス
 *    - POSTGRES_URL: PostgreSQL接続文字列
 * 2. 実行: node scripts/migrate-to-postgres.js
 */

const { PrismaClient: SqliteClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')
const ora = require('ora')
const chalk = require('chalk')

// 環境変数のチェック
if (!process.env.SQLITE_URL || !process.env.POSTGRES_URL) {
  console.error(chalk.red('❌ Error: SQLITE_URL and POSTGRES_URL environment variables are required'))
  process.exit(1)
}

// Prismaクライアントの初期化
const sqliteDb = new SqliteClient({
  datasources: {
    db: {
      url: process.env.SQLITE_URL
    }
  }
})

const postgresDb = new PostgresClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL
    }
  }
})

// プログレスバー用のヘルパー
class MigrationProgress {
  constructor(total, label) {
    this.total = total
    this.current = 0
    this.label = label
    this.spinner = ora(`${label} (0/${total})`).start()
  }

  increment() {
    this.current++
    this.spinner.text = `${this.label} (${this.current}/${this.total})`
    if (this.current === this.total) {
      this.spinner.succeed(`${this.label} completed`)
    }
  }

  fail(message) {
    this.spinner.fail(message)
  }
}

// バッチ処理ヘルパー
async function processBatch(items, batchSize, processor) {
  const batches = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  
  for (const batch of batches) {
    await Promise.all(batch.map(processor))
  }
}

// データ変換関数
function transformUser(user) {
  return {
    ...user,
    deletedAt: user.deletedAt || null,
    emailVerificationToken: user.emailVerificationToken || null,
    passwordHash: user.passwordHash || null,
  }
}

function transformArticle(article) {
  return {
    ...article,
    topics: Array.isArray(article.topics) 
      ? article.topics 
      : JSON.parse(article.topics || '[]'),
    deletedAt: article.deletedAt || null,
  }
}

function transformJsonField(data, field) {
  if (typeof data[field] === 'string') {
    try {
      return JSON.parse(data[field])
    } catch {
      return data[field]
    }
  }
  return data[field]
}

// メイン移行関数
async function migrate() {
  console.log(chalk.blue('\n🚀 Starting database migration from SQLite to PostgreSQL\n'))
  
  const startTime = Date.now()
  const stats = {
    users: 0,
    articles: 0,
    books: 0,
    scraps: 0,
    comments: 0,
    tags: 0,
    total: 0
  }
  
  try {
    // PostgreSQLのクリーンアップ
    console.log(chalk.yellow('🧹 Cleaning up PostgreSQL database...'))
    await postgresDb.$executeRaw`TRUNCATE TABLE users RESTART IDENTITY CASCADE`
    
    // ========================================
    // 1. ユーザーデータの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating users...'))
    const users = await sqliteDb.user.findMany({
      include: {
        settings: true,
        authProviders: true,
        sessions: true,
      }
    })
    
    const userProgress = new MigrationProgress(users.length, 'Users')
    
    for (const user of users) {
      await postgresDb.user.create({
        data: {
          ...transformUser(user),
          settings: user.settings ? {
            create: {
              ...user.settings,
              emailNotifications: transformJsonField(user.settings, 'emailNotifications'),
              privacySettings: transformJsonField(user.settings, 'privacySettings'),
              editorSettings: transformJsonField(user.settings, 'editorSettings'),
            }
          } : undefined,
          authProviders: {
            create: user.authProviders.map(ap => ({
              ...ap,
              userId: undefined, // リレーションで自動設定
            }))
          },
          sessions: {
            create: user.sessions.map(s => ({
              ...s,
              userId: undefined,
            }))
          }
        }
      })
      userProgress.increment()
      stats.users++
    }
    
    // ========================================
    // 2. タグデータの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating tags...'))
    const tags = await sqliteDb.tag.findMany()
    
    const tagProgress = new MigrationProgress(tags.length, 'Tags')
    
    await postgresDb.tag.createMany({
      data: tags,
      skipDuplicates: true,
    })
    
    tags.forEach(() => {
      tagProgress.increment()
      stats.tags++
    })
    
    // ========================================
    // 3. パブリケーションの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating publications...'))
    const publications = await sqliteDb.publication.findMany({
      include: {
        members: true,
      }
    })
    
    const pubProgress = new MigrationProgress(publications.length, 'Publications')
    
    for (const pub of publications) {
      await postgresDb.publication.create({
        data: {
          ...pub,
          members: {
            create: pub.members.map(m => ({
              ...m,
              publicationId: undefined,
            }))
          }
        }
      })
      pubProgress.increment()
    }
    
    // ========================================
    // 4. 記事データの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating articles...'))
    const articles = await sqliteDb.article.findMany({
      include: {
        tags: true,
        comments: true,
      }
    })
    
    const articleProgress = new MigrationProgress(articles.length, 'Articles')
    
    for (const article of articles) {
      await postgresDb.article.create({
        data: {
          ...transformArticle(article),
          tags: {
            create: article.tags.map(t => ({
              tagId: t.tagId,
            }))
          },
          comments: {
            create: article.comments.map(c => ({
              ...c,
              articleId: undefined,
              deletedAt: c.deletedAt || null,
            }))
          }
        }
      })
      articleProgress.increment()
      stats.articles++
    }
    
    // ========================================
    // 5. 書籍データの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating books...'))
    const books = await sqliteDb.book.findMany({
      include: {
        chapters: true,
        tags: true,
        purchases: true,
      }
    })
    
    const bookProgress = new MigrationProgress(books.length, 'Books')
    
    for (const book of books) {
      await postgresDb.book.create({
        data: {
          ...book,
          deletedAt: book.deletedAt || null,
          chapters: {
            create: book.chapters.map(ch => ({
              ...ch,
              bookId: undefined,
            }))
          },
          tags: {
            create: book.tags.map(t => ({
              tagId: t.tagId,
            }))
          },
          purchases: {
            create: book.purchases.map(p => ({
              ...p,
              bookId: undefined,
            }))
          }
        }
      })
      bookProgress.increment()
      stats.books++
    }
    
    // ========================================
    // 6. スクラップデータの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating scraps...'))
    const scraps = await sqliteDb.scrap.findMany({
      include: {
        posts: true,
        tags: true,
      }
    })
    
    const scrapProgress = new MigrationProgress(scraps.length, 'Scraps')
    
    for (const scrap of scraps) {
      await postgresDb.scrap.create({
        data: {
          ...scrap,
          deletedAt: scrap.deletedAt || null,
          posts: {
            create: scrap.posts.map(p => ({
              ...p,
              scrapId: undefined,
            }))
          },
          tags: {
            create: scrap.tags.map(t => ({
              tagId: t.tagId,
            }))
          }
        }
      })
      scrapProgress.increment()
      stats.scraps++
    }
    
    // ========================================
    // 7. インタラクションデータの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating interactions...'))
    
    // Follows
    const follows = await sqliteDb.follow.findMany()
    await postgresDb.follow.createMany({
      data: follows,
      skipDuplicates: true,
    })
    
    // Likes
    const likes = await sqliteDb.like.findMany()
    await postgresDb.like.createMany({
      data: likes,
      skipDuplicates: true,
    })
    
    // Bookmarks
    const bookmarks = await sqliteDb.bookmark.findMany()
    await postgresDb.bookmark.createMany({
      data: bookmarks,
      skipDuplicates: true,
    })
    
    // Notifications
    const notifications = await sqliteDb.notification.findMany()
    await postgresDb.notification.createMany({
      data: notifications.map(n => ({
        ...n,
        data: transformJsonField(n, 'data'),
      })),
    })
    
    // ========================================
    // 8. イベントデータの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating events...'))
    const events = await sqliteDb.event.findMany({
      include: {
        submissions: true,
        prizes: true,
      }
    })
    
    for (const event of events) {
      await postgresDb.event.create({
        data: {
          ...event,
          submissions: {
            create: event.submissions.map(s => ({
              ...s,
              eventId: undefined,
            }))
          },
          prizes: {
            create: event.prizes.map(p => ({
              ...p,
              eventId: undefined,
            }))
          }
        }
      })
    }
    
    // ========================================
    // 9. バッジ・収益データの移行
    // ========================================
    console.log(chalk.cyan('\n📤 Migrating badges and earnings...'))
    
    // Badges
    const badges = await sqliteDb.badge.findMany()
    await postgresDb.badge.createMany({
      data: badges,
    })
    
    // Badge Transactions
    const badgeTransactions = await sqliteDb.badgeTransaction.findMany()
    await postgresDb.badgeTransaction.createMany({
      data: badgeTransactions,
    })
    
    // Earnings
    const earnings = await sqliteDb.earning.findMany()
    await postgresDb.earning.createMany({
      data: earnings,
    })
    
    // Payouts
    const payouts = await sqliteDb.payout.findMany()
    await postgresDb.payout.createMany({
      data: payouts,
    })
    
    // ========================================
    // 10. シーケンスのリセット（PostgreSQL）
    // ========================================
    console.log(chalk.cyan('\n🔧 Resetting sequences...'))
    
    // PostgreSQL固有のシーケンスリセット
    await postgresDb.$executeRaw`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users))`
    await postgresDb.$executeRaw`SELECT setval(pg_get_serial_sequence('articles', 'id'), (SELECT MAX(id) FROM articles))`
    await postgresDb.$executeRaw`SELECT setval(pg_get_serial_sequence('books', 'id'), (SELECT MAX(id) FROM books))`
    
    // ========================================
    // 完了
    // ========================================
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(chalk.green(`\n✅ Migration completed successfully in ${duration.toFixed(2)} seconds!\n`))
    console.log(chalk.white('📊 Migration Summary:'))
    console.log(chalk.gray('─'.repeat(30)))
    console.log(`  Users:    ${stats.users}`)
    console.log(`  Articles: ${stats.articles}`)
    console.log(`  Books:    ${stats.books}`)
    console.log(`  Scraps:   ${stats.scraps}`)
    console.log(`  Tags:     ${stats.tags}`)
    console.log(chalk.gray('─'.repeat(30)))
    
  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error)
    console.error(chalk.yellow('\n⚠️  Rolling back changes...'))
    
    // ロールバック処理
    try {
      await postgresDb.$executeRaw`TRUNCATE TABLE users RESTART IDENTITY CASCADE`
      console.log(chalk.green('✅ Rollback completed'))
    } catch (rollbackError) {
      console.error(chalk.red('❌ Rollback failed:'), rollbackError)
    }
    
    process.exit(1)
  } finally {
    await sqliteDb.$disconnect()
    await postgresDb.$disconnect()
  }
}

// データ整合性チェック関数
async function verifyMigration() {
  console.log(chalk.blue('\n🔍 Verifying data integrity...\n'))
  
  const sqliteCounts = {
    users: await sqliteDb.user.count(),
    articles: await sqliteDb.article.count(),
    books: await sqliteDb.book.count(),
    scraps: await sqliteDb.scrap.count(),
    tags: await sqliteDb.tag.count(),
  }
  
  const postgresCounts = {
    users: await postgresDb.user.count(),
    articles: await postgresDb.article.count(),
    books: await postgresDb.book.count(),
    scraps: await postgresDb.scrap.count(),
    tags: await postgresDb.tag.count(),
  }
  
  let hasErrors = false
  
  for (const [table, count] of Object.entries(sqliteCounts)) {
    if (count !== postgresCounts[table]) {
      console.error(chalk.red(`❌ Count mismatch for ${table}: SQLite=${count}, PostgreSQL=${postgresCounts[table]}`))
      hasErrors = true
    } else {
      console.log(chalk.green(`✅ ${table}: ${count} records verified`))
    }
  }
  
  if (hasErrors) {
    console.error(chalk.red('\n❌ Data integrity check failed'))
    process.exit(1)
  } else {
    console.log(chalk.green('\n✅ All data integrity checks passed'))
  }
}

// メイン実行
async function main() {
  try {
    await migrate()
    await verifyMigration()
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  }
}

// 実行
if (require.main === module) {
  main()
}