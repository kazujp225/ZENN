# セキュリティアーキテクチャ設計書

## 目次
1. [概要](#概要)
2. [脅威分析](#脅威分析)
3. [セキュリティ原則](#セキュリティ原則)
4. [アプリケーションセキュリティ](#アプリケーションセキュリティ)
5. [インフラストラクチャセキュリティ](#インフラストラクチャセキュリティ)
6. [データ保護](#データ保護)
7. [セキュリティ監視](#セキュリティ監視)
8. [インシデントレスポンス](#インシデントレスポンス)
9. [コンプライアンス](#コンプライアンス)

## 概要

### セキュリティ方針
- **Defense in Depth**: 多層防御による堅牢性確保
- **Zero Trust**: 全アクセスを検証・認証
- **Shift Left**: 開発初期からセキュリティ統合
- **Principle of Least Privilege**: 最小権限原則
- **Security by Design**: 設計段階からセキュリティ考慮

### 対象範囲
- Webアプリケーション
- API
- インフラストラクチャ
- データストレージ
- ネットワーク
- CI/CDパイプライン

## 脅威分析

### STRIDE脅威モデル

| 脅威カテゴリ | 説明 | 対象 | 対策 |
|-------------|------|------|------|
| **Spoofing** (なりすまし) | 他者になりすまして不正アクセス | 認証システム | 多要素認証、強力なパスワードポリシー |
| **Tampering** (改ざん) | データやコードの不正な変更 | データベース、API | 入力検証、デジタル署名、HMAC |
| **Repudiation** (否認) | 実行した操作の否認 | 全操作 | 監査ログ、タイムスタンプ |
| **Information Disclosure** (情報漏洩) | 機密情報の不正取得 | ユーザーデータ | 暗号化、アクセス制御 |
| **Denial of Service** (サービス拒否) | サービスの可用性攻撃 | 全サービス | レート制限、DDoS対策 |
| **Elevation of Privilege** (権限昇格) | 不正な権限取得 | 認可システム | RBAC、最小権限原則 |

### OWASP Top 10対策

| リスク | 脅威 | 対策実装 |
|--------|------|----------|
| **A01** | 壊れたアクセス制御 | RBAC、セッション管理、CSRF対策 |
| **A02** | 暗号化の失敗 | TLS 1.3、暗号化保存、安全な鍵管理 |
| **A03** | インジェクション | パラメータ化クエリ、入力検証、ORM使用 |
| **A04** | 安全でない設計 | 脅威モデリング、セキュアコーディング |
| **A05** | セキュリティの設定ミス | セキュアなデフォルト設定、最小構成 |
| **A06** | 脆弱で古いコンポーネント | 依存関係管理、定期更新 |
| **A07** | 識別と認証の失敗 | MFA、パスワード強度、セッション管理 |
| **A08** | ソフトウェアとデータの整合性エラー | 整合性検証、署名付きアップデート |
| **A09** | セキュリティログとモニタリングの失敗 | 包括的なログ記録、SIEM統合 |
| **A10** | サーバーサイドリクエストフォージェリ | URL検証、ホワイトリスト |

## セキュリティ原則

### 1. セキュアコーディング原則

```typescript
// src/lib/security/secure-coding.ts

// 入力検証
export class InputValidator {
  // SQLインジェクション対策
  static sanitizeSQL(input: string): string {
    // Prisma使用により自動的にパラメータ化
    return input.replace(/[';\\--]/g, '');
  }
  
  // XSS対策
  static sanitizeHTML(input: string): string {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
  }
  
  // パストラバーサル対策
  static sanitizePath(path: string): string {
    // 相対パスコンポーネントを除去
    return path.replace(/\.\./g, '').replace(/^\/+/, '');
  }
  
  // URLバリデーション
  static isValidURL(url: string, allowedDomains: string[] = []): boolean {
    try {
      const parsed = new URL(url);
      
      // プロトコルチェック
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      // ドメインホワイトリスト
      if (allowedDomains.length > 0) {
        return allowedDomains.some(domain => 
          parsed.hostname === domain || 
          parsed.hostname.endsWith(`.${domain}`)
        );
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Emailバリデーション
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
}

// 出力エンコーディング
export class OutputEncoder {
  // HTML属性用エンコード
  static forHTMLAttribute(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, (char) => {
      return `&#${char.charCodeAt(0)};`;
    });
  }
  
  // JavaScript用エンコード
  static forJavaScript(input: string): string {
    return JSON.stringify(input).slice(1, -1);
  }
  
  // URL用エンコード
  static forURL(input: string): string {
    return encodeURIComponent(input);
  }
  
  // CSS用エンコード
  static forCSS(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, (char) => {
      return `\\${char.charCodeAt(0).toString(16)} `;
    });
  }
}
```

### 2. 暗号化実装

```typescript
// src/lib/security/encryption.ts
import crypto from 'crypto';
import { promisify } from 'util';

export class Encryption {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;
  private saltLength = 64;
  private iterations = 100000;
  
  // データ暗号化
  async encrypt(plaintext: string, password: string): Promise<EncryptedData> {
    // Salt生成
    const salt = crypto.randomBytes(this.saltLength);
    
    // 鍵導出
    const key = await this.deriveKey(password, salt);
    
    // IV生成
    const iv = crypto.randomBytes(this.ivLength);
    
    // 暗号化
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }
  
  // データ復号
  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    // Base64デコード
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    
    // 鍵導出
    const key = await this.deriveKey(password, salt);
    
    // 復号
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted.toString('utf8');
  }
  
  // 鍵導出
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return pbkdf2(password, salt, this.iterations, this.keyLength, 'sha256');
  }
  
  // フィールドレベル暗号化
  async encryptField(value: string): Promise<string> {
    const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    // IV + Tag + Encrypted を結合
    const combined = Buffer.concat([iv, tag, encrypted]);
    
    return combined.toString('base64');
  }
  
  // フィールドレベル復号
  async decryptField(encryptedValue: string): Promise<string> {
    const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY!, 'hex');
    const combined = Buffer.from(encryptedValue, 'base64');
    
    // IV + Tag + Encrypted を分離
    const iv = combined.slice(0, this.ivLength);
    const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
    const encrypted = combined.slice(this.ivLength + this.tagLength);
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted.toString('utf8');
  }
}
```

## アプリケーションセキュリティ

### 1. CSRF対策

```typescript
// src/lib/security/csrf.ts
import crypto from 'crypto';

export class CSRFProtection {
  private tokenLength = 32;
  
  // トークン生成
  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }
  
  // トークン検証
  verifyToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    
    // タイミング攻撃対策
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    );
  }
  
  // Double Submit Cookie
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }
      
      const csrfToken = req.headers['x-csrf-token'];
      const cookieToken = req.cookies['csrf-token'];
      
      if (!this.verifyToken(csrfToken, cookieToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
      
      next();
    };
  }
}
```

### 2. セッションセキュリティ

```typescript
// src/lib/security/session.ts
export class SessionSecurity {
  // セッション設定
  static getSecureSessionConfig(): SessionOptions {
    return {
      name: 'session',
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      rolling: true, // アクティビティごとに更新
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only
        httpOnly: true, // XSS対策
        sameSite: 'lax', // CSRF対策
        maxAge: 30 * 60 * 1000, // 30分
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      },
      genid: () => {
        // セキュアなID生成
        return crypto.randomBytes(32).toString('hex');
      },
    };
  }
  
  // セッションフィクセーション対策
  static regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  // 同時セッション制限
  static async limitConcurrentSessions(
    userId: string,
    maxSessions: number = 3
  ): Promise<void> {
    const sessions = await redis.zrange(
      `user:${userId}:sessions`,
      0,
      -1,
      'WITHSCORES'
    );
    
    if (sessions.length >= maxSessions * 2) {
      // 古いセッションを削除
      const toRemove = sessions.slice(0, sessions.length - (maxSessions - 1) * 2);
      for (let i = 0; i < toRemove.length; i += 2) {
        await redis.del(`session:${toRemove[i]}`);
        await redis.zrem(`user:${userId}:sessions`, toRemove[i]);
      }
    }
  }
}
```

### 3. API セキュリティ

```typescript
// src/lib/security/api-security.ts
export class APISecrurity {
  // APIキー管理
  static async validateAPIKey(key: string): Promise<boolean> {
    // ハッシュ化して比較
    const hashedKey = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex');
    
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key: hashedKey,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    
    if (!apiKey) return false;
    
    // 使用記録
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });
    
    return true;
  }
  
  // レート制限
  static rateLimiter(options: RateLimitOptions = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15分
      max = 100, // 最大リクエスト数
      keyGenerator = (req) => req.ip,
      skipSuccessfulRequests = false,
    } = options;
    
    const store = new Map();
    
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // ウィンドウ内のリクエストを取得
      let requests = store.get(key) || [];
      requests = requests.filter(time => now - time < windowMs);
      
      if (requests.length >= max) {
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000),
        });
        return;
      }
      
      if (!skipSuccessfulRequests || res.statusCode >= 400) {
        requests.push(now);
        store.set(key, requests);
      }
      
      // レート制限ヘッダー
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - requests.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      next();
    };
  }
  
  // CORS設定
  static getCORSConfig(): CorsOptions {
    return {
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24時間
    };
  }
}
```

### 4. ファイルアップロードセキュリティ

```typescript
// src/lib/security/file-upload.ts
import fileType from 'file-type';
import isSvg from 'is-svg';
import sharp from 'sharp';

