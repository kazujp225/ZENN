'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import '@/styles/pages/dashboard.css';

// ダミーデータ
const dashboardStats = {
  totalViews: 45234,
  totalLikes: 1234,
  totalComments: 456,
  totalEarnings: 28500,
  monthlyViews: 8234,
  monthlyGrowth: 12.5,
};

const recentArticles = [
  {
    id: '1',
    title: 'Next.js 14 App Routerの完全ガイド',
    status: 'published',
    publishedAt: '2024-01-15',
    views: 3456,
    likes: 234,
    comments: 12,
  },
  {
    id: '2',
    title: 'React Server Componentsを理解する',
    status: 'published',
    publishedAt: '2024-01-10',
    views: 2156,
    likes: 156,
    comments: 8,
  },
  {
    id: '3',
    title: 'TypeScriptのベストプラクティス2024',
    status: 'draft',
    publishedAt: null,
    views: 0,
    likes: 0,
    comments: 0,
  },
];

const notifications = [
  {
    id: '1',
    type: 'like',
    user: 'user123',
    message: 'があなたの記事「Next.js 14 App Routerの完全ガイド」にいいねしました',
    time: '2時間前',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    user: 'dev_pro',
    message: 'があなたの記事にコメントしました',
    time: '5時間前',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    user: 'tech_enthusiast',
    message: 'があなたをフォローしました',
    time: '1日前',
    read: true,
  },
];

