/**
 * 安全なロガーユーティリティ
 * 本番環境では自動的にログ出力を無効化
 */

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(message, ...args)
  },

  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args)
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  // 機密情報をマスクしてログ出力
  logSafe: (message: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      const safeCopy = { ...data }
      
      // 機密フィールドをマスク
      const sensitiveFields = ['email', 'password', 'token', 'key', 'secret', 'auth']
      sensitiveFields.forEach(field => {
        if (safeCopy[field]) {
          safeCopy[field] = '***masked***'
        }
      })
      
      console.log(message, safeCopy)
    }
  }
}

// 本番環境でのconsole.log使用を警告する開発ヘルパー
if (process.env.NODE_ENV === 'development') {
  const originalLog = console.log
  console.log = (...args: any[]) => {
    if (typeof args[0] === 'string' && !args[0].includes('[SAFE]')) {
      console.warn('⚠️ 直接のconsole.log使用を避け、logger.log()を使用してください')
    }
    originalLog(...args)
  }
}