export class FileUploadSecurity {
  // 許可するMIMEタイプ
  private allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ];
  
  // ファイル検証
  async validateFile(buffer: Buffer, options: ValidationOptions = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = this.allowedMimeTypes,
      scanVirus = true,
    } = options;
    
    // サイズチェック
    if (buffer.length > maxSize) {
      throw new Error(`File size exceeds ${maxSize} bytes`);
    }
    
    // マジックナンバーでファイルタイプ検証
    const type = await fileType.fromBuffer(buffer);
    
    if (!type || !allowedTypes.includes(type.mime)) {
      throw new Error(`Invalid file type: ${type?.mime || 'unknown'}`);
    }
    
    // SVG特別処理
    if (type.mime === 'image/svg+xml') {
      await this.validateSVG(buffer);
    }
    
    // 画像の場合は再エンコード（悪意あるコード除去）
    if (type.mime.startsWith('image/') && type.mime !== 'image/svg+xml') {
      buffer = await this.sanitizeImage(buffer);
    }
    
    // ウイルススキャン
    if (scanVirus) {
      await this.scanForVirus(buffer);
    }
    
    return buffer;
  }
  
  // SVG検証
  private async validateSVG(buffer: Buffer): Promise<void> {
    const svg = buffer.toString('utf8');
    
    if (!isSvg(svg)) {
      throw new Error('Invalid SVG file');
    }
    
    // 危険な要素をチェック
    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /javascript:/i,
      /on\w+\s*=/i, // onload, onclick, etc.
      /<embed/i,
      /<object/i,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(svg)) {
        throw new Error('SVG contains potentially dangerous content');
      }
    }
  }
  
  // 画像サニタイズ
  private async sanitizeImage(buffer: Buffer): Promise<Buffer> {
    // sharpで再エンコード（メタデータ除去）
    return sharp(buffer)
      .rotate() // EXIF orientationを適用
      .withMetadata({
        // 安全なメタデータのみ保持
        orientation: undefined,
      })
      .toBuffer();
  }
  
  // ウイルススキャン
  private async scanForVirus(buffer: Buffer): Promise<void> {
    // ClamAVまたは他のアンチウイルスAPI
    const result = await clamav.scan(buffer);
    
    if (result.isInfected) {
      throw new Error(`Virus detected: ${result.viruses.join(', ')}`);
    }
  }
  
  // ファイル名サニタイズ
  sanitizeFileName(fileName: string): string {
    // 危険な文字を除去
    let safe = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // パストラバーサル対策
    safe = safe.replace(/\.\./g, '');
    
    // 長さ制限
    if (safe.length > 255) {
      const ext = path.extname(safe);
      const base = path.basename(safe, ext);
      safe = base.substring(0, 255 - ext.length) + ext;
    }
    
    return safe;
  }
}
```

## インフラストラクチャセキュリティ

### 1. ネットワークセキュリティ

```yaml
# infrastructure/network-security.yaml
apiVersion: v1
kind: NetworkPolicy
metadata:
  name: zenn-clone-network-policy
