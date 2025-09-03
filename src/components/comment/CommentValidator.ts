export interface CommentValidationError {
  field: string
  message: string
}

export interface CommentValidationResult {
  isValid: boolean
  errors: CommentValidationError[]
  sanitizedContent?: string
}

export class CommentValidator {
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 1000
  private static readonly FORBIDDEN_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ]

  static validateContent(content: string): CommentValidationResult {
    const errors: CommentValidationError[] = []
    let sanitizedContent = content.trim()

    // 空の内容チェック
    if (!sanitizedContent) {
      errors.push({
        field: 'content',
        message: 'コメントを入力してください'
      })
    }

    // 長さチェック
    if (sanitizedContent.length < this.MIN_LENGTH) {
      errors.push({
        field: 'content',
        message: `コメントは${this.MIN_LENGTH}文字以上で入力してください`
      })
    }

    if (sanitizedContent.length > this.MAX_LENGTH) {
      errors.push({
        field: 'content',
        message: `コメントは${this.MAX_LENGTH}文字以内で入力してください`
      })
    }

    // 危険なHTMLタグチェック
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        errors.push({
          field: 'content',
          message: 'スクリプトタグや危険なHTMLは使用できません'
        })
        break
      }
    }

    // 基本的なHTMLサニタイズ
    sanitizedContent = this.sanitizeHtml(sanitizedContent)

    // スパムチェック（簡易版）
    if (this.isLikelySpam(sanitizedContent)) {
      errors.push({
        field: 'content',
        message: 'スパムの可能性があるコンテンツは投稿できません'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent: errors.length === 0 ? sanitizedContent : undefined
    }
  }

  private static sanitizeHtml(content: string): string {
    // 基本的なHTMLエスケープ
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  private static isLikelySpam(content: string): boolean {
    const spamIndicators = [
      /(.)\1{10,}/,  // 同じ文字の大量連続
      /http[s]?:\/\/[^\s]+/g,  // URL（簡易チェック）
      /\b(buy|sale|discount|free|click|visit)\b/gi,  // スパムキーワード
    ]

    // URLが3つ以上含まれている場合
    const urlMatches = content.match(/http[s]?:\/\/[^\s]+/g)
    if (urlMatches && urlMatches.length >= 3) {
      return true
    }

    // その他のスパム指標をチェック
    return spamIndicators.some(pattern => pattern.test(content))
  }

  static validateReplyDepth(depth: number): boolean {
    return depth <= 3 // 最大3レベルまでのネスト
  }
}