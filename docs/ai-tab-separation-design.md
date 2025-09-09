# AI推薦タブ分離設計書

## 1. 現状の問題点

### 1.1 現在の構成
```
ホームページ:
├── ヘッダーナビゲーション
├── 📈 トレンド / 👤 あなた向け / 📚 記事 / 📖 本 / 💬 スクラップ
└── サイドバーまたは埋め込み: 🤖 AI推薦コンテンツ
```

### 1.2 問題点
- AI推薦が目立たない位置にある
- ユーザーがAI機能に気づきにくい
- AI推薦の豊富な機能が活用されていない
- タブ間の役割分担が不明瞭

## 2. 改善設計

### 2.1 新しいタブ構成

```tsx
// components/Home/MainTabs.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  User, 
  Bot, 
  FileText, 
  Book, 
  MessageSquare,
  Sparkles 
} from 'lucide-react';

export const MainTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trending');

  const tabs = [
    {
      id: 'trending',
      label: 'トレンド',
      icon: TrendingUp,
      description: '今話題のコンテンツ',
      color: '#ff6b6b',
    },
    {
      id: 'foryou',
      label: 'For you',
      icon: User,
      description: '興味に基づく推薦',
      color: '#4ecdc4',
      requiresAuth: true,
    },
    {
      id: 'ai-recommendations',
      label: '🤖 AI推薦',
      icon: Bot,
      description: 'AIが厳選したコンテンツ',
      color: '#45b7d1',
      requiresAuth: true,
      badge: 'NEW',
      highlight: true, // 特別強調
    },
    {
      id: 'articles',
      label: '記事',
      icon: FileText,
      description: 'すべての記事',
      color: '#96ceb4',
    },
    {
      id: 'books',
      label: '本',
      icon: Book,
      description: '書籍',
      color: '#ffeaa7',
    },
    {
      id: 'scraps',
      label: 'スクラップ',
      icon: MessageSquare,
      description: 'ディスカッション',
      color: '#fd79a8',
    },
  ];

  return (
    <div className="main-tabs">
      <div className="tabs-header">
        <div className="tabs-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.highlight ? 'highlight' : ''}`}
                style={{ '--tab-color': tab.color }}
              >
                <div className="tab-icon">
                  <Icon size={20} />
                  {tab.badge && (
                    <span className="tab-badge">{tab.badge}</span>
                  )}
                </div>
                <span className="tab-label">{tab.label}</span>
                {tab.highlight && (
                  <Sparkles size={14} className="tab-sparkle" />
                )}
              </button>
            );
          })}
        </div>

        {/* AI推薦タブの特別なヘッダー */}
        {activeTab === 'ai-recommendations' && <AITabHeader />}
      </div>

      <div className="tab-content">
        {activeTab === 'trending' && <TrendingContent />}
        {activeTab === 'foryou' && <ForYouContent />}
        {activeTab === 'ai-recommendations' && <AIRecommendationsTab />}
        {activeTab === 'articles' && <ArticlesContent />}
        {activeTab === 'books' && <BooksContent />}
        {activeTab === 'scraps' && <ScrapsContent />}
      </div>
    </div>
  );
};

const AITabHeader: React.FC = () => {
  return (
    <div className="ai-tab-header">
      <div className="ai-branding">
        <Bot size={24} className="ai-icon pulsing" />
        <div className="ai-title">
          <h2>AI推薦</h2>
          <p>あなたのためにAIが厳選したコンテンツ</p>
        </div>
      </div>
      
      <div className="ai-status">
        <div className="status-indicator">
          <div className="status-dot active"></div>
          <span>AIアクティブ</span>
        </div>
        <span className="last-update">5分前に更新</span>
      </div>
    </div>
  );
};
```

### 2.2 専用AI推薦タブの設計

```tsx
// components/AI/AIRecommendationsTab.tsx
import React, { useState } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Lightbulb,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';