spec:
  podSelector:
    matchLabels:
      app: zenn-clone
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 2. WAF設定

```typescript
// infrastructure/waf.ts
export const wafRules = {
  // SQLインジェクション防御
  sqlInjection: {
    name: 'SQL Injection Protection',
    priority: 1,
    statement: {
      managedRuleGroupStatement: {
        vendorName: 'AWS',
        name: 'AWSManagedRulesSQLiRuleSet',
      },
    },
    action: { block: {} },
  },
  
  // XSS防御
  xss: {
    name: 'XSS Protection',
    priority: 2,
    statement: {
      managedRuleGroupStatement: {
        vendorName: 'AWS',
        name: 'AWSManagedRulesKnownBadInputsRuleSet',
      },
    },
    action: { block: {} },
  },
  
  // レート制限
  rateLimit: {
    name: 'Rate Limiting',
    priority: 3,
    statement: {
      rateBasedStatement: {
        limit: 2000,
        aggregateKeyType: 'IP',
      },
    },
    action: { block: {} },
  },
  
  // 地理的制限
  geoBlocking: {
    name: 'Geographic Restrictions',
    priority: 4,
    statement: {
      geoMatchStatement: {
        countryCodes: ['CN', 'RU', 'KP'], // ブロック対象国
      },
    },
    action: { block: {} },
  },
  
  // IPレピュテーション
  ipReputation: {
    name: 'IP Reputation List',
    priority: 5,
    statement: {
      managedRuleGroupStatement: {
        vendorName: 'AWS',
        name: 'AWSManagedRulesIPReputationList',
      },
    },
    action: { block: {} },
  },
};
```

