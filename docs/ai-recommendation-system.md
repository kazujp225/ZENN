# AIレコメンデーションシステム設計書

## 1. 概要

### 1.1 目的
ZennクローンにおけるAI駆動のパーソナライズされたコンテンツ推薦システムを構築し、ユーザーエンゲージメントを向上させる。

### 1.2 配置設計
「For you」タブの右隣に「🤖 AI Picks」タブを配置し、機械学習ベースの高度な推薦機能を提供する。

### 1.3 推薦の種類
- **パーソナライズ記事**: ユーザーの興味に基づく記事推薦
- **スキルベース**: 学習レベルに応じた書籍・記事
- **トレンド予測**: 話題になりそうなコンテンツ
- **関連コンテンツ**: 読了記事に関連する推薦
- **キャリア支援**: 職種・経験に基づく推薦

## 2. UI/UX設計

### 2.1 タブ構成

```tsx
// components/Home/ContentTabs.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  User, 
  Bot, 
  Book, 
  MessageSquare,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

export const ContentTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');

  const tabs = [
    {
      id: 'trending',
      label: 'トレンド',
      icon: TrendingUp,
      description: '話題のコンテンツ',
    },
    {
      id: 'personalized',
      label: 'あなた向け',
      icon: User,
      description: 'パーソナライズ',
      requiresAuth: true,
    },
    {
      id: 'ai-picks',
      label: '🤖 AI厳選',
      icon: Bot,
      description: 'AI推薦',
      requiresAuth: true,
      badge: 'NEW',
    },
    {
      id: 'articles',
      label: '記事',
      icon: FileText,
      description: 'すべての記事',
    },
    {
      id: 'books',
      label: '本',
      icon: Book,
      description: '書籍',
    },
    {
      id: 'scraps',
      label: 'スクラップ',
      icon: MessageSquare,
      description: 'ディスカッション',
    },
  ];

  return (
    <div className="content-tabs">
      <div className="tabs-container">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              title={tab.description}
            >
              <Icon size={18} />
              <span className="tab-label">{tab.label}</span>
              {tab.badge && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === 'trending' && <TrendingContent />}
        {activeTab === 'personalized' && <PersonalizedContent />}
        {activeTab === 'ai-picks' && <AIPicksContent />}
        {activeTab === 'articles' && <ArticlesContent />}
        {activeTab === 'books' && <BooksContent />}
        {activeTab === 'scraps' && <ScrapsContent />}
      </div>
    </div>
  );
};
```

### 2.2 AI Picksタブの詳細設計

```tsx
// components/Home/AIPicksContent.tsx
import React, { useState } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Lightbulb,
  Star,
  Clock,
  ArrowRight 
} from 'lucide-react';

export const AIPicksContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('personalized');
  
  const categories = [
    {
      id: 'personalized',
      name: 'あなた向け',
      icon: Target,
      description: 'プロフィールと読書履歴から厳選',
    },
    {
      id: 'skill-growth',
      name: 'スキルアップ',
      icon: TrendingUp,
      description: '現在のレベルから次のステップ',
    },
    {
      id: 'trending-prediction',
      name: 'トレンド予測',
      icon: Brain,
      description: 'AIが予測する話題のコンテンツ',
    },
    {
      id: 'reading-path',
      name: '学習パス',
      icon: BookOpen,
      description: '体系的な学習コース',
    },
    {
      id: 'discovery',
      name: '新発見',
      icon: Lightbulb,
      description: '新しい分野への提案',
    },
  ];

  return (
    <div className="ai-picks-content">
      <div className="ai-picks-header">
        <div className="header-title">
          <Bot size={24} className="ai-icon" />
          <div>
            <h2>AI Picks</h2>
            <p>機械学習があなたに最適なコンテンツを厳選</p>
          </div>
        </div>
        
        <AIInsights />
      </div>

      <div className="category-selector">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <Icon size={20} />
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="recommendations-container">
        {selectedCategory === 'personalized' && <PersonalizedRecommendations />}
        {selectedCategory === 'skill-growth' && <SkillGrowthRecommendations />}
        {selectedCategory === 'trending-prediction' && <TrendingPredictions />}
        {selectedCategory === 'reading-path' && <ReadingPaths />}
        {selectedCategory === 'discovery' && <DiscoveryRecommendations />}
      </div>
    </div>
  );
};

// AIインサイト表示
const AIInsights: React.FC = () => {
  const insights = useAIInsights();
  
  return (
    <div className="ai-insights">
      <div className="insight-item">
        <Zap size={16} />
        <span>今週の学習テーマ: {insights.weeklyFocus}</span>
      </div>
      <div className="insight-item">
        <Star size={16} />
        <span>適合度: {insights.matchScore}%</span>
      </div>
      <div className="insight-item">
        <Clock size={16} />
        <span>推定読了時間: {insights.estimatedTime}分</span>
      </div>
    </div>
  );
};
```