export const AIRecommendationsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('smart-picks');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    {
      id: 'smart-picks',
      name: 'スマートピック',
      icon: Brain,
      description: 'AIがあなたのために厳選',
      color: '#667eea',
    },
    {
      id: 'skill-growth',
      name: 'スキル成長',
      icon: TrendingUp,
      description: 'レベルアップのための推薦',
      color: '#764ba2',
    },
    {
      id: 'discovery',
      name: '新発見',
      icon: Lightbulb,
      description: '新しい分野への誘導',
      color: '#f093fb',
    },
    {
      id: 'learning-path',
      name: '学習パス',
      icon: BookOpen,
      description: '体系的な学習コース',
      color: '#4facfe',
    },
    {
      id: 'trending-prediction',
      name: 'トレンド予測',
      icon: Zap,
      description: 'AIが予測する話題のコンテンツ',
      color: '#43e97b',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // AI推薦の再計算をリクエスト
    await refreshAIRecommendations();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="ai-recommendations-tab">
      {/* AIダッシュボード */}
      <div className="ai-dashboard">
        <div className="dashboard-cards">
          <AIInsightCard />
          <LearningProgressCard />
          <PersonalizationScore />
        </div>
        
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh}
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            推薦を更新
          </button>
          
          <button className="settings-btn">
            <Settings size={16} />
            AI設定
          </button>
        </div>
      </div>

      {/* カテゴリ選択 */}
      <div className="ai-categories">
        <div className="categories-scroll">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">
                  <Icon size={24} />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <div className="category-indicator"></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 推薦コンテンツ表示 */}
      <div className="ai-content">
        {activeCategory === 'smart-picks' && <SmartPicksContent />}
        {activeCategory === 'skill-growth' && <SkillGrowthContent />}
        {activeCategory === 'discovery' && <DiscoveryContent />}
        {activeCategory === 'learning-path' && <LearningPathContent />}
        {activeCategory === 'trending-prediction' && <TrendingPredictionContent />}
      </div>
    </div>
  );
};

// AIインサイトカード
const AIInsightCard: React.FC = () => {
  const insights = useAIInsights();
  
  return (
    <div className="insight-card">
      <div className="card-header">
        <Brain size={20} />
        <h3>今日のインサイト</h3>
      </div>
      
      <div className="insights-list">
        <div className="insight-item">
          <Target size={16} />
          <span>関心の高いトピック: {insights.topInterest}</span>
        </div>
        <div className="insight-item">
          <TrendingUp size={16} />
          <span>成長分野: {insights.growthArea}</span>
        </div>
        <div className="insight-item">
          <Lightbulb size={16} />
          <span>推薦精度: {insights.accuracy}%</span>
        </div>
      </div>
    </div>
  );
};
```

### 2.3 ホームページからの分離

```tsx
// components/Home/HomePage.tsx - 変更前後の比較

// ❌ 変更前: ホームにAI推薦が埋め込まれている
export const HomePageBefore: React.FC = () => {
  return (
    <div className="home-page">
      <div className="main-content">
        <ContentTabs /> {/* トレンド、記事、本、スクラップ */}
      </div>
      
      <aside className="sidebar">
        <AIRecommendations /> {/* ここにAI推薦が埋め込み */}
        <PopularTags />
        <RecentActivity />
      </aside>
    </div>
  );
};