### 3. DDoS対策

```typescript
// src/lib/security/ddos-protection.ts
export class DDoSProtection {
  // トラフィック分析
  private trafficAnalyzer = new Map<string, TrafficData>();
  
  // 異常検知
  async detectAnomaly(req: Request): Promise<boolean> {
    const ip = req.ip;
    const now = Date.now();
    
    if (!this.trafficAnalyzer.has(ip)) {
      this.trafficAnalyzer.set(ip, {
        requests: [],
        suspicious: false,
      });
    }
    
    const traffic = this.trafficAnalyzer.get(ip)!;
    
    // 直近のリクエストを追加
    traffic.requests.push(now);
    
    // 1分以内のリクエストのみ保持
    traffic.requests = traffic.requests.filter(
      time => now - time < 60000
    );
    
    // 異常パターン検知
    if (traffic.requests.length > 100) { // 1分で100リクエスト以上
      traffic.suspicious = true;
      await this.blockIP(ip);
      return true;
    }
    
    // リクエスト間隔の分析
    if (traffic.requests.length > 10) {
      const intervals = [];
      for (let i = 1; i < traffic.requests.length; i++) {
        intervals.push(traffic.requests[i] - traffic.requests[i - 1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      
      // 機械的なリクエストパターン検知
      if (avgInterval < 100) { // 平均100ms以下
        traffic.suspicious = true;
        await this.challengeIP(ip);
        return true;
      }
    }
    
    return false;
  }
  
  // IP ブロック
  private async blockIP(ip: string): Promise<void> {
    await redis.setex(`blocked:${ip}`, 3600, 'true'); // 1時間ブロック
    
    // CloudFlare API でブロック
    if (process.env.CF_API_KEY) {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/firewall/access_rules/rules`, {
        method: 'POST',
        headers: {
          'X-Auth-Email': process.env.CF_EMAIL!,
          'X-Auth-Key': process.env.CF_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'block',
          configuration: {
            target: 'ip',
            value: ip,
          },
          notes: 'Automated DDoS protection',
        }),
      });
    }
  }
  
  // チャレンジ（CAPTCHA）
  private async challengeIP(ip: string): Promise<void> {
    await redis.setex(`challenge:${ip}`, 600, 'true'); // 10分チャレンジ
  }
}
```

## データ保護

### 1. データ暗号化

```typescript
// src/lib/security/data-protection.ts
export class DataProtection {
  // PII暗号化
  static encryptPII(data: any): any {
    const piiFields = ['email', 'phone', 'ssn', 'creditCard'];
    const encrypted = { ...data };
    
    for (const field of piiFields) {
      if (encrypted[field]) {
        encrypted[field] = this.encryptField(encrypted[field]);
      }
    }
    
    return encrypted;
  }
  