### 2.3 パーソナライズ推薦表示

```tsx
// components/Recommendations/PersonalizedRecommendations.tsx
import React from 'react';
import { Target, ChevronRight, Heart, Bookmark } from 'lucide-react';

export const PersonalizedRecommendations: React.FC = () => {
  const recommendations = usePersonalizedRecommendations();
  
  return (
    <div className="personalized-recommendations">
      <div className="section-header">
        <Target size={20} />
        <h3>あなた向けの厳選コンテンツ</h3>
        <AIConfidenceScore score={recommendations.confidence} />
      </div>

      {recommendations.sections.map(section => (
        <RecommendationSection
          key={section.id}
          section={section}
        />
      ))}
    </div>
  );
};

const RecommendationSection: React.FC<{ section: RecommendationSection }> = ({
  section,
}) => {
  return (
    <div className="recommendation-section">
      <div className="section-header">
        <h4>{section.title}</h4>
        <span className="section-reason">{section.reason}</span>
      </div>

      <div className="content-cards">
        {section.items.map(item => (
          <AIRecommendationCard
            key={item.id}
            item={item}
            reasoning={item.aiReasoning}
          />
        ))}
      </div>

      <button className="see-more-btn">
        もっと見る
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const AIRecommendationCard: React.FC<{
  item: ContentItem;
  reasoning: AIReasoning;
}> = ({ item, reasoning }) => {
  return (
    <div className="ai-recommendation-card">
      <div className="card-content">
        <div className="content-info">
          {item.emoji && <span className="content-emoji">{item.emoji}</span>}
          <h3>{item.title}</h3>
          <p className="content-summary">{item.summary}</p>
          
          <div className="content-meta">
            <span className="author">by {item.author.name}</span>
            <span className="read-time">{item.readTime}分</span>
            <span className="published-at">{formatDate(item.publishedAt)}</span>
          </div>
        </div>

        <div className="content-actions">
          <button className="action-btn">
            <Heart size={16} />
          </button>
          <button className="action-btn">
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      <AIReasoningTooltip reasoning={reasoning} />
    </div>
  );
};

const AIReasoningTooltip: React.FC<{ reasoning: AIReasoning }> = ({ reasoning }) => {
  return (
    <div className="ai-reasoning-tooltip">
      <div className="reasoning-header">
        <Brain size={14} />
        <span>AIの推薦理由</span>
      </div>
      
      <ul className="reasoning-list">
        {reasoning.factors.map((factor, index) => (
          <li key={index} className="reasoning-factor">
            <span className="factor-icon">{factor.icon}</span>
            <span className="factor-text">{factor.text}</span>
            <span className="factor-weight">{factor.weight}%</span>
          </li>
        ))}
      </ul>
      
      <div className="reasoning-score">
        適合度: {reasoning.matchScore}%
      </div>
    </div>
  );
};
```

## 3. 推薦アルゴリズム設計

### 3.1 機械学習パイプライン