type TabType = 'overview' | 'articles' | 'books' | 'scraps' | 'analytics' | 'earnings';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // ログインチェック
  React.useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard__header">
        <div className="dashboard__container">
          <h1 className="dashboard__title">ダッシュボード</h1>
          <div className="dashboard__actions">
            <Link href="/new/article" className="dashboard__new-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新規投稿
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard__tabs">
        <div className="dashboard__container">
          <nav className="dashboard__tab-nav">
            <button 
              className={`dashboard__tab ${activeTab === 'overview' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              概要
            </button>
            <button 
              className={`dashboard__tab ${activeTab === 'articles' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              記事
            </button>
            <button 
              className={`dashboard__tab ${activeTab === 'books' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              本
            </button>
            <button 
              className={`dashboard__tab ${activeTab === 'scraps' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('scraps')}
            >
              スクラップ
            </button>
            <button 
              className={`dashboard__tab ${activeTab === 'analytics' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              分析
            </button>
            <button 
              className={`dashboard__tab ${activeTab === 'earnings' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              収益
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="dashboard__content">
        <div className="dashboard__container">
          {activeTab === 'overview' && (
            <div className="dashboard__overview">
              {/* Stats Cards */}
              <div className="dashboard__stats">
                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-icon dashboard__stat-icon--views">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-content">
                    <div className="dashboard__stat-label">総閲覧数</div>
                    <div className="dashboard__stat-value">{dashboardStats.totalViews.toLocaleString()}</div>
                    <div className="dashboard__stat-change dashboard__stat-change--up">
                      +{dashboardStats.monthlyGrowth}%
                    </div>
                  </div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-icon dashboard__stat-icon--likes">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-content">
                    <div className="dashboard__stat-label">総いいね</div>
                    <div className="dashboard__stat-value">{dashboardStats.totalLikes.toLocaleString()}</div>
                  </div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-icon dashboard__stat-icon--comments">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-content">
                    <div className="dashboard__stat-label">総コメント</div>
                    <div className="dashboard__stat-value">{dashboardStats.totalComments}</div>
                  </div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-icon dashboard__stat-icon--earnings">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-content">
                    <div className="dashboard__stat-label">総収益</div>
                    <div className="dashboard__stat-value">¥{dashboardStats.totalEarnings.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard__grid">
                <div className="dashboard__section">
                  <h2 className="dashboard__section-title">最近の記事</h2>
                  <div className="dashboard__article-list">
                    {recentArticles.map(article => (
                      <div key={article.id} className="dashboard__article-item">
                        <div className="dashboard__article-info">
                          <h3 className="dashboard__article-title">
                            <Link href={`/articles/${article.id}/edit`}>
                              {article.title}
                            </Link>
                          </h3>
                          <div className="dashboard__article-meta">
                            <span className={`dashboard__article-status dashboard__article-status--${article.status}`}>
                              {article.status === 'published' ? '公開済み' : '下書き'}
                            </span>
                            {article.publishedAt && (
                              <span>{article.publishedAt}</span>
                            )}
                          </div>
                        </div>
                        <div className="dashboard__article-stats">
                          <span>👁 {article.views.toLocaleString()}</span>
                          <span>❤️ {article.likes}</span>
                          <span>💬 {article.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard__section">
                  <h2 className="dashboard__section-title">通知</h2>
                  <div className="dashboard__notification-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`dashboard__notification ${!notification.read ? 'dashboard__notification--unread' : ''}`}
                      >
                        <div className="dashboard__notification-icon">
                          {notification.type === 'like' && '❤️'}
                          {notification.type === 'comment' && '💬'}
                          {notification.type === 'follow' && '👤'}
                        </div>
                        <div className="dashboard__notification-content">
                          <p>
                            <strong>{notification.user}</strong>
                            {notification.message}
                          </p>
                          <span className="dashboard__notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard__quick-actions">
                <h2 className="dashboard__section-title">クイックアクション</h2>
                <div className="dashboard__action-grid">
                  <Link href="/new/article" className="dashboard__action-card">
                    <div className="dashboard__action-icon">📝</div>
                    <div className="dashboard__action-label">記事を書く</div>
                  </Link>
                  <Link href="/new/book" className="dashboard__action-card">
                    <div className="dashboard__action-icon">📚</div>
                    <div className="dashboard__action-label">本を作成</div>
                  </Link>
                  <Link href="/new/scrap" className="dashboard__action-card">
                    <div className="dashboard__action-icon">💭</div>
                    <div className="dashboard__action-label">スクラップ作成</div>
                  </Link>
                  <Link href="/settings/profile" className="dashboard__action-card">
                    <div className="dashboard__action-icon">⚙️</div>
                    <div className="dashboard__action-label">設定</div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="dashboard__articles">
              <div className="dashboard__toolbar">
                <input 
                  type="text" 
                  placeholder="記事を検索..." 
                  className="dashboard__search"
                />
                <select className="dashboard__filter">
                  <option value="all">すべて</option>
                  <option value="published">公開済み</option>
                  <option value="draft">下書き</option>
                </select>
                <Link href="/new/article" className="dashboard__toolbar-btn">
                  新規作成
                </Link>
              </div>
              
              <div className="dashboard__table">
                <table>
                  <thead>
                    <tr>
                      <th>タイトル</th>
                      <th>ステータス</th>
                      <th>公開日</th>
                      <th>閲覧数</th>
                      <th>いいね</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentArticles.map(article => (
                      <tr key={article.id}>
                        <td>{article.title}</td>
                        <td>
                          <span className={`dashboard__badge dashboard__badge--${article.status}`}>
                            {article.status === 'published' ? '公開済み' : '下書き'}
                          </span>
                        </td>
                        <td>{article.publishedAt || '-'}</td>
                        <td>{article.views.toLocaleString()}</td>
                        <td>{article.likes}</td>
                        <td>
                          <div className="dashboard__table-actions">
                            <button className="dashboard__table-btn">編集</button>
                            <button className="dashboard__table-btn dashboard__table-btn--danger">削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="dashboard__analytics">
              <div className="dashboard__chart-grid">
                <div className="dashboard__chart-card">
                  <h3>閲覧数の推移</h3>
                  <div className="dashboard__chart-placeholder">
                    📊 グラフエリア（Chart.jsなどで実装）
                  </div>
                </div>
                <div className="dashboard__chart-card">
                  <h3>人気記事TOP5</h3>
                  <div className="dashboard__chart-placeholder">
                    📈 ランキング表示エリア
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="dashboard__earnings">
              <div className="dashboard__earnings-summary">
                <h3>今月の収益</h3>
                <div className="dashboard__earnings-amount">¥{dashboardStats.totalEarnings.toLocaleString()}</div>
                <p>前月比 +15%</p>
              </div>
              <div className="dashboard__earnings-breakdown">
                <h3>収益内訳</h3>
                <div className="dashboard__earnings-list">
                  <div className="dashboard__earnings-item">
                    <span>有料記事</span>
                    <span>¥15,000</span>
                  </div>
                  <div className="dashboard__earnings-item">
                    <span>書籍販売</span>
                    <span>¥10,000</span>
                  </div>
                  <div className="dashboard__earnings-item">
                    <span>サポート</span>
                    <span>¥3,500</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}