  // データマスキング
  static maskSensitiveData(data: any): any {
    return {
      ...data,
      email: this.maskEmail(data.email),
      phone: this.maskPhone(data.phone),
      creditCard: this.maskCreditCard(data.creditCard),
    };
  }
  
  private static maskEmail(email: string): string {
    if (!email) return '';
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
  }
  
  private static maskPhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\d(?=\d{4})/g, '*');
  }
  
  private static maskCreditCard(cc: string): string {
    if (!cc) return '';
    return cc.replace(/\d(?=\d{4})/g, '*');
  }
  
  // データ保持ポリシー
  static async enforceRetentionPolicy(): Promise<void> {
    // 90日以上経過したログを削除
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    });
    
    // 削除済みユーザーデータの完全削除（30日後）
    await prisma.user.deleteMany({
      where: {
        deletedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
  }
}
```

### 2. バックアップ暗号化

```bash
#!/bin/bash
# backup-encryption.sh

# データベースバックアップ
pg_dump $DATABASE_URL | \
  openssl enc -aes-256-cbc -salt -pass pass:$BACKUP_PASSWORD | \
  aws s3 cp - s3://backup-bucket/db-$(date +%Y%m%d-%H%M%S).sql.enc \
  --sse aws:kms \
  --sse-kms-key-id $KMS_KEY_ID

# ファイルバックアップ
tar -czf - /app/uploads | \
  openssl enc -aes-256-cbc -salt -pass pass:$BACKUP_PASSWORD | \
  aws s3 cp - s3://backup-bucket/files-$(date +%Y%m%d-%H%M%S).tar.gz.enc \
  --sse aws:kms \
  --sse-kms-key-id $KMS_KEY_ID
```

## セキュリティ監視

### 1. ログ記録

```typescript
// src/lib/security/logging.ts
export class SecurityLogger {
  // セキュリティイベントログ
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const log = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      stack: event.stack,
    };
    
    // データベース記録
    await prisma.securityLog.create({ data: log });
    
    // SIEM転送
    if (process.env.SIEM_ENDPOINT) {
      await fetch(process.env.SIEM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SIEM_TOKEN}`,
        },
        body: JSON.stringify(log),
      });
    }
    
    // 重大度に応じてアラート
    if (event.severity === 'CRITICAL') {
      await this.sendAlert(log);
    }
  }
  
  // 監査ログ
  static auditMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // レスポンス監視
      const originalSend = res.send;
      res.send = function(data) {
        res.locals.responseBody = data;
        originalSend.call(this, data);
      };
      
      // 完了後にログ記録
      res.on('finish', async () => {
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            action: `${req.method} ${req.path}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            statusCode: res.statusCode,
            duration: Date.now() - startTime,
            request: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: this.sanitizeRequestBody(req.body),
            },
            response: {
              statusCode: res.statusCode,
              headers: res.getHeaders(),
            },
          },
        });
      });
      
      next();
    };
  }
  
  // 機密情報のサニタイズ
  private static sanitizeRequestBody(body: any): any {
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
```

### 2. 異常検知

```typescript
// src/lib/security/anomaly-detection.ts
export class AnomalyDetection {
  // ログイン異常検知
  static async detectLoginAnomaly(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AnomalyResult> {
    // 通常のログインパターンを取得
    const recentLogins = await prisma.loginHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日
        },
      },
    });
    
    // 新しいIPアドレスからのログイン
    const newIP = !recentLogins.some(login => login.ipAddress === ipAddress);
    
    // 新しいデバイスからのログイン
    const newDevice = !recentLogins.some(login => login.userAgent === userAgent);
    
    // 地理的異常
    const geoAnomaly = await this.checkGeographicAnomaly(userId, ipAddress);
    
    // ブルートフォース検知
    const bruteForce = await this.detectBruteForce(ipAddress);
    
    const riskScore = 
      (newIP ? 30 : 0) +
      (newDevice ? 20 : 0) +
      (geoAnomaly ? 40 : 0) +
      (bruteForce ? 50 : 0);
    
    return {
      isAnomaly: riskScore > 50,
      riskScore,
      factors: {
        newIP,
        newDevice,
        geoAnomaly,
        bruteForce,
      },
      recommendedAction: this.getRecommendedAction(riskScore),
    };
  }
  
  // 地理的異常チェック
  private static async checkGeographicAnomaly(
    userId: string,
    ipAddress: string
  ): Promise<boolean> {
    // IPジオロケーション
    const location = await this.getIPLocation(ipAddress);
    
    // 最近のログイン位置
    const recentLocation = await redis.get(`user:${userId}:last_location`);
    
    if (!recentLocation) {
      await redis.set(`user:${userId}:last_location`, location);
      return false;
    }
    
    // 物理的に不可能な移動を検知
    const distance = this.calculateDistance(recentLocation, location);
    const lastLoginTime = await redis.get(`user:${userId}:last_login`);
    const timeDiff = Date.now() - parseInt(lastLoginTime || '0');
    
    // 1時間で1000km以上の移動は異常
    const maxSpeed = 1000; // km/h
    const possibleDistance = (timeDiff / 3600000) * maxSpeed;
    
    return distance > possibleDistance;
  }
  
  // ブルートフォース検知
  private static async detectBruteForce(ipAddress: string): Promise<boolean> {
    const attempts = await redis.incr(`login_attempts:${ipAddress}`);
    await redis.expire(`login_attempts:${ipAddress}`, 900); // 15分
    
    return attempts > 5;
  }
  
  // 推奨アクション
  private static getRecommendedAction(riskScore: number): string {
    if (riskScore < 30) return 'ALLOW';
    if (riskScore < 60) return 'MFA_REQUIRED';
    if (riskScore < 80) return 'EMAIL_VERIFICATION';
    return 'BLOCK';
  }
}
```

## インシデントレスポンス

### 1. インシデント対応フロー

```typescript
// src/lib/security/incident-response.ts
export class IncidentResponse {
  // インシデント検知
  static async detectIncident(event: SecurityEvent): Promise<void> {
    const incident = await this.classifyIncident(event);
    
    if (incident.severity >= IncidentSeverity.MEDIUM) {
      await this.initiateResponse(incident);
    }
  }
  