```python
# services/recommendation/ml_pipeline.py
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import NMF
import torch
import torch.nn as nn

class ZennRecommendationSystem:
    def __init__(self):
        self.content_vectorizer = TfidfVectorizer(max_features=5000)
        self.user_embedding_dim = 128
        self.content_embedding_dim = 256
        
    def train_content_embeddings(self, articles, books, scraps):
        """コンテンツ埋め込みの学習"""
        all_content = self.prepare_content_data(articles, books, scraps)
        
        # TF-IDFベースの特徴抽出
        tfidf_matrix = self.content_vectorizer.fit_transform(all_content)
        
        # 非負値行列因子分解による次元削減
        nmf = NMF(n_components=self.content_embedding_dim, random_state=42)
        content_embeddings = nmf.fit_transform(tfidf_matrix)
        
        return content_embeddings
    
    def train_user_embeddings(self, user_interactions):
        """ユーザー埋め込みの学習"""
        model = UserEmbeddingModel(
            num_users=len(user_interactions),
            embedding_dim=self.user_embedding_dim
        )
        
        # 協調フィルタリングによる学習
        for epoch in range(100):
            for user_id, interactions in user_interactions.items():
                model.train_step(user_id, interactions)
        
        return model
    
    def generate_recommendations(self, user_id, user_profile, n_recommendations=10):
        """個人化推薦の生成"""
        
        # ユーザープロファイル分析
        user_vector = self.create_user_vector(user_profile)
        
        # コンテンツとの類似度計算
        content_similarities = cosine_similarity(
            user_vector.reshape(1, -1), 
            self.content_embeddings
        )
        
        # 多様性を考慮した推薦
        diverse_recommendations = self.diversify_recommendations(
            content_similarities[0], n_recommendations
        )
        
        # 推薦理由の生成
        recommendations_with_reasoning = []
        for content_id, score in diverse_recommendations:
            reasoning = self.generate_reasoning(user_profile, content_id)
            recommendations_with_reasoning.append({
                'content_id': content_id,
                'score': score,
                'reasoning': reasoning
            })
        
        return recommendations_with_reasoning

class UserEmbeddingModel(nn.Module):
    def __init__(self, num_users, embedding_dim):
        super().__init__()
        self.user_embeddings = nn.Embedding(num_users, embedding_dim)
        self.fc = nn.Linear(embedding_dim, 1)
        
    def forward(self, user_ids):
        embeddings = self.user_embeddings(user_ids)
        return self.fc(embeddings)
```

### 3.2 推薦理由生成

```typescript
// services/recommendation/reasoning.service.ts
export class ReasoningService {
  generateReasoning(
    user: UserProfile, 
    content: ContentItem,
    factors: RecommendationFactors
  ): AIReasoning {
    const reasoningFactors = [];
    
    // 興味分野の一致
    if (factors.topicMatch > 0.7) {
      reasoningFactors.push({
        icon: '🎯',
        text: `${user.interests.join(', ')}に関心をお持ちのため`,
        weight: factors.topicMatch * 30,
      });
    }
    
    // スキルレベルの適合
    if (factors.skillMatch > 0.6) {
      reasoningFactors.push({
        icon: '📈',
        text: `現在の${factors.skillArea}レベルに適しているため`,
        weight: factors.skillMatch * 25,
      });
    }
    
    // 読書履歴との関連
    if (factors.historyMatch > 0.5) {
      reasoningFactors.push({
        icon: '📚',
        text: '過去に読んだ記事と関連があるため',
        weight: factors.historyMatch * 20,
      });
    }
    
    // 人気度・品質
    if (factors.qualityScore > 0.8) {
      reasoningFactors.push({
        icon: '⭐',
        text: 'コミュニティで高く評価されているため',
        weight: factors.qualityScore * 15,
      });
    }
    
    // トレンド要素
    if (factors.trendScore > 0.7) {
      reasoningFactors.push({
        icon: '🔥',
        text: '今話題になっているトピックのため',
        weight: factors.trendScore * 10,
      });
    }
    
    const matchScore = reasoningFactors.reduce(
      (sum, factor) => sum + factor.weight, 0
    );
    
    return {
      factors: reasoningFactors,
      matchScore: Math.round(matchScore),
      confidence: this.calculateConfidence(factors),
    };
  }
  
  private calculateConfidence(factors: RecommendationFactors): number {
    // 推薦の信頼度を計算
    const weights = {
      topicMatch: 0.3,
      skillMatch: 0.25,
      historyMatch: 0.2,
      qualityScore: 0.15,
      trendScore: 0.1,
    };
    
    let confidence = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      confidence += factors[key] * weight;
    });
    
    return Math.round(confidence * 100);
  }
}
```