// ✅ 変更後: AI推薦が独立したタブに
export const HomePageAfter: React.FC = () => {
  return (
    <div className="home-page">
      <div className="main-content">
        <MainTabs /> {/* AI推薦タブを含む全タブ */}
      </div>
      
      <aside className="sidebar">
        <QuickActions /> {/* 新規作成、下書き等 */}
        <PopularTags />
        <RecentActivity />
        <UserStats /> {/* ユーザーの統計情報 */}
      </aside>
    </div>
  );
};
```

## 3. ユーザー体験の改善

### 3.1 段階的な情報開示

```tsx
// 未ログインユーザー向けのAI推薦タブ
const AIRecommendationsForGuest: React.FC = () => {
  return (
    <div className="ai-recommendations-guest">
      <div className="ai-preview">
        <Bot size={48} className="preview-icon" />
        <h2>AIがあなたのために厳選</h2>
        <p>
          機械学習アルゴリズムがあなたの興味・スキルレベル・学習目標に
          基づいて最適なコンテンツを推薦します
        </p>
        
        <div className="preview-features">
          <div className="feature">
            <Brain size={20} />
            <span>パーソナライズ推薦</span>
          </div>
          <div className="feature">
            <TrendingUp size={20} />
            <span>スキルアップ支援</span>
          </div>
          <div className="feature">
            <Lightbulb size={20} />
            <span>新分野の発見</span>
          </div>
        </div>
        
        <button className="login-to-unlock">
          ログインしてAI推薦を利用
        </button>
      </div>
      
      {/* サンプル推薦を表示 */}
      <div className="sample-recommendations">
        <h3>推薦例</h3>
        <SampleRecommendationCards />
      </div>
    </div>
  );
};
```

### 3.2 初回利用時のオンボーディング

```tsx
// AI推薦タブの初回訪問時
const AIOnboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  
  const onboardingSteps = [
    {
      title: 'AI推薦へようこそ！',
      description: 'あなたの学習を加速する機能をご紹介します',
      visual: <OnboardingAnimation1 />,
    },
    {
      title: 'パーソナライズされた推薦',
      description: 'あなたの読書履歴と興味に基づいて最適なコンテンツを提案',
      visual: <OnboardingAnimation2 />,
    },
    {
      title: '学習パスの提案',
      description: '体系的にスキルアップできる学習コースを自動生成',
      visual: <OnboardingAnimation3 />,
    },
    {
      title: '新しい分野の発見',
      description: 'AIがあなたの可能性を広げる新しい分野を提案',
      visual: <OnboardingAnimation4 />,
    },
  ];

  return (
    <div className="ai-onboarding-modal">
      <div className="onboarding-content">
        <div className="step-indicator">
          {step + 1} / {onboardingSteps.length}
        </div>
        
        <div className="step-visual">
          {onboardingSteps[step].visual}
        </div>
        
        <div className="step-text">
          <h2>{onboardingSteps[step].title}</h2>
          <p>{onboardingSteps[step].description}</p>
        </div>
        
        <div className="onboarding-actions">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}>
              戻る
            </button>
          )}
          
          <button 
            onClick={() => {
              if (step < onboardingSteps.length - 1) {
                setStep(step + 1);
              } else {
                completeOnboarding();
              }
            }}
            className="primary"
          >
            {step < onboardingSteps.length - 1 ? '次へ' : 'AI推薦を開始'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 4. タブのビジュアルデザイン

### 4.1 AI推薦タブの特別なスタイリング

```css
/* AI推薦タブの特別な装飾 */
.tab-button[data-tab="ai-recommendations"] {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  
  /* 光る効果 */
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  
  /* ホバー時の強調 */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(102, 126, 234, 0.4);
  }
  
  /* AI バッジの装飾 */
  .tab-badge {
    background: #43e97b;
    color: #000;
    font-weight: bold;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
    position: absolute;
    top: -5px;
    right: -5px;
  }
  
  /* スパークル効果 */
  .tab-sparkle {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #ffd700;
    animation: sparkle 2s ease-in-out infinite;
  }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* AI推薦タブのコンテンツエリア */
.ai-recommendations-tab {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  
  .ai-dashboard {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .ai-categories {
    margin-bottom: 32px;
    
    .category-card {
      background: white;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 16px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--category-color);
        transform: translateY(-2px);
      }
      
      &.active {
        border-color: var(--category-color);
        background: linear-gradient(135deg, white 0%, var(--category-color, #667eea) 100%);
        color: white;
      }
    }
  }
}
```

## 5. 分析とパフォーマンス指標

### 5.1 AI推薦タブの利用状況追跡

```typescript
// analytics/ai-tab-tracking.ts
export class AITabAnalytics {
  trackTabView(userId: string, category: string) {
    this.analytics.track('AI_Tab_Viewed', {
      userId,
      category,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    });
  }
  
  trackRecommendationClick(userId: string, contentId: string, position: number, category: string) {
    this.analytics.track('AI_Recommendation_Clicked', {
      userId,
      contentId,
      position,
      category,
      timestamp: new Date(),
    });
  }
  
  trackCategorySwitch(userId: string, fromCategory: string, toCategory: string) {
    this.analytics.track('AI_Category_Switched', {
      userId,
      fromCategory,
      toCategory,
      timestamp: new Date(),
    });
  }
  
  async getAITabMetrics(): Promise<AITabMetrics> {
    return {
      dailyActiveUsers: await this.getDailyActiveUsers(),
      categoryPopularity: await this.getCategoryPopularity(),
      clickThroughRates: await this.getClickThroughRates(),
      userEngagement: await this.getUserEngagement(),
    };
  }
}
```

この設計により、AI推薦機能が専用タブとして独立し、ユーザーがより深くAI機能を活用できるようになります。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "AI\u63a8\u85a6\u30b3\u30f3\u30c6\u30f3\u30c4\u306e\u30bf\u30d6\u5206\u96e2\u8a2d\u8a08", "status": "completed", "activeForm": "Completed AI recommendations tab separation design"}, {"content": "\u30db\u30fc\u30e0\u30da\u30fc\u30b8\u304b\u3089AI\u63a8\u85a6\u3092\u5206\u96e2", "status": "completed", "activeForm": "Completed removal from home page design"}, {"content": "\u5c02\u7528AI\u30bf\u30d6\u306eUI/UX\u8a2d\u8a08", "status": "completed", "activeForm": "Completed dedicated AI tab UI/UX design"}]