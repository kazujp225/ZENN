# デプロイメント戦略設計書

## 目次
1. [概要](#概要)
2. [デプロイメントアーキテクチャ](#デプロイメントアーキテクチャ)
3. [環境構成](#環境構成)
4. [CI/CDパイプライン](#cicdパイプライン)
5. [コンテナ戦略](#コンテナ戦略)
6. [インフラストラクチャ構成](#インフラストラクチャ構成)
7. [デプロイメント手順](#デプロイメント手順)
8. [監視・ロギング](#監視ロギング)
9. [災害復旧](#災害復旧)
10. [コスト最適化](#コスト最適化)

## 概要

### デプロイメント方針
- **Blue-Green Deployment**: ゼロダウンタイムデプロイ
- **Infrastructure as Code**: 完全自動化
- **Container-First**: Docker/Kubernetes中心
- **Multi-Cloud Ready**: ベンダーロックイン回避
- **GitOps**: Gitを信頼できる唯一の情報源として運用

### 対象環境
- 開発環境 (Development)
- ステージング環境 (Staging)
- 本番環境 (Production)
- DR環境 (Disaster Recovery)

## デプロイメントアーキテクチャ

### システム構成図

```mermaid
graph TB
    subgraph "Developer"
        DEV[Developer Machine]
        GIT[GitHub Repository]
    end
    
    subgraph "CI/CD"
        GHA[GitHub Actions]
        REG[Container Registry]
        ART[Artifact Storage]
    end
    
    subgraph "Cloud Infrastructure"
        subgraph "Production"
            LB[Load Balancer]
            K8S[Kubernetes Cluster]
            DB[(PostgreSQL)]
            REDIS[(Redis)]
            S3[S3 Storage]
        end
        
        subgraph "Edge"
            CDN[CloudFront CDN]
            WAF[Web Application Firewall]
        end
    end
    
    subgraph "Monitoring"
        PROM[Prometheus]
        GRAF[Grafana]
        ELK[ELK Stack]
    end
    
    DEV -->|Push| GIT
    GIT -->|Trigger| GHA
    GHA -->|Build| REG
    GHA -->|Deploy| K8S
    K8S -->|Pull| REG
    LB --> K8S
    CDN --> LB
    WAF --> CDN
    K8S --> DB
    K8S --> REDIS
    K8S --> S3
    K8S --> PROM
    PROM --> GRAF
    K8S --> ELK
```

### デプロイメントフロー

```mermaid
sequenceDiagram
    participant D as Developer
    participant G as GitHub
    participant CI as CI/CD
    participant R as Registry
    participant K as Kubernetes
    participant M as Monitoring
    
    D->>G: Push Code
    G->>CI: Trigger Pipeline
    CI->>CI: Run Tests
    CI->>CI: Build Image
    CI->>R: Push Image
    CI->>K: Deploy Manifest
    K->>R: Pull Image
    K->>K: Rolling Update
    K->>M: Send Metrics
    M-->>D: Alert if Issues
```

## 環境構成

### 1. 開発環境

```yaml
# environments/development/config.yaml
name: development
replicas: 1
resources:
  cpu: 500m
  memory: 1Gi
database:
  type: postgresql
  size: 10Gi
  backup: false
features:
  debug: true
  hotReload: true
  mockData: true
```

### 2. ステージング環境

```yaml
# environments/staging/config.yaml
name: staging
replicas: 2
resources:
  cpu: 1000m
  memory: 2Gi
database:
  type: postgresql
  size: 50Gi
  backup: daily
  replica: 1
features:
  debug: false
  monitoring: true
  loadTesting: true
```

### 3. 本番環境

```yaml
# environments/production/config.yaml
name: production
replicas: 
  min: 3
  max: 10
resources:
  cpu: 2000m
  memory: 4Gi
database:
  type: postgresql
  size: 500Gi
  backup: continuous
  replica: 2
  multiAZ: true
cdn:
  enabled: true
  locations: ["us-east-1", "eu-west-1", "ap-northeast-1"]
features:
  debug: false
  monitoring: true
  alerting: true
  autoscaling: true
```

## CI/CDパイプライン

### 1. GitHub Actions ワークフロー

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 1. コード品質チェック
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Format check
        run: npm run format:check

  # 2. セキュリティスキャン
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # 3. テスト実行
  test:
    runs-on: ubuntu-latest
    needs: [quality-check]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  # 4. ビルド
  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
            VERSION=${{ steps.meta.outputs.version }}

  # 5. デプロイ（開発環境）
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    needs: [build]
    environment: development
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_DEV }}" | base64 -d > kubeconfig
          export KUBECONFIG=$(pwd)/kubeconfig
      
      - name: Deploy to development
        run: |
          kubectl set image deployment/zenn-clone \
            zenn-clone=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:develop \
            -n development
          kubectl rollout status deployment/zenn-clone -n development

  # 6. デプロイ（ステージング）
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [build]
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: |
          helm upgrade --install zenn-clone ./charts/zenn-clone \
            --namespace staging \
            --set image.tag=${{ github.sha }} \
            --set environment=staging \
            --values ./charts/zenn-clone/values.staging.yaml

  # 7. デプロイ（本番）
  deploy-production:
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Blue-Green Deployment
        run: |
          # Blue環境にデプロイ
          kubectl apply -f k8s/production/blue-deployment.yaml
          kubectl set image deployment/zenn-clone-blue \
            zenn-clone=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.event.release.tag_name }} \
            -n production
          
          # ヘルスチェック
          kubectl wait --for=condition=available --timeout=300s \
            deployment/zenn-clone-blue -n production
          
          # トラフィック切り替え
          kubectl patch service zenn-clone -n production \
            -p '{"spec":{"selector":{"version":"blue"}}}'
          
          # Green環境を更新
          kubectl set image deployment/zenn-clone-green \
            zenn-clone=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.event.release.tag_name }} \
            -n production

  # 8. スモークテスト
  smoke-test:
    runs-on: ubuntu-latest
    needs: [deploy-production]
    if: github.event_name == 'release'
    
    steps:
      - name: Health check
        run: |
          curl -f https://api.zenn-clone.dev/health || exit 1
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          API_URL: https://api.zenn-clone.dev

  # 9. ロールバック（失敗時）
  rollback:
    if: failure() && github.event_name == 'release'
    runs-on: ubuntu-latest
    needs: [smoke-test]
    
    steps:
      - name: Rollback deployment
        run: |
          kubectl rollout undo deployment/zenn-clone -n production
          kubectl rollout status deployment/zenn-clone -n production
```

## コンテナ戦略

### 1. Dockerfile（マルチステージビルド）

```dockerfile
# Dockerfile
# ========================================
# ステージ1: 依存関係のインストール
# ========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 依存関係ファイルのコピー
COPY package.json package-lock.json ./
COPY prisma ./prisma

# 依存関係のインストール
RUN npm ci --only=production && \
    npm cache clean --force

# 開発用依存関係のインストール（ビルド用）
COPY package.json package-lock.json ./
RUN npm ci && \
    npm cache clean --force

# ========================================
# ステージ2: ビルド
# ========================================
FROM node:20-alpine AS builder
WORKDIR /app

# 依存関係のコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# Prismaクライアント生成
RUN npx prisma generate

# Next.jsビルド
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ========================================
# ステージ3: 実行環境
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

# セキュリティ: 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 環境変数
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 必要なファイルのコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# パーミッション設定
RUN chown -R nextjs:nodejs /app

# ユーザー切り替え
USER nextjs

# ポート公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# メタデータ
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.title="Zenn Clone" \
      org.opencontainers.image.description="Zenn Clone Application" \
      org.opencontainers.image.vendor="Zenn Clone Team"

# アプリケーション起動
CMD ["node", "server.js"]
```

### 2. Docker Compose（開発環境）

```yaml
# docker-compose.yml
version: '3.9'

services:
  # アプリケーション
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@db:5432/zennclone
      REDIS_URL: redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - zennclone

  # データベース
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: zennclone
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - zennclone

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - zennclone

  # Elasticsearch（開発用）
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - zennclone

  # MinIO（S3互換ストレージ）
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - zennclone

  # Mailhog（メール確認）
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - zennclone

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  minio_data:

networks:
  zennclone:
    driver: bridge
```

## インフラストラクチャ構成

### 1. Kubernetes マニフェスト

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zenn-clone
  namespace: production
  labels:
    app: zenn-clone
    version: green
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: zenn-clone
  template:
    metadata:
      labels:
        app: zenn-clone
        version: green
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - zenn-clone
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: zenn-clone
        image: ghcr.io/zenn-clone/zenn-clone:latest
        imagePullPolicy: Always
        
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: zenn-clone-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: zenn-clone-secrets
              key: redis-url
        - name: DD_AGENT_HOST
          valueFrom:
            fieldRef:
              fieldPath: status.hostIP
        
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
        
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
      
      volumes:
      - name: config
        configMap:
          name: zenn-clone-config
      
      imagePullSecrets:
      - name: ghcr-secret
```

### 2. Helm Chart

```yaml
# charts/zenn-clone/values.yaml
replicaCount: 3

image:
  repository: ghcr.io/zenn-clone/zenn-clone
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets:
  - name: ghcr-secret

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9090"

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001

securityContext:
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: zenn-clone.dev
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: zenn-clone-tls
      hosts:
        - zenn-clone.dev

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - zenn-clone
        topologyKey: kubernetes.io/hostname

postgresql:
  enabled: true
  auth:
    username: zennclone
    password: changeme
    database: zennclone
  primary:
    persistence:
      size: 100Gi
  readReplicas:
    replicaCount: 2

redis:
  enabled: true
  auth:
    enabled: true
    password: changeme
  master:
    persistence:
      size: 10Gi
  replica:
    replicaCount: 2
```

### 3. Terraform構成

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket         = "zenn-clone-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "zenn-clone-terraform-locks"
    encrypt        = true
  }
}

# VPC
module "vpc" {
  source = "./modules/vpc"
  
  cidr = "10.0.0.0/16"
  azs  = ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"]
  
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  
  tags = local.tags
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = "zenn-clone-cluster"
  cluster_version = "1.28"
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  
  node_groups = {
    general = {
      desired_capacity = 3
      min_capacity     = 3
      max_capacity     = 10
      
      instance_types = ["t3.large"]
      
      k8s_labels = {
        Environment = "production"
        NodeGroup   = "general"
      }
    }
  }
  
  tags = local.tags
}

# RDS (PostgreSQL)
module "rds" {
  source = "./modules/rds"
  
  identifier = "zenn-clone-db"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  database_name = "zennclone"
  username      = "zennclone"
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [module.eks.cluster_security_group_id]
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az               = true
  deletion_protection    = true
  
  tags = local.tags
}

# ElastiCache (Redis)
module "elasticache" {
  source = "./modules/elasticache"
  
  cluster_id = "zenn-clone-redis"
  
  engine         = "redis"
  engine_version = "7.0"
  node_type      = "cache.r6g.large"
  
  num_cache_nodes = 3
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [module.eks.cluster_security_group_id]
  
  snapshot_retention_limit = 7
  snapshot_window         = "03:00-04:00"
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  tags = local.tags
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  buckets = {
    assets = {
      name = "zenn-clone-assets"
      versioning = true
      lifecycle_rules = [
        {
          id     = "archive-old-versions"
          status = "Enabled"
          
          noncurrent_version_transitions = [
            {
              days          = 30
              storage_class = "STANDARD_IA"
            },
            {
              days          = 90
              storage_class = "GLACIER"
            }
          ]
        }
      ]
    }
    
    backups = {
      name = "zenn-clone-backups"
      versioning = true
      lifecycle_rules = [
        {
          id     = "delete-old-backups"
          status = "Enabled"
          
          expiration = {
            days = 90
          }
        }
      ]
    }
  }
  
  tags = local.tags
}

# CloudFront CDN
module "cloudfront" {
  source = "./modules/cloudfront"
  
  aliases = ["zenn-clone.dev", "www.zenn-clone.dev"]
  
  origin_domain_name = module.s3.bucket_regional_domain_name["assets"]
  
  default_cache_behavior = {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-assets"
    
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    default_ttl = 86400
    min_ttl     = 0
    max_ttl     = 31536000
  }
  
  price_class = "PriceClass_All"
  
  geo_restriction = {
    restriction_type = "none"
  }
  
  tags = local.tags
}

# WAF
module "waf" {
  source = "./modules/waf"
  
  name  = "zenn-clone-waf"
  scope = "CLOUDFRONT"
  
  rules = [
    {
      name     = "RateLimitRule"
      priority = 1
      
      rate_limit = {
        limit              = 2000
        aggregate_key_type = "IP"
      }
      
      action = "block"
    },
    {
      name     = "SQLiRule"
      priority = 2
      
      managed_rule_group = {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
      
      action = "block"
    }
  ]
  
  tags = local.tags
}

locals {
  tags = {
    Environment = "production"
    Project     = "zenn-clone"
    ManagedBy   = "terraform"
  }
}
```

## デプロイメント手順

### 1. 初回セットアップ

```bash
#!/bin/bash
# scripts/setup.sh

# 1. 必要なツールのインストール
echo "Installing required tools..."
brew install kubectl helm terraform awscli

# 2. クラスタの作成
echo "Creating Kubernetes cluster..."
cd infrastructure/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# 3. kubectl設定
echo "Configuring kubectl..."
aws eks update-kubeconfig --name zenn-clone-cluster --region ap-northeast-1

# 4. Namespaceの作成
echo "Creating namespaces..."
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace development

# 5. シークレットの作成
echo "Creating secrets..."
kubectl create secret generic zenn-clone-secrets \
  --from-literal=database-url="${DATABASE_URL}" \
  --from-literal=redis-url="${REDIS_URL}" \
  --from-literal=jwt-secret="${JWT_SECRET}" \
  -n production

# 6. Helmでのインストール
echo "Installing application with Helm..."
helm install zenn-clone ./charts/zenn-clone \
  --namespace production \
  --values ./charts/zenn-clone/values.production.yaml

# 7. Ingress Controllerのインストール
echo "Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# 8. Cert Managerのインストール
echo "Installing Cert Manager..."
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# 9. モニタリングスタックのインストール
echo "Installing monitoring stack..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

echo "Setup complete!"
```

### 2. デプロイメント実行

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# 引数チェック
if [ $# -ne 2 ]; then
  echo "Usage: $0 <environment> <version>"
  exit 1
fi

ENVIRONMENT=$1
VERSION=$2

echo "Deploying version $VERSION to $ENVIRONMENT..."

# 環境別の設定
case $ENVIRONMENT in
  development)
    NAMESPACE="development"
    REPLICAS=1
    ;;
  staging)
    NAMESPACE="staging"
    REPLICAS=2
    ;;
  production)
    NAMESPACE="production"
    REPLICAS=3
    ;;
  *)
    echo "Invalid environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Helmでデプロイ
helm upgrade --install zenn-clone ./charts/zenn-clone \
  --namespace $NAMESPACE \
  --set image.tag=$VERSION \
  --set replicaCount=$REPLICAS \
  --values ./charts/zenn-clone/values.$ENVIRONMENT.yaml \
  --wait \
  --timeout 10m

# デプロイメント確認
kubectl rollout status deployment/zenn-clone -n $NAMESPACE

# ヘルスチェック
./scripts/health-check.sh $ENVIRONMENT

echo "Deployment complete!"
```

## 監視・ロギング

### 1. Prometheus設定

```yaml
# monitoring/prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: zenn-clone-alerts
  namespace: monitoring
spec:
  groups:
  - name: zenn-clone
    interval: 30s
    rules:
    # 高CPU使用率
    - alert: HighCPUUsage
      expr: |
        (
          100 * (
            1 - avg by(pod) (
              rate(container_cpu_cfs_throttled_seconds_total{namespace="production"}[5m])
            )
          )
        ) > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage on {{ $labels.pod }}"
        description: "CPU usage is above 80% (current value: {{ $value }}%)"
    
    # 高メモリ使用率
    - alert: HighMemoryUsage
      expr: |
        (
          container_memory_usage_bytes{namespace="production"} /
          container_spec_memory_limit_bytes{namespace="production"}
        ) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage on {{ $labels.pod }}"
        description: "Memory usage is above 80% (current value: {{ $value }}%)"
    
    # Pod再起動
    - alert: PodRestartingTooOften
      expr: |
        rate(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} is restarting frequently"
        description: "Pod has restarted {{ $value }} times in the last 15 minutes"
    
    # API応答時間
    - alert: HighAPILatency
      expr: |
        histogram_quantile(
          0.95,
          sum(rate(http_request_duration_seconds_bucket{namespace="production"}[5m])) by (le)
        ) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High API latency"
        description: "95th percentile latency is above 1s (current value: {{ $value }}s)"
    
    # エラー率
    - alert: HighErrorRate
      expr: |
        sum(rate(http_requests_total{status=~"5.."}[5m])) /
        sum(rate(http_requests_total[5m])) > 0.01
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate"
        description: "Error rate is above 1% (current value: {{ $value }}%)"
```

### 2. Fluentdログ収集

```yaml
# monitoring/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: kube-system
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
        time_key time
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>
    
    <filter kubernetes.**>
      @type kubernetes_metadata
      @id filter_kube_metadata
      kubernetes_url "#{ENV['FLUENT_FILTER_KUBERNETES_URL'] || 'https://' + ENV.fetch('KUBERNETES_SERVICE_HOST') + ':' + ENV.fetch('KUBERNETES_SERVICE_PORT') + '/api'}"
      verify_ssl "#{ENV['KUBERNETES_VERIFY_SSL'] || true}"
      ca_file "#{ENV['KUBERNETES_CA_FILE']}"
      skip_labels "#{ENV['FLUENT_KUBERNETES_METADATA_SKIP_LABELS'] || 'false'}"
      skip_container_metadata "#{ENV['FLUENT_KUBERNETES_METADATA_SKIP_CONTAINER_METADATA'] || 'false'}"
      skip_master_url "#{ENV['FLUENT_KUBERNETES_METADATA_SKIP_MASTER_URL'] || 'false'}"
      skip_namespace_metadata "#{ENV['FLUENT_KUBERNETES_METADATA_SKIP_NAMESPACE_METADATA'] || 'false'}"
    </filter>
    
    <match **>
      @type elasticsearch
      @id out_es
      @log_level info
      include_tag_key true
      host "#{ENV['FLUENT_ELASTICSEARCH_HOST']}"
      port "#{ENV['FLUENT_ELASTICSEARCH_PORT']}"
      path "#{ENV['FLUENT_ELASTICSEARCH_PATH']}"
      scheme "#{ENV['FLUENT_ELASTICSEARCH_SCHEME'] || 'http'}"
      ssl_verify "#{ENV['FLUENT_ELASTICSEARCH_SSL_VERIFY'] || 'true'}"
      ssl_version "#{ENV['FLUENT_ELASTICSEARCH_SSL_VERSION'] || 'TLSv1_2'}"
      user "#{ENV['FLUENT_ELASTICSEARCH_USER'] || use_default}"
      password "#{ENV['FLUENT_ELASTICSEARCH_PASSWORD'] || use_default}"
      reload_connections "#{ENV['FLUENT_ELASTICSEARCH_RELOAD_CONNECTIONS'] || 'false'}"
      reconnect_on_error "#{ENV['FLUENT_ELASTICSEARCH_RECONNECT_ON_ERROR'] || 'true'}"
      reload_on_failure "#{ENV['FLUENT_ELASTICSEARCH_RELOAD_ON_FAILURE'] || 'true'}"
      log_es_400_reason "#{ENV['FLUENT_ELASTICSEARCH_LOG_ES_400_REASON'] || 'false'}"
      logstash_prefix "#{ENV['FLUENT_ELASTICSEARCH_LOGSTASH_PREFIX'] || 'logstash'}"
      logstash_dateformat "#{ENV['FLUENT_ELASTICSEARCH_LOGSTASH_DATEFORMAT'] || '%Y.%m.%d'}"
      logstash_format "#{ENV['FLUENT_ELASTICSEARCH_LOGSTASH_FORMAT'] || 'true'}"
      index_name "#{ENV['FLUENT_ELASTICSEARCH_LOGSTASH_INDEX_NAME'] || 'logstash'}"
      type_name "#{ENV['FLUENT_ELASTICSEARCH_LOGSTASH_TYPE_NAME'] || 'fluentd'}"
      include_timestamp "#{ENV['FLUENT_ELASTICSEARCH_INCLUDE_TIMESTAMP'] || 'false'}"
      template_name "#{ENV['FLUENT_ELASTICSEARCH_TEMPLATE_NAME'] || use_nil}"
      template_file "#{ENV['FLUENT_ELASTICSEARCH_TEMPLATE_FILE'] || use_nil}"
      template_overwrite "#{ENV['FLUENT_ELASTICSEARCH_TEMPLATE_OVERWRITE'] || use_default}"
      sniffer_class_name "#{ENV['FLUENT_SNIFFER_CLASS_NAME'] || 'Fluent::Plugin::ElasticsearchSimpleSniffer'}"
      request_timeout "#{ENV['FLUENT_ELASTICSEARCH_REQUEST_TIMEOUT'] || '5s'}"
      <buffer>
        flush_thread_count "#{ENV['FLUENT_ELASTICSEARCH_BUFFER_FLUSH_THREAD_COUNT'] || '8'}"
        flush_interval "#{ENV['FLUENT_ELASTICSEARCH_BUFFER_FLUSH_INTERVAL'] || '5s'}"
        chunk_limit_size "#{ENV['FLUENT_ELASTICSEARCH_BUFFER_CHUNK_LIMIT_SIZE'] || '2M'}"
        queue_limit_length "#{ENV['FLUENT_ELASTICSEARCH_BUFFER_QUEUE_LIMIT_LENGTH'] || '32'}"
        retry_max_interval "#{ENV['FLUENT_ELASTICSEARCH_BUFFER_RETRY_MAX_INTERVAL'] || '30'}"
        retry_forever true
      </buffer>
    </match>
```

## 災害復旧

### 1. バックアップ戦略

```bash
#!/bin/bash
# scripts/backup.sh

# データベースバックアップ
echo "Backing up database..."
kubectl exec -n production deployment/postgresql -- \
  pg_dump -U zennclone zennclone | \
  gzip > backup-db-$(date +%Y%m%d-%H%M%S).sql.gz

# アップロードファイルバックアップ
echo "Backing up files..."
aws s3 sync s3://zenn-clone-assets \
  s3://zenn-clone-backups/files-$(date +%Y%m%d)/

# Redisバックアップ
echo "Backing up Redis..."
kubectl exec -n production deployment/redis -- \
  redis-cli BGSAVE

# バックアップをS3に保存
aws s3 cp backup-*.gz s3://zenn-clone-backups/db/

echo "Backup complete!"
```

### 2. 復旧手順

```bash
#!/bin/bash
# scripts/restore.sh

# 引数チェック
if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-date>"
  exit 1
fi

BACKUP_DATE=$1

# データベース復旧
echo "Restoring database..."
aws s3 cp s3://zenn-clone-backups/db/backup-db-$BACKUP_DATE.sql.gz .
gunzip backup-db-$BACKUP_DATE.sql.gz
kubectl exec -i -n production deployment/postgresql -- \
  psql -U zennclone zennclone < backup-db-$BACKUP_DATE.sql

# ファイル復旧
echo "Restoring files..."
aws s3 sync s3://zenn-clone-backups/files-$BACKUP_DATE/ \
  s3://zenn-clone-assets/

echo "Restore complete!"
```

## コスト最適化

### 1. リソース最適化

```yaml
# cost-optimization/karpenter.yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: zenn-clone-provisioner
spec:
  # ノードプール設定
  requirements:
    - key: karpenter.sh/capacity-type
      operator: In
      values: ["spot", "on-demand"]
    - key: node.kubernetes.io/instance-type
      operator: In
      values:
        - t3.medium
        - t3.large
        - t3a.medium
        - t3a.large
  
  # スポットインスタンス優先
  limits:
    resources:
      cpu: 1000
      memory: 1000Gi
  
  # 自動スケールダウン
  ttlSecondsAfterEmpty: 30
  
  # コスト最適化
  providerRef:
    name: zenn-clone-nodepool
---
apiVersion: karpenter.k8s.aws/v1alpha1
kind: AWSNodeInstanceProfile
metadata:
  name: zenn-clone-nodepool
spec:
  instanceStorePolicy: RAID0
  userData: |
    #!/bin/bash
    /etc/eks/bootstrap.sh zenn-clone-cluster
```

### 2. スケジューリング最適化

```yaml
# cost-optimization/scheduler-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: scheduler-config
  namespace: kube-system
data:
  config.yaml: |
    apiVersion: kubescheduler.config.k8s.io/v1
    kind: KubeSchedulerConfiguration
    profiles:
    - schedulerName: cost-optimized
      plugins:
        preFilter:
          enabled:
          - name: NodeResourcesFit
          - name: NodePorts
        filter:
          enabled:
          - name: NodeUnschedulable
          - name: NodeResourcesFit
          - name: NodeName
          - name: NodePorts
          - name: NodeAffinity
          - name: VolumeRestrictions
          - name: NodeVolumeLimits
          - name: VolumeBinding
          - name: VolumeZone
          - name: PodTopologySpread
          - name: InterPodAffinity
        postFilter:
          enabled:
          - name: DefaultPreemption
        score:
          enabled:
          - name: NodeResourcesFit
            weight: 100
          - name: NodeAffinity
            weight: 10
          - name: PodTopologySpread
            weight: 50
          - name: InterPodAffinity
            weight: 10
          # コスト最適化スコアリング
          - name: LeastRequestedPriority
            weight: 100
          - name: BalancedResourceAllocation
            weight: 100
```

## まとめ

このデプロイメント戦略により、以下を実現します：

1. **自動化されたCI/CDパイプライン**
2. **ゼロダウンタイムデプロイメント**
3. **コンテナベースのスケーラブルなアーキテクチャ**
4. **包括的な監視とロギング**
5. **災害復旧計画**
6. **コスト最適化**

すべての環境で一貫性のある、信頼性の高いデプロイメントプロセスを提供します。

---

*最終更新: 2025-09-05*