  // インシデント分類
  private static async classifyIncident(
    event: SecurityEvent
  ): Promise<Incident> {
    const patterns = {
      dataBreatch: /unauthorized.*access.*data/i,
      accountTakeover: /multiple.*failed.*login/i,
      malware: /malicious.*file.*detected/i,
      ddos: /abnormal.*traffic.*pattern/i,
    };
    
    let type = IncidentType.UNKNOWN;
    let severity = IncidentSeverity.LOW;
    
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(event.details)) {
        type = key as IncidentType;
        break;
      }
    }
    
    // 重大度判定
    if (type === IncidentType.DATA_BREACH) {
      severity = IncidentSeverity.CRITICAL;
    } else if (type === IncidentType.ACCOUNT_TAKEOVER) {
      severity = IncidentSeverity.HIGH;
    }
    
    return {
      id: crypto.randomUUID(),
      type,
      severity,
      event,
      detectedAt: new Date(),
      status: IncidentStatus.DETECTED,
    };
  }
  
  // 対応開始
  private static async initiateResponse(incident: Incident): Promise<void> {
    // 1. 封じ込め
    await this.containIncident(incident);
    
    // 2. 通知
    await this.notifyStakeholders(incident);
    
    // 3. 証拠保全
    await this.preserveEvidence(incident);
    
    // 4. 根本原因分析
    await this.analyzeRootCause(incident);
    
    // 5. 復旧
    await this.recoverFromIncident(incident);
    
    // 6. レポート作成
    await this.generateReport(incident);
  }
  
  // 封じ込め
  private static async containIncident(incident: Incident): Promise<void> {
    switch (incident.type) {
      case IncidentType.DATA_BREACH:
        // アクセス遮断
        await this.revokeAccess(incident.event.userId);
        break;
      
      case IncidentType.ACCOUNT_TAKEOVER:
        // アカウントロック
        await this.lockAccount(incident.event.userId);
        break;
      
      case IncidentType.MALWARE:
        // ファイル隔離
        await this.quarantineFile(incident.event.details);
        break;
      
      case IncidentType.DDOS:
        // トラフィック制限
        await this.enableDDoSProtection();
        break;
    }
  }
  
  // ステークホルダー通知
  private static async notifyStakeholders(incident: Incident): Promise<void> {
    const stakeholders = this.getStakeholders(incident.severity);
    
    for (const stakeholder of stakeholders) {
      await this.sendNotification(stakeholder, incident);
    }
    
    // 規制当局への報告（必要に応じて）
    if (incident.type === IncidentType.DATA_BREACH) {
      await this.notifyRegulators(incident);
    }
  }
}
```

### 2. フォレンジック

```typescript
// src/lib/security/forensics.ts
export class Forensics {
  // 証拠収集
  static async collectEvidence(incidentId: string): Promise<Evidence> {
    const evidence = {
      incidentId,
      timestamp: new Date(),
      logs: await this.collectLogs(incidentId),
      memory: await this.captureMemory(),
      network: await this.captureNetworkTraffic(),
      files: await this.collectFiles(),
      database: await this.databaseSnapshot(),
    };
    
    // 証拠のハッシュ化（改ざん防止）
    evidence.hash = this.calculateHash(evidence);
    
    // 安全な保存
    await this.secureStore(evidence);
    
    return evidence;
  }
  
