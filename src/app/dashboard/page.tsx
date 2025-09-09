'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useRouter } from 'next/navigation';
import { articlesApi, booksApi, scrapsApi, usersApi } from '@/lib/api';
import type { Article, Book, Scrap } from '@/lib/api';
import '@/styles/pages/dashboard.css';

type TabType = 'overview' | 'articles' | 'books' | 'scraps' | 'analytics' | 'earnings';

export default function DashboardPage() {
  const { user } = useEnhancedAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalEarnings: 0,
    monthlyViews: 0,
    monthlyGrowth: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);

  // ログインチェックとハッシュナビゲーション
  React.useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // ハッシュからタブを設定
    const hash = window.location.hash.slice(1);
    if (hash && ['overview', 'articles', 'books', 'scraps', 'analytics', 'earnings'].includes(hash)) {
      setActiveTab(hash as TabType);
    }

    // データ取得
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // ユーザーのコンテンツを取得
      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getArticlesByUser(user.id, 10, 0),
        booksApi.getBooksByUser(user.id, 10, 0),
        scrapsApi.getScrapsByUser(user.id, 10, 0)
      ]);

      const userArticles = articlesRes.data || [];
      const userBooks = booksRes.data || [];
      const userScraps = scrapsRes.data || [];

      setArticles(userArticles);
      setBooks(userBooks);
      setScraps(userScraps);

      // 統計情報を計算
      const totalLikes = userArticles.reduce((sum, a: any) => sum + a.likes_count, 0) +
                        userBooks.reduce((sum, b: any) => sum + b.likes_count, 0);
      const totalComments = userArticles.reduce((sum, a: any) => sum + a.comments_count, 0) +
                           userScraps.reduce((sum, s: any) => sum + s.comments_count, 0);
      
      setDashboardStats({
        totalViews: Math.floor(Math.random() * 50000) + 10000, // ビュー数はモック
        totalLikes,
        totalComments,
        totalEarnings: userBooks.filter((b: any) => !b.is_free).reduce((sum, b: any) => sum + (b.price || 0), 0) * 100,
        monthlyViews: Math.floor(Math.random() * 10000) + 1000,
        monthlyGrowth: Math.random() * 20,
      });

      // 通知データを生成（実際のデータから）
      const generatedNotifications = [];
      
      // 最新の記事へのいいね通知を生成
      if (userArticles.length > 0) {
        generatedNotifications.push({
          id: '1',
          type: 'like',
          user: 'ユーザー',
          message: `があなたの記事「${(userArticles[0] as any)?.title || '記事'}」にいいねしました`,
          time: '2時間前',
          read: false,
        });
      }
      
      // コメント通知を生成
      if (userArticles.length > 0) {
        const totalComments = userArticles.reduce((sum, a: any) => sum + a.comments_count, 0);
        if (totalComments > 0) {
          generatedNotifications.push({
            id: '2',
            type: 'comment',
            user: 'ユーザー',
            message: 'があなたの記事にコメントしました',
            time: '5時間前',
            read: false,
          });
        }
      }
      
      // フォロワー通知を生成 (userData not available in this context)
      
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content__inner">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">ダッシュボードを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__inner">
          <div className="dashboard-header__content">
            <div className="dashboard-header__main">
              <h1 className="dashboard-header__title">
                <span className="dashboard-header__title-icon">📊</span>
                ダッシュボード
              </h1>
              <p className="dashboard-header__description">投稿した記事やスクラップを管理できます</p>
            </div>
            <Link href="/new/article" className="dashboard-header__action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新規投稿
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="dashboard-filter">
        <div className="dashboard-filter__inner">
          <div className="dashboard-filter__left">
            <div className="dashboard-filter__tabs">
              <button 
                className={`dashboard-filter__tab ${activeTab === 'overview' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('overview');
                  window.location.hash = 'overview';
                }}
              >
                <span className="dashboard-filter__tab-icon">📋</span>
                概要
              </button>
              <button 
                className={`dashboard-filter__tab ${activeTab === 'articles' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('articles');
                  window.location.hash = 'articles';
                }}
              >
                <span className="dashboard-filter__tab-icon">📝</span>
                記事
                <span className="dashboard-filter__tab-count">{articles.length}</span>
              </button>
              <button 
                className={`dashboard-filter__tab ${activeTab === 'books' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('books');
                  window.location.hash = 'books';
                }}
              >
                <span className="dashboard-filter__tab-icon">📚</span>
                本
                <span className="dashboard-filter__tab-count">{books.length}</span>
              </button>
              <button 
                className={`dashboard-filter__tab ${activeTab === 'scraps' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('scraps');
                  window.location.hash = 'scraps';
                }}
              >
                <span className="dashboard-filter__tab-icon">💭</span>
                スクラップ
                <span className="dashboard-filter__tab-count">{scraps.length}</span>
              </button>
              <button 
                className={`dashboard-filter__tab ${activeTab === 'analytics' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('analytics');
                  window.location.hash = 'analytics';
                }}
              >
                <span className="dashboard-filter__tab-icon">📊</span>
                分析
              </button>
              <button 
                className={`dashboard-filter__tab ${activeTab === 'earnings' ? 'dashboard-filter__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('earnings');
                  window.location.hash = 'earnings';
                }}
              >
                <span className="dashboard-filter__tab-icon">💰</span>
                収益
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        <div className="dashboard-content__inner">
          {activeTab === 'overview' && (
            <div className="dashboard__overview">
              {/* Stats Cards */}
              <div className="dashboard-stats">
                <div className="dashboard-stats__inner">
                  <div className="dashboard-stats__grid">
                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                      <div className="dashboard-stat-card__content">
                        <div className="dashboard-stat-card__value">{dashboardStats.totalViews.toLocaleString()}</div>
                        <div className="dashboard-stat-card__label">総閲覧数</div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <div className="dashboard-stat-card__content">
                        <div className="dashboard-stat-card__value">{dashboardStats.totalLikes.toLocaleString()}</div>
                        <div className="dashboard-stat-card__label">総いいね</div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                      </div>
                      <div className="dashboard-stat-card__content">
                        <div className="dashboard-stat-card__value">{dashboardStats.totalComments}</div>
                        <div className="dashboard-stat-card__label">総コメント</div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="dashboard-stat-card__icon dashboard-stat-card__icon--info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <div className="dashboard-stat-card__content">
                        <div className="dashboard-stat-card__value">¥{dashboardStats.totalEarnings.toLocaleString()}</div>
                        <div className="dashboard-stat-card__label">総収益</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="dashboard-card__header">
                    <h2>最近の記事</h2>
                  </div>
                  <div className="dashboard__article-list">
                    {articles.slice(0, 3).map((article: any) => (
                      <div key={article.id} className="dashboard__article-item">
                        <div className="dashboard__article-info">
                          <h3 className="dashboard__article-title">
                            <Link href={`/articles/${article.slug || article.id}/edit`}>
                              {article.title}
                            </Link>
                          </h3>
                          <div className="dashboard__article-meta">
                            <span className={`dashboard-badge dashboard-badge--${article.published_at ? 'success' : 'warning'}`}>
                              {article.published_at ? '公開済み' : '下書き'}
                            </span>
                            {article.published_at && (
                              <span>{new Date(article.published_at).toLocaleDateString('ja-JP')}</span>
                            )}
                          </div>
                        </div>
                        <div className="dashboard-table__stats">
                          <div className="dashboard-table__stat">👁 {Math.floor(Math.random() * 5000).toLocaleString()}</div>
                          <div className="dashboard-table__stat">❤️ {article.likes_count}</div>
                          <div className="dashboard-table__stat">💬 {article.comments_count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card__header">
                    <h2>通知</h2>
                  </div>
                  <div className="dashboard__notification-list">
                    {notifications.length > 0 ? notifications.map((notification: any) => (
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
                    )) : (
                      <div className="dashboard-empty">
                        <div className="dashboard-empty__icon">🔔</div>
                        <p className="dashboard-empty__text">通知はありません</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card" style={{marginTop: '2rem'}}>
                <div className="dashboard-card__header">
                  <h2>クイックアクション</h2>
                </div>
                <div className="dashboard-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
                  <Link href="/new/article" className="dashboard-card dashboard-card:hover">
                    <div className="dashboard-card__emoji">📝</div>
                    <div className="dashboard-card__title">記事を書く</div>
                  </Link>
                  <Link href="/new/book" className="dashboard-card dashboard-card:hover">
                    <div className="dashboard-card__emoji">📚</div>
                    <div className="dashboard-card__title">本を作成</div>
                  </Link>
                  <Link href="/new/scrap" className="dashboard-card dashboard-card:hover">
                    <div className="dashboard-card__emoji">💭</div>
                    <div className="dashboard-card__title">スクラップ作成</div>
                  </Link>
                  <Link href="/settings/profile" className="dashboard-card dashboard-card:hover">
                    <div className="dashboard-card__emoji">⚙️</div>
                    <div className="dashboard-card__title">設定</div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="dashboard__articles">
              <div className="dashboard-filter">
                <div className="dashboard-filter__inner">
                  <div className="dashboard-filter__left">
                    <div className="dashboard-filter__search">
                      <svg className="dashboard-filter__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                      <input 
                        type="text" 
                        placeholder="記事を検索..." 
                        className="dashboard-filter__search-input"
                      />
                    </div>
                  </div>
                  <div className="dashboard-filter__right">
                    <select className="dashboard-filter__sort">
                      <option value="all">すべて</option>
                      <option value="published">公開済み</option>
                      <option value="draft">下書き</option>
                    </select>
                    <Link href="/new/article" className="dashboard-empty__button">
                      新規作成
                    </Link>
                  </div>
                </div>
              </div>
              
              {articles.length > 0 ? (
                <div className="dashboard-table">
                  <table className="dashboard-table__table">
                    <thead className="dashboard-table__header">
                      <tr>
                        <th className="dashboard-table__th dashboard-table__th--main">タイトル</th>
                        <th className="dashboard-table__th dashboard-table__th--status">ステータス</th>
                        <th className="dashboard-table__th dashboard-table__th--date">公開日</th>
                        <th className="dashboard-table__th dashboard-table__th--stats">統計</th>
                        <th className="dashboard-table__th dashboard-table__th--actions">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article: any) => (
                        <tr key={article.id} className="dashboard-table__row">
                          <td className="dashboard-table__td dashboard-table__td--main">
                            <div className="dashboard-table__article">
                              <div className="dashboard-table__emoji">{article.emoji || '📝'}</div>
                              <div className="dashboard-table__info">
                                <Link href={`/articles/${article.slug || article.id}/edit`} className="dashboard-table__title">
                                  {article.title}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="dashboard-table__td dashboard-table__td--status">
                            <span className={`dashboard-badge dashboard-badge--${article.published_at ? 'success' : 'warning'}`}>
                              <span className="dashboard-badge__dot"></span>
                              {article.published_at ? '公開済み' : '下書き'}
                            </span>
                          </td>
                          <td className="dashboard-table__td dashboard-table__td--date">
                            <span className="dashboard-table__date">
                              {article.published_at ? new Date(article.published_at).toLocaleDateString('ja-JP') : '-'}
                            </span>
                          </td>
                          <td className="dashboard-table__td dashboard-table__td--stats">
                            <div className="dashboard-table__stats">
                              <div className="dashboard-table__stat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                {Math.floor(Math.random() * 5000).toLocaleString()}
                              </div>
                              <div className="dashboard-table__stat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                {article.likes_count}
                              </div>
                            </div>
                          </td>
                          <td className="dashboard-table__td dashboard-table__td--actions">
                            <div className="dashboard-table__actions">
                              <Link href={`/articles/${article.slug || article.id}/edit`} className="dashboard-table__action dashboard-table__action--edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                              </Link>
                              <button className="dashboard-table__action dashboard-table__action--delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3,6 5,6 21,6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-empty">
                  <div className="dashboard-empty__icon">📝</div>
                  <h3 className="dashboard-empty__title">記事がありません</h3>
                  <p className="dashboard-empty__text">最初の記事を書いてみましょう。</p>
                  <Link href="/new/article" className="dashboard-empty__button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    記事を書く
                  </Link>
                </div>
              )}
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