## 4. スキルベース推薦

### 4.1 学習パス推薦

```tsx
// components/Recommendations/SkillGrowthRecommendations.tsx
import React from 'react';
import { TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const SkillGrowthRecommendations: React.FC = () => {
  const skillPaths = useSkillPaths();
  
  return (
    <div className="skill-growth-recommendations">
      <div className="current-skills">
        <h3>現在のスキルレベル</h3>
        <div className="skill-levels">
          {skillPaths.currentSkills.map(skill => (
            <SkillLevel key={skill.name} skill={skill} />
          ))}
        </div>
      </div>

      <div className="recommended-paths">
        <h3>推奨学習パス</h3>
        {skillPaths.recommendedPaths.map(path => (
          <LearningPath key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
};

const SkillLevel: React.FC<{ skill: Skill }> = ({ skill }) => {
  return (
    <div className="skill-level-card">
      <div className="skill-header">
        <h4>{skill.name}</h4>
        <span className="skill-badge">{skill.level}</span>
      </div>
      
      <div className="skill-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${skill.progress}%` }}
          />
        </div>
        <span>{skill.progress}%</span>
      </div>
      
      <div className="next-milestone">
        次のマイルストーン: {skill.nextMilestone}
      </div>
    </div>
  );
};

const LearningPath: React.FC<{ path: LearningPath }> = ({ path }) => {
  return (
    <div className="learning-path-card">
      <div className="path-header">
        <div className="path-info">
          <h4>{path.title}</h4>
          <p>{path.description}</p>
        </div>
        <div className="path-meta">
          <span className="duration">
            <Clock size={14} />
            {path.estimatedDuration}
          </span>
          <span className="difficulty">{path.difficulty}</span>
        </div>
      </div>

      <div className="path-steps">
        {path.steps.map((step, index) => (
          <div key={step.id} className="path-step">
            <div className="step-indicator">
              {step.completed ? (
                <CheckCircle size={16} className="completed" />
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            
            <div className="step-content">
              <h5>{step.title}</h5>
              <p>{step.description}</p>
              
              {step.resources.length > 0 && (
                <div className="step-resources">
                  {step.resources.map(resource => (
                    <a key={resource.id} href={resource.url} className="resource-link">
                      {resource.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="start-path-btn">
        学習を開始
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
```

## 5. トレンド予測機能

### 5.1 トレンド分析アルゴリズム

```typescript
// services/recommendation/trend-prediction.service.ts
export class TrendPredictionService {
  async predictTrendingTopics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<TrendPrediction[]> {
    // 複数のシグナルを統合してトレンドを予測
    const signals = await Promise.all([
      this.analyzeViewGrowth(timeframe),
      this.analyzeSocialMentions(timeframe),
      this.analyzeSearchTrends(timeframe),
      this.analyzeGitHubActivity(timeframe),
      this.analyzeJobMarketTrends(timeframe),
    ]);

    const predictions = this.combineSignals(signals);
    
    return predictions.map(prediction => ({
      ...prediction,
      reasoning: this.generateTrendReasoning(prediction),
      confidence: this.calculateTrendConfidence(prediction),
    }));
  }

  private async analyzeViewGrowth(timeframe: string): Promise<ViewGrowthSignal[]> {
    const viewData = await this.getViewAnalytics(timeframe);
    
    return viewData
      .filter(item => item.growthRate > 1.5) // 50%以上の成長
      .map(item => ({
        topic: item.topic,
        signal: 'view_growth',
        strength: item.growthRate,
        evidence: `${Math.round(item.growthRate * 100)}%の閲覧数増加`,
      }));
  }

  private async analyzeSocialMentions(timeframe: string): Promise<SocialSignal[]> {
    // Twitter, Reddit, Hacker Newsなどのソーシャルメンション分析
    const socialData = await Promise.all([
      this.getTwitterMentions(timeframe),
      this.getRedditDiscussions(timeframe),
      this.getHackerNewsMentions(timeframe),
    ]);

    return this.processSocialSignals(socialData.flat());
  }

  private generateTrendReasoning(prediction: TrendPrediction): TrendReasoning {
    const factors = [];

    if (prediction.signals.includes('view_growth')) {
      factors.push({
        icon: '📈',
        text: 'Zenn内での急激な閲覧数増加',
        impact: 'high',
      });
    }

    if (prediction.signals.includes('social_buzz')) {
      factors.push({
        icon: '🗣️',
        text: 'SNSでの言及数増加',
        impact: 'medium',
      });
    }

    if (prediction.signals.includes('github_activity')) {
      factors.push({
        icon: '🔧',
        text: 'GitHub上での関連活動増加',
        impact: 'medium',
      });
    }

    if (prediction.signals.includes('job_demand')) {
      factors.push({
        icon: '💼',
        text: '求人市場での需要増加',
        impact: 'high',
      });
    }

    return {
      factors,
      trendStrength: prediction.strength,
      timeToPeak: prediction.timeToPeak,
    };
  }
}
```

### 5.2 トレンド予測表示

```tsx
// components/Recommendations/TrendingPredictions.tsx
import React from 'react';
import { Brain, TrendingUp, Clock, Flame } from 'lucide-react';

export const TrendingPredictions: React.FC = () => {
  const predictions = useTrendPredictions();
  
  return (
    <div className="trending-predictions">
      <div className="section-header">
        <Brain size={20} />
        <h3>AIトレンド予測</h3>
        <span className="update-time">
          {formatRelativeTime(predictions.lastUpdated)}更新
        </span>
      </div>

      <div className="prediction-categories">
        <div className="category-tabs">
          <button className="tab active">今日のトレンド</button>
          <button className="tab">今週のトレンド</button>
          <button className="tab">来月の予測</button>
        </div>

        <div className="predictions-grid">
          {predictions.items.map(prediction => (
            <TrendPredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendPredictionCard: React.FC<{ prediction: TrendPrediction }> = ({
  prediction,
}) => {
  return (
    <div className="trend-prediction-card">
      <div className="prediction-header">
        <div className="topic-info">
          <h4>{prediction.topic}</h4>
          <span className="prediction-type">{prediction.category}</span>
        </div>
        
        <div className="trend-indicators">
          <div className="trend-strength">
            <Flame size={14} />
            <span>{Math.round(prediction.strength * 100)}%</span>
          </div>
          <div className="confidence-score">
            信頼度: {prediction.confidence}%
          </div>
        </div>
      </div>

      <div className="prediction-reasoning">
        <h5>予測根拠</h5>
        <ul className="reasoning-factors">
          {prediction.reasoning.factors.map((factor, index) => (
            <li key={index} className="factor-item">
              <span className="factor-icon">{factor.icon}</span>
              <span className="factor-text">{factor.text}</span>
              <span className={`impact-level ${factor.impact}`}>
                {factor.impact}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="prediction-timeline">
        <Clock size={14} />
        <span>ピーク予測: {prediction.timeTopeak}</span>
      </div>

      <div className="related-content">
        <h5>関連コンテンツ</h5>
        <div className="content-previews">
          {prediction.relatedContent.slice(0, 3).map(content => (
            <a key={content.id} href={content.url} className="content-preview">
              <span className="content-emoji">{content.emoji}</span>
              <span className="content-title">{content.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 6. 新発見・探索機能

### 6.1 セレンディピティアルゴリズム

```typescript
// services/recommendation/discovery.service.ts
export class DiscoveryService {
  async generateDiscoveryRecommendations(
    user: UserProfile,
    explorationLevel: 'conservative' | 'moderate' | 'adventurous'
  ): Promise<DiscoveryRecommendation[]> {
    
    const unexploredTopics = await this.findUnexploredTopics(user);
    const crossDomainConnections = await this.findCrossDomainConnections(user);
    const emergingFields = await this.identifyEmergingFields();
    
    const recommendations = [];

    // 未探索トピック
    for (const topic of unexploredTopics.slice(0, 3)) {
      const bridgeContent = await this.findBridgeContent(user, topic);
      recommendations.push({
        type: 'unexplored',
        topic: topic.name,
        reasoning: `${user.strongestSkill}から${topic.name}への橋渡し`,
        bridgeContent,
        explorationDifficulty: this.calculateExplorationDifficulty(user, topic),
      });
    }

    // 分野横断的な発見
    for (const connection of crossDomainConnections.slice(0, 2)) {
      recommendations.push({
        type: 'cross-domain',
        connection: connection.domains,
        reasoning: connection.reasoning,
        examples: connection.examples,
        potentialImpact: connection.impact,
      });
    }

    // 新興分野
    for (const field of emergingFields.slice(0, 2)) {
      recommendations.push({
        type: 'emerging',
        field: field.name,
        reasoning: field.whyEmerging,
        readinessLevel: field.readinessLevel,
        keyPlayers: field.keyPlayers,
      });
    }

    return this.rankDiscoveryRecommendations(
      recommendations, 
      user, 
      explorationLevel
    );
  }

  private async findBridgeContent(
    user: UserProfile, 
    targetTopic: Topic
  ): Promise<ContentItem[]> {
    // ユーザーの既知領域と新分野を繋ぐコンテンツを見つける
    const userExpertise = user.topSkills[0]; // 最も得意な分野
    
    const bridgeQuery = {
      mustContain: [userExpertise.name, targetTopic.name],
      difficulty: 'beginner-to-intermediate',
      type: 'tutorial',
    };
    
    return await this.contentSearch.search(bridgeQuery);
  }
}
```

### 6.2 探索推薦UI

```tsx
// components/Recommendations/DiscoveryRecommendations.tsx
import React from 'react';
import { Lightbulb, ArrowRight, Map, Compass } from 'lucide-react';

export const DiscoveryRecommendations: React.FC = () => {
  const discoveries = useDiscoveryRecommendations();
  
  return (
    <div className="discovery-recommendations">
      <div className="section-header">
        <Lightbulb size={20} />
        <h3>新しい発見</h3>
        <p>あなたの知識を広げる新しい分野への提案</p>
      </div>

      <ExplorationSettings />

      <div className="discovery-sections">
        {discoveries.map(section => (
          <DiscoverySection key={section.type} section={section} />
        ))}
      </div>
    </div>
  );
};

const ExplorationSettings: React.FC = () => {
  const [level, setLevel] = useState('moderate');
  
  return (
    <div className="exploration-settings">
      <label>探索レベル</label>
      <div className="level-selector">
        <button 
          className={level === 'conservative' ? 'active' : ''}
          onClick={() => setLevel('conservative')}
        >
          慎重派
        </button>
        <button 
          className={level === 'moderate' ? 'active' : ''}
          onClick={() => setLevel('moderate')}
        >
          バランス型
        </button>
        <button 
          className={level === 'adventurous' ? 'active' : ''}
          onClick={() => setLevel('adventurous')}
        >
          冒険家
        </button>
      </div>
    </div>
  );
};

const DiscoverySection: React.FC<{ section: DiscoverySection }> = ({ section }) => {
  const icons = {
    'unexplored': Map,
    'cross-domain': Compass,
    'emerging': Lightbulb,
  };
  
  const Icon = icons[section.type];
  
  return (
    <div className="discovery-section">
      <div className="section-title">
        <Icon size={18} />
        <h4>{section.title}</h4>
      </div>
      
      {section.items.map(item => (
        <DiscoveryCard key={item.id} item={item} />
      ))}
    </div>
  );
};

const DiscoveryCard: React.FC<{ item: DiscoveryItem }> = ({ item }) => {
  return (
    <div className="discovery-card">
      <div className="discovery-header">
        <h4>{item.title}</h4>
        <span className="difficulty-badge">{item.difficulty}</span>
      </div>
      
      <p className="discovery-reasoning">{item.reasoning}</p>
      
      {item.bridgeContent && (
        <div className="bridge-content">
          <h5>学習の橋渡し</h5>
          <div className="bridge-path">
            <span className="current-skill">{item.from}</span>
            <ArrowRight size={16} />
            <span className="bridge-topics">
              {item.bridgeContent.map(topic => topic.name).join(' → ')}
            </span>
            <ArrowRight size={16} />
            <span className="target-skill">{item.to}</span>
          </div>
        </div>
      )}
      
      <div className="discovery-actions">
        <button className="explore-btn">
          探索を開始
          <ArrowRight size={14} />
        </button>
        <button className="save-later-btn">
          後で見る
        </button>
      </div>
    </div>
  );
};
```

## 7. パフォーマンス最適化

### 7.1 推薦計算の最適化

```typescript
// services/recommendation/optimization.ts
export class RecommendationOptimizer {
  private cache = new Map<string, any>();
  private computationQueue = new Queue<ComputationTask>();
  
  async optimizeRecommendations(userId: string): Promise<OptimizedRecommendations> {
    // キャッシュ確認
    const cacheKey = `recommendations:${userId}:${this.getCacheVersion()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // バックグラウンド計算をキューに追加
    const task: ComputationTask = {
      userId,
      type: 'full_recommendations',
      priority: this.getUserPriority(userId),
      computeAt: new Date(),
    };
    
    this.computationQueue.enqueue(task);
    
    // 即座に返すための軽量版推薦
    const quickRecommendations = await this.generateQuickRecommendations(userId);
    
    // フル計算完了後にキャッシュ更新
    this.scheduleFullComputation(userId, cacheKey);
    
    return quickRecommendations;
  }
  
  private async generateQuickRecommendations(userId: string): Promise<Recommendations> {
    // 事前計算済みの人気コンテンツベース推薦
    const popularContent = await this.getPopularContent();
    const userProfile = await this.getUserProfile(userId);
    
    return this.filterByUserPreferences(popularContent, userProfile);
  }
  
  private async scheduleFullComputation(userId: string, cacheKey: string): Promise<void> {
    // Web Workerでバックグラウンド計算
    const worker = new Worker('/workers/recommendation-worker.js');
    
    worker.postMessage({
      type: 'compute_recommendations',
      userId,
      cacheKey,
    });
    
    worker.onmessage = (event) => {
      const { result } = event.data;
      this.cache.set(cacheKey, result);
      
      // WebSocketでフロントエンドに更新通知
      this.notifyClient(userId, 'recommendations_updated');
    };
  }
}
```

### 7.2 リアルタイム更新

```typescript
// hooks/useRealtimeRecommendations.ts
export function useRealtimeRecommendations(userId: string) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/recommendations/${userId}`);
    
    ws.onopen = () => {
      // 初期推薦を要求
      ws.send(JSON.stringify({ type: 'get_recommendations' }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'recommendations':
          setRecommendations(data.recommendations);
          setLoading(false);
          break;
          
        case 'recommendations_updated':
          setUpdating(true);
          // 更新されたデータを取得
          ws.send(JSON.stringify({ type: 'get_recommendations' }));
          break;
          
        case 'recommendations_refreshed':
          setRecommendations(data.recommendations);
          setUpdating(false);
          break;
      }
    };
    
    return () => ws.close();
  }, [userId]);
  
  return { recommendations, loading, updating };
}
```

---

*最終更新: 2025-09-05*
*バージョン: 1.0.0*