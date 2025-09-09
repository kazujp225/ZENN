/**
 * データベース接続設定
 * 環境ごとの接続設定を管理
 */

const config = {
  // 開発環境（SQLite）
  development: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
    options: {
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    }
  },

  // テスト環境（SQLite インメモリ）
  test: {
    provider: 'sqlite',
    url: ':memory:',
    options: {
      log: ['error'],
      errorFormat: 'minimal',
    }
  },

  // ステージング環境（PostgreSQL）
  staging: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    options: {
      log: ['warn', 'error'],
      errorFormat: 'colorless',
      pool: {
        min: 2,
        max: 10,
      }
    },
    // SSL設定
    ssl: {
      rejectUnauthorized: false
    }
  },

  // 本番環境（PostgreSQL）
  production: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    options: {
      log: ['error'],
      errorFormat: 'minimal',
      pool: {
        min: 5,
        max: 20,
      }
    },
    // SSL設定
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_CA_CERT,
    },
    // 接続プーリング設定（PgBouncer使用時）
    pgBouncer: {
      enabled: process.env.PGBOUNCER_ENABLED === 'true',
      url: process.env.PGBOUNCER_URL,
      poolMode: 'transaction',
      maxClientConn: 1000,
      defaultPoolSize: 25,
    }
  }
}

// 環境変数から現在の環境を取得
const environment = process.env.NODE_ENV || 'development'

// PostgreSQL固有の設定
const postgresSettings = {
  // パフォーマンス設定
  performance: {
    statementTimeout: 30000, // 30秒
    queryTimeout: 60000,     // 60秒
    idleInTransactionSessionTimeout: 60000,
  },
  
  // インデックス設定（自動作成）
  indexes: {
    autoCreate: process.env.AUTO_CREATE_INDEXES === 'true',
    concurrent: true,
  },
  
  // バックアップ設定
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 毎日午前2時
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  },
  
  // レプリケーション設定
  replication: {
    enabled: process.env.REPLICATION_ENABLED === 'true',
    readReplicas: process.env.READ_REPLICA_URLS?.split(',') || [],
    lag: {
      maxAllowed: 1000, // ミリ秒
      checkInterval: 5000,
    }
  }
}

// SQLite固有の設定
const sqliteSettings = {
  // WALモード設定
  journal_mode: 'WAL',
  synchronous: 'NORMAL',
  
  // キャッシュ設定
  cache_size: -2000, // 2MB
  page_size: 4096,
  
  // 自動VACUUM
  auto_vacuum: 'INCREMENTAL',
  
  // タイムアウト設定
  busy_timeout: 5000,
}

// 接続URL生成関数
function generateConnectionUrl(env) {
  const cfg = config[env]
  
  if (cfg.provider === 'sqlite') {
    return cfg.url
  }
  
  // PostgreSQL URL構築
  if (cfg.pgBouncer?.enabled) {
    return cfg.pgBouncer.url
  }
  
  // 環境変数から直接URLを取得
  if (cfg.url) {
    return cfg.url
  }
  
  // URLを部品から構築
  const {
    DB_USER = 'postgres',
    DB_PASSWORD = '',
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'zenn'
  } = process.env
  
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`
}

// Prisma設定生成関数
function generatePrismaConfig(env = environment) {
  const cfg = config[env]
  const isPostgres = cfg.provider === 'postgresql'
  
  return {
    datasources: {
      db: {
        provider: cfg.provider,
        url: generateConnectionUrl(env),
        ...(isPostgres && cfg.ssl ? { ssl: cfg.ssl } : {})
      }
    },
    ...cfg.options,
    ...(isPostgres ? { ...postgresSettings } : { ...sqliteSettings })
  }
}

// マイグレーション設定
const migrationConfig = {
  // マイグレーションファイルのパス
  migrationsFolder: './prisma/migrations',
  
  // スキーマファイルのパス
  schemaPath: environment === 'production' 
    ? './prisma/schema-production.prisma'
    : './prisma/schema.prisma',
  
  // シードデータ設定
  seed: {
    enabled: environment !== 'production',
    file: environment === 'production'
      ? './prisma/seed-production.ts'
      : './prisma/seed-optimized.ts',
  },
  
  // 自動マイグレーション
  autoMigrate: {
    enabled: process.env.AUTO_MIGRATE === 'true',
    onStart: environment === 'development',
  }
}

// ヘルスチェック関数
async function checkDatabaseHealth(prisma) {
  try {
    // 簡単なクエリを実行
    await prisma.$queryRaw`SELECT 1`
    
    // 接続プールの状態を確認
    const metrics = await prisma.$metrics.json()
    
    return {
      status: 'healthy',
      provider: config[environment].provider,
      environment,
      metrics: {
        connectionPool: metrics.counters.find(m => m.key === 'prisma_pool_connections_open')?.value,
        queryCount: metrics.counters.find(m => m.key === 'prisma_client_queries_total')?.value,
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      provider: config[environment].provider,
      environment,
      timestamp: new Date().toISOString()
    }
  }
}

// 接続再試行設定
const retryConfig = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  factor: 2,
  
  async withRetry(fn, retries = this.maxRetries, delay = this.initialDelay) {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0) {
        throw error
      }
      
      console.log(`Database connection failed. Retrying in ${delay}ms... (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return this.withRetry(
        fn, 
        retries - 1, 
        Math.min(delay * this.factor, this.maxDelay)
      )
    }
  }
}

module.exports = {
  config,
  environment,
  postgresSettings,
  sqliteSettings,
  generateConnectionUrl,
  generatePrismaConfig,
  migrationConfig,
  checkDatabaseHealth,
  retryConfig,
  
  // 現在の設定を取得
  getCurrentConfig() {
    return config[environment]
  },
  
  // 接続URLを取得
  getConnectionUrl() {
    return generateConnectionUrl(environment)
  },
  
  // Prisma設定を取得
  getPrismaConfig() {
    return generatePrismaConfig(environment)
  }
}