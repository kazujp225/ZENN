# 環境変数・設定管理設計書

## 1. 概要

### 1.1 目的
Zennクローンアプリケーションにおける環境変数と設定管理の統一的な設計指針を定め、セキュリティ、保守性、スケーラビリティを確保した設定管理システムを構築する。

### 1.2 原則
- **Twelve-Factor App**: 環境変数による設定の外部化
- **Security by Design**: 機密情報の暗号化と最小権限の原則
- **DRY原則**: 設定の重複排除
- **型安全性**: TypeScriptによる設定値の型定義
- **環境分離**: 開発/ステージング/本番環境の明確な分離

### 1.3 対象環境
- **local**: ローカル開発環境
- **development**: 開発サーバー環境
- **staging**: ステージング環境
- **production**: 本番環境

## 2. アーキテクチャ

### 2.1 設定管理フロー

```mermaid
graph TB
    subgraph "Configuration Sources"
        ENV[Environment Variables]
        SEC[Secret Manager]
        CFG[Config Files]
        CLI[CLI Arguments]
    end
    
    subgraph "Configuration Layer"
        VAL[Validator]
        TRA[Transformer]
        MER[Merger]
    end
    
    subgraph "Application Layer"
        APP[Application]
        MOD[Modules]
        SVC[Services]
    end
    
    ENV --> VAL
    SEC --> VAL
    CFG --> VAL
    CLI --> VAL
    VAL --> TRA
    TRA --> MER
    MER --> APP
    APP --> MOD
    APP --> SVC
```

### 2.2 階層構造

```
configs/
├── base/                  # 基本設定
│   ├── app.config.ts     # アプリケーション設定
│   ├── database.config.ts # データベース設定
│   ├── auth.config.ts    # 認証設定
│   └── services.config.ts # サービス設定
├── environments/          # 環境別設定
│   ├── local.ts
│   ├── development.ts
│   ├── staging.ts
│   └── production.ts
├── schemas/              # 設定スキーマ
│   └── config.schema.ts
├── validators/           # バリデーター
│   └── config.validator.ts
└── index.ts             # エントリーポイント
```

## 3. 環境変数定義

### 3.1 システム環境変数

```env
# .env.example

# ===========================
# System Configuration
# ===========================
NODE_ENV=development
APP_NAME=zenn-clone
APP_VERSION=1.0.0
APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api
PORT=3000
HOST=0.0.0.0

# ===========================
# Security
# ===========================
APP_SECRET=your-app-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ===========================
# Database
# ===========================
DATABASE_URL=postgresql://user:password@localhost:5432/zenn_clone
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false
DATABASE_LOGGING=true
DATABASE_SYNCHRONIZE=false
DATABASE_MIGRATIONS_RUN=true

# ===========================
# Redis Cache
# ===========================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=zenn:
REDIS_TTL=300

# ===========================
# Elasticsearch
# ===========================
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_PREFIX=zenn_

# ===========================
# AWS Services
# ===========================
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=zenn-clone-uploads
AWS_S3_REGION=ap-northeast-1
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net

# ===========================
# OAuth Providers
# ===========================
# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback/github

# Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

# ===========================
# Email Service
# ===========================
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@zenn-clone.com
EMAIL_FROM_NAME=Zenn Clone
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-smtp-password
SMTP_SECURE=false

# ===========================
# Payment (Stripe)
# ===========================
STRIPE_PUBLIC_KEY=pk_test_your-public-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ===========================
# Analytics
# ===========================
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token
SENTRY_DSN=https://your-key@sentry.io/your-project

# ===========================
# Feature Flags
# ===========================
FEATURE_COMMENTS=true
FEATURE_BOOKS=true
FEATURE_SCRAPS=true
FEATURE_PAYMENT=false
FEATURE_ANALYTICS=true

# ===========================
# Rate Limiting
# ===========================
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false
RATE_LIMIT_SKIP_FAILED_REQUESTS=false

# ===========================
# Logging
# ===========================
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_PRETTY=true
LOG_FILE_PATH=./logs/app.log
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m

# ===========================
# Monitoring
# ===========================
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3001
ELASTIC_APM_SERVICE_NAME=zenn-clone
ELASTIC_APM_SERVER_URL=http://localhost:8200
ELASTIC_APM_SECRET_TOKEN=your-apm-token

# ===========================
# Development Only
# ===========================
DEBUG=zenn:*
MOCK_ENABLED=false
HOT_RELOAD=true
```

