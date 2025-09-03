export interface ArticleValidationError {
  field: string
  message: string
}

export interface ArticleValidationResult {
  isValid: boolean
  errors: ArticleValidationError[]
  sanitizedData?: {
    title: string
    content: string
    tags: string[]
    emoji: string
  }
}

export interface ArticleDraft {
  title: string
  emoji: string
  type: 'tech' | 'idea'
  tags: string[]
  content: string
  published: boolean
}

export class ArticleValidator {
  private static readonly TITLE_MIN_LENGTH = 5
  private static readonly TITLE_MAX_LENGTH = 100
  private static readonly CONTENT_MIN_LENGTH = 100
  private static readonly CONTENT_MAX_LENGTH = 50000
  private static readonly MAX_TAGS = 5
  private static readonly TAG_MAX_LENGTH = 20

  static validateArticle(draft: ArticleDraft): ArticleValidationResult {
    const errors: ArticleValidationError[] = []

    // タイトルバリデーション
    const titleValidation = this.validateTitle(draft.title)
    errors.push(...titleValidation.errors)

    // コンテンツバリデーション
    const contentValidation = this.validateContent(draft.content)
    errors.push(...contentValidation.errors)

    // タグバリデーション
    const tagValidation = this.validateTags(draft.tags)
    errors.push(...tagValidation.errors)

    // 絵文字バリデーション
    const emojiValidation = this.validateEmoji(draft.emoji)
    errors.push(...emojiValidation.errors)

    // SEOチェック
    const seoValidation = this.validateSEO(draft.title, draft.content)
    errors.push(...seoValidation.errors)

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? {
        title: draft.title.trim(),
        content: draft.content.trim(),
        tags: draft.tags.map(tag => tag.trim()),
        emoji: draft.emoji
      } : undefined
    }
  }

  static validateTitle(title: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      errors.push({
        field: 'title',
        message: 'タイトルを入力してください'
      })
      return { isValid: false, errors }
    }

    if (trimmedTitle.length < this.TITLE_MIN_LENGTH) {
      errors.push({
        field: 'title',
        message: `タイトルは${this.TITLE_MIN_LENGTH}文字以上で入力してください`
      })
    }

    if (trimmedTitle.length > this.TITLE_MAX_LENGTH) {
      errors.push({
        field: 'title',
        message: `タイトルは${this.TITLE_MAX_LENGTH}文字以内で入力してください`
      })
    }

    // 特殊文字チェック
    if (this.containsMaliciousContent(trimmedTitle)) {
      errors.push({
        field: 'title',
        message: 'タイトルに不適切な内容が含まれています'
      })
    }

    // 重複語句チェック
    if (this.hasExcessiveRepetition(trimmedTitle)) {
      errors.push({
        field: 'title',
        message: 'タイトルに同じ語句が繰り返し使われています'
      })
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateContent(content: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      errors.push({
        field: 'content',
        message: '記事の内容を入力してください'
      })
      return { isValid: false, errors }
    }

    if (trimmedContent.length < this.CONTENT_MIN_LENGTH) {
      errors.push({
        field: 'content',
        message: `記事は${this.CONTENT_MIN_LENGTH}文字以上で入力してください`
      })
    }

    if (trimmedContent.length > this.CONTENT_MAX_LENGTH) {
      errors.push({
        field: 'content',
        message: `記事は${this.CONTENT_MAX_LENGTH}文字以内で入力してください`
      })
    }

    // Markdownの構造チェック
    const structureValidation = this.validateMarkdownStructure(trimmedContent)
    errors.push(...structureValidation.errors)

    // 画像リンクチェック
    const imageValidation = this.validateImages(trimmedContent)
    errors.push(...imageValidation.errors)

    // 外部リンクチェック
    const linkValidation = this.validateLinks(trimmedContent)
    errors.push(...linkValidation.errors)

    return { isValid: errors.length === 0, errors }
  }

  static validateTags(tags: string[]): ArticleValidationResult {
    const errors: ArticleValidationError[] = []

    if (tags.length === 0) {
      errors.push({
        field: 'tags',
        message: '少なくとも1つのタグを設定してください'
      })
    }

    if (tags.length > this.MAX_TAGS) {
      errors.push({
        field: 'tags',
        message: `タグは${this.MAX_TAGS}個以下に設定してください`
      })
    }

    // 個々のタグをチェック
    tags.forEach((tag, index) => {
      const trimmedTag = tag.trim()
      
      if (!trimmedTag) {
        errors.push({
          field: 'tags',
          message: '空のタグは設定できません'
        })
      }

      if (trimmedTag.length > this.TAG_MAX_LENGTH) {
        errors.push({
          field: 'tags',
          message: `タグは${this.TAG_MAX_LENGTH}文字以内で入力してください`
        })
      }

      // 不適切なタグチェック
      if (this.isInappropriateTag(trimmedTag)) {
        errors.push({
          field: 'tags',
          message: `「${trimmedTag}」は適切でないタグです`
        })
      }
    })

    // 重複タグチェック
    const uniqueTags = new Set(tags.map(tag => tag.toLowerCase().trim()))
    if (uniqueTags.size !== tags.length) {
      errors.push({
        field: 'tags',
        message: '重複するタグがあります'
      })
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateEmoji(emoji: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []

    if (!emoji) {
      errors.push({
        field: 'emoji',
        message: '記事の絵文字を設定してください'
      })
      return { isValid: false, errors }
    }

    // 絵文字かどうかの簡易チェック
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    if (!emojiRegex.test(emoji) && emoji.length > 2) {
      errors.push({
        field: 'emoji',
        message: '適切な絵文字を選択してください'
      })
    }

    return { isValid: errors.length === 0, errors }
  }

  static validateSEO(title: string, content: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []

    // タイトルの長さ（SEO最適化）
    if (title.length > 60) {
      errors.push({
        field: 'seo',
        message: 'SEO最適化のため、タイトルは60文字以内が推奨されます'
      })
    }

    // 見出し構造チェック
    const headingPattern = /^#+\s+(.+)$/gm
    const headings = content.match(headingPattern)
    
    if (!headings || headings.length === 0) {
      errors.push({
        field: 'seo',
        message: 'SEO改善のため、見出しを追加することを推奨します'
      })
    } else {
      // H1が複数ないかチェック
      const h1Count = (content.match(/^#\s+(.+)$/gm) || []).length
      if (h1Count > 1) {
        errors.push({
          field: 'seo',
          message: 'H1見出しは1つまでにすることを推奨します'
        })
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  private static validateMarkdownStructure(content: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []

    // コードブロックの対応チェック
    const codeBlockMatches = content.match(/```/g)
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      errors.push({
        field: 'content',
        message: 'コードブロック（```）が正しく閉じられていません'
      })
    }

    // リンクの形式チェック
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
    let linkMatch
    while ((linkMatch = linkPattern.exec(content)) !== null) {
      const url = linkMatch[2]
      if (!this.isValidUrl(url) && !url.startsWith('#') && !url.startsWith('/')) {
        errors.push({
          field: 'content',
          message: `無効なリンクが含まれています: ${url}`
        })
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  private static validateImages(content: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
    let imageMatch

    while ((imageMatch = imagePattern.exec(content)) !== null) {
      const imageUrl = imageMatch[2]
      const altText = imageMatch[1]

      // 画像URLの形式チェック
      if (!this.isValidImageUrl(imageUrl)) {
        errors.push({
          field: 'content',
          message: `無効な画像URLが含まれています: ${imageUrl}`
        })
      }

      // Alt textの推奨
      if (!altText.trim()) {
        errors.push({
          field: 'content',
          message: 'アクセシビリティのため、画像にalt属性の追加を推奨します'
        })
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  private static validateLinks(content: string): ArticleValidationResult {
    const errors: ArticleValidationError[] = []
    
    // 外部リンクの数をチェック
    const externalLinkPattern = /https?:\/\/[^\s)]+/g
    const externalLinks = content.match(externalLinkPattern) || []
    
    if (externalLinks.length > 20) {
      errors.push({
        field: 'content',
        message: '外部リンクが多すぎます。スパムと判定される可能性があります'
      })
    }

    return { isValid: errors.length === 0, errors }
  }

  private static containsMaliciousContent(text: string): boolean {
    const maliciousPatterns = [
      /<script\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ]

    return maliciousPatterns.some(pattern => pattern.test(text))
  }

  private static hasExcessiveRepetition(text: string): boolean {
    // 同じ単語が5回以上連続で出現
    const words = text.toLowerCase().split(/\s+/)
    let consecutiveCount = 1
    
    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1]) {
        consecutiveCount++
        if (consecutiveCount >= 5) return true
      } else {
        consecutiveCount = 1
      }
    }
    
    return false
  }

  private static isInappropriateTag(tag: string): boolean {
    const inappropriateTags = [
      'spam', 'adult', 'nsfw', '18+', 'xxx',
      'hack', 'crack', 'piracy', 'illegal'
    ]
    
    return inappropriateTags.some(inappropriate => 
      tag.toLowerCase().includes(inappropriate)
    )
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private static isValidImageUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const lowerUrl = url.toLowerCase()
    
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
           lowerUrl.includes('imgur.com') ||
           lowerUrl.includes('unsplash.com') ||
           lowerUrl.includes('cloudinary.com')
  }

  // パフォーマンス分析
  static analyzeReadability(content: string): {
    readingTime: number // 分
    wordCount: number
    characterCount: number
    paragraphCount: number
    headingCount: number
    codeBlockCount: number
    imageCount: number
  } {
    const wordCount = content.trim().split(/\s+/).length
    const characterCount = content.length
    const paragraphCount = content.split(/\n\s*\n/).length
    const headingCount = (content.match(/^#+\s/gm) || []).length
    const codeBlockCount = (content.match(/```/g) || []).length / 2
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length

    // 日本語の読み取り速度は約400-500文字/分
    const readingTime = Math.ceil(characterCount / 450)

    return {
      readingTime,
      wordCount,
      characterCount,
      paragraphCount,
      headingCount,
      codeBlockCount,
      imageCount
    }
  }
}