  // ログ収集
  private static async collectLogs(incidentId: string): Promise<LogData[]> {
    const timeRange = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間前
      end: new Date(),
    };
    
    return Promise.all([
      this.collectApplicationLogs(timeRange),
      this.collectSystemLogs(timeRange),
      this.collectSecurityLogs(timeRange),
      this.collectNetworkLogs(timeRange),
    ]).then(logs => logs.flat());
  }
  
  // タイムライン再構築
  static async reconstructTimeline(
    incidentId: string
  ): Promise<TimelineEntry[]> {
    const evidence = await this.getEvidence(incidentId);
    const timeline: TimelineEntry[] = [];
    
    // すべてのイベントを時系列で整理
    for (const log of evidence.logs) {
      timeline.push({
        timestamp: log.timestamp,
        source: log.source,
        event: log.message,
        severity: log.level,
        actor: log.userId || log.ipAddress,
      });
    }
    
    // ソート
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return timeline;
  }
}
```

## コンプライアンス

### 1. GDPR対応

```typescript
// src/lib/compliance/gdpr.ts
export class GDPRCompliance {
  // データポータビリティ
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        articles: true,
        comments: true,
        likes: true,
        bookmarks: true,
      },
    });
    
    return {
      profile: this.sanitizeUserData(user),
      content: {
        articles: user.articles,
        comments: user.comments,
      },
      activity: {
        likes: user.likes,
        bookmarks: user.bookmarks,
      },
      exportedAt: new Date(),
      format: 'JSON',
    };
  }
  
  // 忘れられる権利
  static async deleteUserData(userId: string): Promise<void> {
    // トランザクションで一括削除
    await prisma.$transaction(async (tx) => {
      // コンテンツの匿名化
      await tx.article.updateMany({
        where: { authorId: userId },
        data: {
          authorId: 'DELETED_USER',
          content: '[DELETED]',
        },
      });
      
      // 個人情報の削除
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@example.com`,
          displayName: '[DELETED USER]',
          bio: null,
          avatarUrl: null,
          deletedAt: new Date(),
        },
      });
      
      // ログの匿名化
      await tx.auditLog.updateMany({
        where: { userId },
        data: { userId: null },
      });
    });
    
    // キャッシュクリア
    await redis.del(`user:${userId}:*`);
  }
  
  // 同意管理
  static async updateConsent(
    userId: string,
    consents: ConsentUpdate
  ): Promise<void> {
    await prisma.userConsent.upsert({
      where: { userId },
      create: {
        userId,
        ...consents,
        consentedAt: new Date(),
      },
      update: {
        ...consents,
        updatedAt: new Date(),
      },
    });
  }
}
```

### 2. PCI DSS対応

```typescript
// src/lib/compliance/pci-dss.ts
export class PCIDSSCompliance {
  // カード情報の安全な処理
  static async processPayment(
    cardData: CardData
  ): Promise<PaymentResult> {
    // カード情報を直接扱わない（トークン化）
    const token = await this.tokenizeCard(cardData);
    
    // 決済処理
    const result = await paymentGateway.charge({
      token,
      amount: cardData.amount,
      currency: cardData.currency,
    });
    
    // 監査ログ
    await this.logPaymentActivity({
      token: token.substring(0, 6) + '****',
      amount: cardData.amount,
      result: result.status,
      timestamp: new Date(),
    });
    
    return result;
  }
  
  // トークン化
  private static async tokenizeCard(
    cardData: CardData
  ): Promise<string> {
    // 決済代行サービスのトークン化API使用
    return await paymentGateway.tokenize({
      number: cardData.number,
      exp: cardData.exp,
      cvc: cardData.cvc,
    });
  }
  
  // カード情報マスキング
  static maskCardNumber(cardNumber: string): string {
    // 最初の6桁と最後の4桁のみ表示
    return cardNumber.substring(0, 6) + 
           '******' + 
           cardNumber.substring(cardNumber.length - 4);
  }
}
```

## セキュリティテスト

### 1. ペネトレーションテスト

```typescript
// src/tests/security/penetration.test.ts
describe('Penetration Tests', () => {
  // SQLインジェクションテスト
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/search')
      .send({ query: maliciousInput });
    
    expect(response.status).toBe(200);
    
    // テーブルが削除されていないことを確認
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThan(0);
  });
  
  // XSSテスト
  it('should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/articles')
      .send({
        title: xssPayload,
        content: xssPayload,
      });
    
    const article = await prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    expect(article.title).not.toContain('<script>');
    expect(article.content).not.toContain('<script>');
  });
  
  // CSRF テスト
  it('should prevent CSRF attacks', async () => {
    const response = await request(app)
      .post('/api/user/delete')
      .set('Origin', 'http://evil.com')
      .send();
    
    expect(response.status).toBe(403);
  });
});
```

### 2. 脆弱性スキャン

```bash
#!/bin/bash
# vulnerability-scan.sh

# 依存関係の脆弱性チェック
npm audit --audit-level=moderate

# Dockerイメージスキャン
trivy image zenn-clone:latest

# OWASP ZAPスキャン
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://zenn-clone.dev \
  -r zap-report.html

# SQLMap（SQLインジェクションテスト）
sqlmap -u "https://zenn-clone.dev/api/search?q=test" \
  --batch --random-agent

# Nikto（Webサーバースキャン）
nikto -h https://zenn-clone.dev
```

## まとめ

この包括的なセキュリティアーキテクチャにより、Zennクローンアプリケーションは多層防御による強固なセキュリティを実現します。継続的なセキュリティテストと監視により、新たな脅威にも対応可能です。

---

*最終更新: 2025-09-05*