### 3.2 環境別設定ファイル

```typescript
// configs/environments/production.ts
export const productionConfig = {
  app: {
    name: process.env.APP_NAME || 'Zenn Clone',
    env: 'production',
    debug: false,
    url: process.env.APP_URL || 'https://zenn-clone.com',
    apiUrl: process.env.API_URL || 'https://api.zenn-clone.com',
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || ['https://zenn-clone.com'],
      credentials: true,
    },
  },
  
  security: {
    bcryptRounds: 12,
    jwtExpiresIn: '1d',
    refreshTokenExpiresIn: '7d',
    csrfEnabled: true,
    helmetEnabled: true,
  },
  
  database: {
    logging: false,
    synchronize: false,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_CA_CERT,
    },
  },
  
  redis: {
    tls: {
      rejectUnauthorized: true,
    },
  },
  
  features: {
    maintenance: false,
    readOnly: false,
  },
};
```

## 4. 設定管理実装

### 4.1 設定スキーマ定義

```typescript
// configs/schemas/config.schema.ts
import { z } from 'zod';

export const AppConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  env: z.enum(['local', 'development', 'staging', 'production']),
  debug: z.boolean(),
  url: z.string().url(),
  apiUrl: z.string().url(),
});

export const DatabaseConfigSchema = z.object({
  url: z.string(),
  pool: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  ssl: z.boolean(),
  logging: z.boolean(),
  synchronize: z.boolean(),
  migrationsRun: z.boolean(),
});

export const RedisConfigSchema = z.object({
  url: z.string(),
  password: z.string().optional(),
  db: z.number().min(0).max(15),
  keyPrefix: z.string(),
  ttl: z.number().positive(),
});

export const AuthConfigSchema = z.object({
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string(),
    algorithm: z.enum(['HS256', 'HS384', 'HS512', 'RS256']),
  }),
  oauth: z.object({
    github: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
      callbackUrl: z.string().url(),
    }).optional(),
    google: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
      callbackUrl: z.string().url(),
    }).optional(),
  }),
  session: z.object({
    secret: z.string().min(32),
    maxAge: z.number().positive(),
    secure: z.boolean(),
    sameSite: z.enum(['lax', 'strict', 'none']),
  }),
});

export const ConfigSchema = z.object({
  app: AppConfigSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  auth: AuthConfigSchema,
});

export type Config = z.infer<typeof ConfigSchema>;
```

### 4.2 設定ローダー

```typescript
// configs/config.loader.ts
import dotenv from 'dotenv';
import { z } from 'zod';
import { ConfigSchema } from './schemas/config.schema';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Config;
  private envPath: string;

  private constructor() {
    this.loadEnvironment();
    this.validateAndLoadConfig();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadEnvironment(): void {
    const env = process.env.NODE_ENV || 'development';
    
    // 基本の.envファイル
    this.envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(this.envPath)) {
      dotenv.config({ path: this.envPath });
    }

    // 環境別の.envファイル
    const envSpecificPath = path.resolve(process.cwd(), `.env.${env}`);
    if (fs.existsSync(envSpecificPath)) {
      dotenv.config({ path: envSpecificPath, override: true });
    }

    // ローカルの.envファイル（gitignore対象）
    const localPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(localPath)) {
      dotenv.config({ path: localPath, override: true });
    }
  }

  private validateAndLoadConfig(): void {
    const rawConfig = this.buildRawConfig();
    
    try {
      this.config = ConfigSchema.parse(rawConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Configuration validation failed:');
        error.errors.forEach(err => {
          console.error(`  ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
      }
      throw error;
    }
  }

  private buildRawConfig(): any {
    return {
      app: {
        name: process.env.APP_NAME,
        version: process.env.APP_VERSION,
        env: process.env.NODE_ENV,
        debug: process.env.DEBUG === 'true',
        url: process.env.APP_URL,
        apiUrl: process.env.API_URL,
      },
      database: {
        url: process.env.DATABASE_URL,
        pool: {
          min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
          max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
        },
        ssl: process.env.DATABASE_SSL === 'true',
        logging: process.env.DATABASE_LOGGING === 'true',
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
        migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
      },
      redis: {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'zenn:',
        ttl: parseInt(process.env.REDIS_TTL || '300', 10),
      },
      auth: {
        jwt: {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
          algorithm: 'HS256',
        },
        oauth: {
          github: process.env.GITHUB_CLIENT_ID ? {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackUrl: process.env.GITHUB_CALLBACK_URL,
          } : undefined,
          google: process.env.GOOGLE_CLIENT_ID ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL,
          } : undefined,
        },
        session: {
          secret: process.env.APP_SECRET,
          maxAge: 86400000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      },
    };
  }

  getConfig(): Config {
    return this.config;
  }

  get<T>(path: string): T | undefined {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config as any);
  }
}
```

### 4.3 型安全な設定アクセス

```typescript
// configs/index.ts
import { ConfigLoader } from './config.loader';

const loader = ConfigLoader.getInstance();
const config = loader.getConfig();

// 型安全なエクスポート
export const appConfig = config.app;
export const databaseConfig = config.database;
export const redisConfig = config.redis;
export const authConfig = config.auth;

// ヘルパー関数
export function getConfig<T>(path: string): T | undefined {
  return loader.get<T>(path);
}

export function isProduction(): boolean {
  return config.app.env === 'production';
}

export function isDevelopment(): boolean {
  return config.app.env === 'development';
}

export function isStaging(): boolean {
  return config.app.env === 'staging';
}

export function isLocal(): boolean {
  return config.app.env === 'local';
}

// 環境変数のリロード（開発時のみ）
export function reloadConfig(): void {
  if (!isProduction()) {
    ConfigLoader['instance'] = null;
    ConfigLoader.getInstance();
  }
}
```

## 5. シークレット管理

### 5.1 AWS Secrets Manager統合

```typescript
// services/secrets/aws-secrets-manager.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export class AWSSecretsManager {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: string; expiry: number }> = new Map();
  private readonly cacheTTL = 3600000; // 1 hour

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
    });
  }

  async getSecret(secretName: string): Promise<string> {
    // キャッシュチェック
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: 'AWSCURRENT',
        })
      );

      const secretValue = response.SecretString || '';
      
      // キャッシュに保存
      this.cache.set(secretName, {
        value: secretValue,
        expiry: Date.now() + this.cacheTTL,
      });

      return secretValue;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw error;
    }
  }

  async getSecretJson<T>(secretName: string): Promise<T> {
    const secretString = await this.getSecret(secretName);
    return JSON.parse(secretString) as T;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### 5.2 HashiCorp Vault統合

```typescript
// services/secrets/vault.service.ts
import vault from 'node-vault';

export class VaultService {
  private client: any;

  constructor() {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
      token: process.env.VAULT_TOKEN,
    });
  }

  async getSecret(path: string): Promise<any> {
    try {
      const result = await this.client.read(path);
      return result.data;
    } catch (error) {
      console.error(`Failed to read secret from ${path}:`, error);
      throw error;
    }
  }

  async writeSecret(path: string, data: any): Promise<void> {
    try {
      await this.client.write(path, data);
    } catch (error) {
      console.error(`Failed to write secret to ${path}:`, error);
      throw error;
    }
  }

  async deleteSecret(path: string): Promise<void> {
    try {
      await this.client.delete(path);
    } catch (error) {
      console.error(`Failed to delete secret at ${path}:`, error);
      throw error;
    }
  }

  async listSecrets(path: string): Promise<string[]> {
    try {
      const result = await this.client.list(path);
      return result.data.keys;
    } catch (error) {
      console.error(`Failed to list secrets at ${path}:`, error);
      throw error;
    }
  }
}
```

## 6. 機能フラグ管理

### 6.1 機能フラグ定義

```typescript
// configs/feature-flags.ts
export interface FeatureFlags {
  comments: boolean;
  books: boolean;
  scraps: boolean;
  payment: boolean;
  analytics: boolean;
  darkMode: boolean;
  aiFeatures: boolean;
  betaFeatures: boolean;
  maintenanceMode: boolean;
}

export class FeatureFlagManager {
  private flags: FeatureFlags;
  private userOverrides: Map<string, Partial<FeatureFlags>> = new Map();

  constructor() {
    this.loadFlags();
  }

  private loadFlags(): void {
    this.flags = {
      comments: process.env.FEATURE_COMMENTS === 'true',
      books: process.env.FEATURE_BOOKS === 'true',
      scraps: process.env.FEATURE_SCRAPS === 'true',
      payment: process.env.FEATURE_PAYMENT === 'true',
      analytics: process.env.FEATURE_ANALYTICS === 'true',
      darkMode: process.env.FEATURE_DARK_MODE === 'true',
      aiFeatures: process.env.FEATURE_AI === 'true',
      betaFeatures: process.env.FEATURE_BETA === 'true',
      maintenanceMode: process.env.FEATURE_MAINTENANCE === 'true',
    };
  }

  isEnabled(feature: keyof FeatureFlags, userId?: string): boolean {
    // メンテナンスモードチェック
    if (this.flags.maintenanceMode && feature !== 'maintenanceMode') {
      return false;
    }

    // ユーザー固有のオーバーライド
    if (userId) {
      const overrides = this.userOverrides.get(userId);
      if (overrides && feature in overrides) {
        return overrides[feature]!;
      }
    }

    return this.flags[feature];
  }

  setUserOverride(userId: string, feature: keyof FeatureFlags, enabled: boolean): void {
    const overrides = this.userOverrides.get(userId) || {};
    overrides[feature] = enabled;
    this.userOverrides.set(userId, overrides);
  }

  getAllFlags(userId?: string): FeatureFlags {
    if (userId) {
      const overrides = this.userOverrides.get(userId) || {};
      return { ...this.flags, ...overrides };
    }
    return this.flags;
  }

  // A/Bテスト用のパーセンテージベースの機能フラグ
  isEnabledForPercentage(feature: keyof FeatureFlags, percentage: number, identifier: string): boolean {
    if (!this.flags[feature]) {
      return false;
    }

    const hash = this.hashString(identifier + feature);
    const bucket = hash % 100;
    return bucket < percentage;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

### 6.2 React向け機能フラグフック

```tsx
// hooks/useFeatureFlag.ts
import { useEffect, useState } from 'react';
import { FeatureFlags } from '@/configs/feature-flags';

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/feature-flags')
      .then(res => res.json())
      .then(flags => {
        setIsEnabled(flags[feature] || false);
      })
      .catch(error => {
        console.error('Failed to fetch feature flags:', error);
        setIsEnabled(false);
      });
  }, [feature]);

  return isEnabled;
}

// コンポーネントでの使用例
export function ExampleComponent() {
  const isPaymentEnabled = useFeatureFlag('payment');
  const isDarkModeEnabled = useFeatureFlag('darkMode');

  return (
    <div>
      {isPaymentEnabled && <PaymentSection />}
      {isDarkModeEnabled && <DarkModeToggle />}
    </div>
  );
}
```

## 7. 設定の暗号化

### 7.1 暗号化ユーティリティ

```typescript
// utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(encryptionKey: string) {
    // 32バイトのキーを生成
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // 環境変数の暗号化
  encryptEnvValue(value: string): string {
    return `ENC[${this.encrypt(value)}]`;
  }

  // 環境変数の復号化
  decryptEnvValue(value: string): string {
    if (value.startsWith('ENC[') && value.endsWith(']')) {
      const encrypted = value.slice(4, -1);
      return this.decrypt(encrypted);
    }
    return value;
  }
}
```

### 7.2 暗号化された設定の処理

```typescript
// configs/encrypted-config.loader.ts
import { EncryptionService } from '@/utils/encryption';

export class EncryptedConfigLoader {
  private encryption: EncryptionService;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY is required for encrypted configs');
    }
    this.encryption = new EncryptionService(encryptionKey);
  }

  loadEncryptedEnv(): void {
    Object.keys(process.env).forEach(key => {
      const value = process.env[key];
      if (value && value.startsWith('ENC[')) {
        try {
          process.env[key] = this.encryption.decryptEnvValue(value);
        } catch (error) {
          console.error(`Failed to decrypt ${key}:`, error);
          throw new Error(`Failed to decrypt configuration: ${key}`);
        }
      }
    });
  }

  // 設定ファイルの暗号化
  async encryptConfigFile(inputPath: string, outputPath: string): Promise<void> {
    const fs = require('fs').promises;
    const content = await fs.readFile(inputPath, 'utf8');
    const config = JSON.parse(content);
    
    const encryptedConfig = this.encryptObject(config);
    
    await fs.writeFile(
      outputPath,
      JSON.stringify(encryptedConfig, null, 2),
      'utf8'
    );
  }

  private encryptObject(obj: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.shouldEncrypt(key)) {
        result[key] = this.encryption.encryptEnvValue(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.encryptObject(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  private shouldEncrypt(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'secret',
      'key',
      'token',
      'credential',
      'private',
    ];
    
    const lowerKey = key.toLowerCase();
    return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
  }
}
```

## 8. 設定の検証とテスト

### 8.1 設定バリデーター

```typescript
// validators/config.validator.ts
import { z } from 'zod';

export class ConfigValidator {
  private errors: string[] = [];

  validate(): boolean {
    this.errors = [];
    
    this.validateRequired();
    this.validateFormat();
    this.validateRanges();
    this.validateDependencies();
    this.validateSecurity();
    
    if (this.errors.length > 0) {
      console.error('Configuration validation failed:');
      this.errors.forEach(error => console.error(`  - ${error}`));
      return false;
    }
    
    return true;
  }

  private validateRequired(): void {
    const required = [
      'NODE_ENV',
      'APP_SECRET',
      'DATABASE_URL',
      'JWT_SECRET',
    ];
    
    required.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`Required environment variable ${key} is not set`);
      }
    });
  }

  private validateFormat(): void {
    // URL検証
    if (process.env.APP_URL && !this.isValidUrl(process.env.APP_URL)) {
      this.errors.push('APP_URL is not a valid URL');
    }
    
    // Email検証
    if (process.env.EMAIL_FROM && !this.isValidEmail(process.env.EMAIL_FROM)) {
      this.errors.push('EMAIL_FROM is not a valid email address');
    }
    
    // ポート番号検証
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        this.errors.push('PORT must be a number between 1 and 65535');
      }
    }
  }

  private validateRanges(): void {
    // プールサイズ検証
    const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '2', 10);
    const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);
    
    if (poolMin > poolMax) {
      this.errors.push('DATABASE_POOL_MIN cannot be greater than DATABASE_POOL_MAX');
    }
    
    // TTL検証
    const ttl = parseInt(process.env.REDIS_TTL || '300', 10);
    if (ttl < 0) {
      this.errors.push('REDIS_TTL must be a positive number');
    }
  }

  private validateDependencies(): void {
    // OAuth設定の依存関係
    if (process.env.GITHUB_CLIENT_ID && !process.env.GITHUB_CLIENT_SECRET) {
      this.errors.push('GITHUB_CLIENT_SECRET is required when GITHUB_CLIENT_ID is set');
    }
    
    // AWS設定の依存関係
    if (process.env.AWS_S3_BUCKET && !process.env.AWS_ACCESS_KEY_ID) {
      this.errors.push('AWS_ACCESS_KEY_ID is required when AWS_S3_BUCKET is set');
    }
  }

  private validateSecurity(): void {
    // シークレットの長さ検証
    if (process.env.APP_SECRET && process.env.APP_SECRET.length < 32) {
      this.errors.push('APP_SECRET must be at least 32 characters long');
    }
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      this.errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    // Production環境でのセキュリティ設定
    if (process.env.NODE_ENV === 'production') {
      if (process.env.DATABASE_SSL !== 'true') {
        this.errors.push('DATABASE_SSL should be enabled in production');
      }
      
      if (!process.env.HTTPS_ENABLED || process.env.HTTPS_ENABLED !== 'true') {
        this.errors.push('HTTPS should be enabled in production');
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

### 8.2 設定テスト

```typescript
// tests/config.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConfigLoader } from '@/configs/config.loader';
import { ConfigValidator } from '@/validators/config.validator';

describe('Configuration Tests', () => {
  beforeEach(() => {
    // テスト用の環境変数をセット
    process.env.NODE_ENV = 'test';
    process.env.APP_SECRET = 'test-secret-key-minimum-32-characters';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters';
  });

  describe('ConfigLoader', () => {
    it('should load configuration successfully', () => {
      const loader = ConfigLoader.getInstance();
      const config = loader.getConfig();
      
      expect(config).toBeDefined();
      expect(config.app).toBeDefined();
      expect(config.database).toBeDefined();
    });

    it('should get nested configuration values', () => {
      const loader = ConfigLoader.getInstance();
      const jwtSecret = loader.get<string>('auth.jwt.secret');
      
      expect(jwtSecret).toBe('test-jwt-secret-minimum-32-characters');
    });

    it('should handle missing configuration gracefully', () => {
      const loader = ConfigLoader.getInstance();
      const missing = loader.get<string>('non.existent.path');
      
      expect(missing).toBeUndefined();
    });
  });

  describe('ConfigValidator', () => {
    it('should validate required environment variables', () => {
      const validator = new ConfigValidator();
      const isValid = validator.validate();
      
      expect(isValid).toBe(true);
    });

    it('should fail validation for missing required variables', () => {
      delete process.env.JWT_SECRET;
      
      const validator = new ConfigValidator();
      const isValid = validator.validate();
      
      expect(isValid).toBe(false);
    });

    it('should validate URL formats', () => {
      process.env.APP_URL = 'not-a-valid-url';
      
      const validator = new ConfigValidator();
      const isValid = validator.validate();
      
      expect(isValid).toBe(false);
    });
  });
});
```

## 9. 動的設定更新

### 9.1 設定ウォッチャー

```typescript
// services/config-watcher.service.ts
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigWatcher extends EventEmitter {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private configCache: Map<string, any> = new Map();

  watch(configPath: string): void {
    if (this.watchers.has(configPath)) {
      return;
    }

    const watcher = fs.watch(configPath, (eventType, filename) => {
      if (eventType === 'change') {
        this.handleConfigChange(configPath, filename);
      }
    });

    this.watchers.set(configPath, watcher);
  }

  private handleConfigChange(configPath: string, filename: string | null): void {
    console.log(`Configuration change detected: ${filename}`);
    
    try {
      const newConfig = this.loadConfig(configPath);
      const oldConfig = this.configCache.get(configPath);
      
      if (JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
        this.configCache.set(configPath, newConfig);
        this.emit('configChanged', {
          path: configPath,
          filename,
          oldConfig,
          newConfig,
        });
      }
    } catch (error) {
      console.error(`Failed to reload configuration: ${error}`);
      this.emit('configError', error);
    }
  }

  private loadConfig(configPath: string): any {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  }

  stopWatching(configPath?: string): void {
    if (configPath) {
      const watcher = this.watchers.get(configPath);
      if (watcher) {
        watcher.close();
        this.watchers.delete(configPath);
      }
    } else {
      this.watchers.forEach(watcher => watcher.close());
      this.watchers.clear();
    }
  }
}
```

### 9.2 設定リロードAPI

```typescript
// controllers/config.controller.ts
import { Request, Response } from 'express';
import { ConfigLoader } from '@/configs/config.loader';
import { ConfigValidator } from '@/validators/config.validator';

export class ConfigController {
  async reloadConfig(req: Request, res: Response): Promise<void> {
    try {
      // 認証チェック（管理者のみ）
      if (!req.user?.isAdmin) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // バリデーション
      const validator = new ConfigValidator();
      if (!validator.validate()) {
        res.status(400).json({ 
          error: 'Configuration validation failed',
          details: validator.getErrors(),
        });
        return;
      }

      // 設定リロード
      reloadConfig();

      // キャッシュクリア
      await this.clearCaches();

      // 関連サービスの再起動
      await this.restartServices();

      res.json({ 
        success: true,
        message: 'Configuration reloaded successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Configuration reload failed:', error);
      res.status(500).json({ 
        error: 'Failed to reload configuration',
        details: error.message,
      });
    }
  }

  private async clearCaches(): Promise<void> {
    // Redis キャッシュクリア
    // メモリキャッシュクリア
    // CDN キャッシュパージ
  }

  private async restartServices(): Promise<void> {
    // 必要に応じてサービスを再起動
  }
}
```

## 10. 設定のドキュメンテーション

### 10.1 設定ドキュメント生成

```typescript
// scripts/generate-config-docs.ts
import * as fs from 'fs';
import * as path from 'path';

interface ConfigDocEntry {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
  example?: string;
}

export function generateConfigDocs(): void {
  const configs: ConfigDocEntry[] = [
    {
      name: 'NODE_ENV',
      type: 'string',
      required: true,
      default: 'development',
      description: 'Application environment',
      example: 'production',
    },
    {
      name: 'APP_URL',
      type: 'string',
      required: true,
      description: 'Application URL',
      example: 'https://zenn-clone.com',
    },
    // ... 他の設定項目
  ];

  const markdown = generateMarkdown(configs);
  const outputPath = path.join(process.cwd(), 'docs', 'configuration.md');
  
  fs.writeFileSync(outputPath, markdown, 'utf8');
  console.log(`Configuration documentation generated: ${outputPath}`);
}

function generateMarkdown(configs: ConfigDocEntry[]): string {
  let md = '# Configuration Reference\n\n';
  md += 'This document describes all available configuration options.\n\n';
  
  const categories = groupByCategory(configs);
  
  for (const [category, items] of Object.entries(categories)) {
    md += `## ${category}\n\n`;
    md += '| Name | Type | Required | Default | Description |\n';
    md += '|------|------|----------|---------|-------------|\n';
    
    for (const item of items) {
      const required = item.required ? '✓' : '';
      const defaultVal = item.default || '-';
      md += `| \`${item.name}\` | ${item.type} | ${required} | ${defaultVal} | ${item.description} |\n`;
    }
    
    md += '\n';
  }
  
  return md;
}

function groupByCategory(configs: ConfigDocEntry[]): Record<string, ConfigDocEntry[]> {
  const categories: Record<string, ConfigDocEntry[]> = {};
  
  for (const config of configs) {
    const category = getCategory(config.name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(config);
  }
  
  return categories;
}

function getCategory(name: string): string {
  if (name.startsWith('DATABASE_')) return 'Database';
  if (name.startsWith('REDIS_')) return 'Redis Cache';
  if (name.startsWith('AWS_')) return 'AWS Services';
  if (name.startsWith('EMAIL_')) return 'Email';
  if (name.startsWith('FEATURE_')) return 'Feature Flags';
  return 'General';
}
```

## 11. 設定管理のベストプラクティス

### 11.1 開発ワークフロー

```bash
# 1. 環境変数テンプレートから開始
cp .env.example .env.local

# 2. ローカル設定をカスタマイズ
nano .env.local

# 3. 設定の検証
npm run config:validate

# 4. 暗号化が必要な場合
npm run config:encrypt

# 5. 設定のドキュメント更新
npm run config:docs
```

### 11.2 セキュリティチェックリスト

- [ ] 機密情報は環境変数で管理
- [ ] 本番環境の設定は暗号化
- [ ] シークレットは定期的にローテーション
- [ ] 設定ファイルはgitignoreに追加
- [ ] 最小権限の原則を適用
- [ ] 監査ログを有効化
- [ ] バックアップとリカバリー手順を文書化

### 11.3 トラブルシューティング

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| 設定が読み込まれない | 環境変数未設定 | .envファイルの確認 |
| 型エラー | スキーマ不一致 | バリデーション実行 |
| 暗号化エラー | キー不一致 | ENCRYPTION_KEY確認 |
| リロード失敗 | 権限不足 | 管理者権限で実行 |

---

*最終更新: 2025-09-05*
*バージョン: 1.0.0*