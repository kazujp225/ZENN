"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { BookCard } from "@/components/cards/BookCard";
import { ScrapCard } from "@/components/cards/ScrapCard";
import { TrendingTabs } from "@/components/features/TrendingTabs";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { articlesApi, booksApi, scrapsApi } from "@/lib/api";
import type { Article, Book, Scrap } from "@/lib/api";

export default function HomePage() {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [ideaArticles, setIdeaArticles] = useState<Article[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [activeScraps, setActiveScraps] = useState<Scrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 並列でデータを取得
      const [trendingRes, ideaRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getPublishedArticles(6, 0),
        articlesApi.getPublishedArticles(4, 0), // ideaの代わりにすべての記事
        booksApi.getPublishedBooks(4, 0),
        scrapsApi.getOpenScraps(6, 0),
      ]);

      // データを設定
      setTrendingArticles(trendingRes.data || []);
      setIdeaArticles(
        ideaRes.data?.filter((article) => article.type === "idea") || [],
      );
      setFeaturedBooks(booksRes.data || []);
      setActiveScraps(scrapsRes.data || []);
    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              エラーが発生しました
            </h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAllData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - コンテンツドリブンな配置 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 大きなホワイトスペースで重要性を強調 */}
          <div className="py-20 md:py-32">
            {/* 視覚的アンカーポイント - メインメッセージ */}
            <div className="text-center space-y-8">
              {/* メインタイトル - 最大の視覚的重み */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                  <span className="text-gray-900 leading-tight">
                    エンジニアのための
                  </span>
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                    ナレッジベース
                  </span>
                </h1>

                {/* サブタイトル - セカンダリアンカー */}
                <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                  技術記事、書籍、スクラップで知識を共有し、
                  <span className="block mt-1">学び続けよう</span>
                </p>
              </div>

              {/* CTAボタン群 - 並列配置で比較を促す */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8">
                {/* プライマリCTA - 視覚的に強調 */}
                <Link
                  href="/articles"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>記事を読む</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>

                {/* セカンダリCTA */}
                <Link
                  href="/books"
                  className="group relative inline-flex items-center gap-3 bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>本を探す</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </Link>
              </div>

              {/* 統計情報 - テキスト中心の単一カラム */}
              <div className="flex justify-center items-center gap-8 md:gap-16 pt-12">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">技術記事</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    500+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">技術書籍</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">エンジニア</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-3 space-y-12">
            {/* トレンディング記事 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📈 トレンディング
                </h2>
                <Link
                  href="/trending"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  もっと見る →
                </Link>
              </div>
              <TrendingTabs />
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {trendingArticles.slice(0, 4).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={{
                      id: article.id,
                      title: article.title,
                      emoji: article.emoji,
                      author: {
                        username: article.user?.username || "Unknown",
                        name:
                          article.user?.display_name ||
                          article.user?.username ||
                          "Unknown",
                        avatar:
                          article.user?.avatar_url ||
                          "/images/avatar-placeholder.svg",
                      },
                      publishedAt: article.published_at || article.created_at,
                      likes: article.likes_count,
                      comments: article.comments_count,
                      type: article.type as "tech" | "idea",
                      tags: article.topics || [],
                    }}
                  />
                ))}
              </div>
            </section>

            {/* 書籍 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📚 注目の書籍
                </h2>
                <Link
                  href="/books"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  もっと見る →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={{
                      id: book.id,
                      title: book.title,
                      author: {
                        username: book.user?.username || "Unknown",
                        name:
                          book.user?.display_name ||
                          book.user?.username ||
                          "Unknown",
                        avatar:
                          book.user?.avatar_url ||
                          "/images/avatar-placeholder.svg",
                      },
                      coverImage:
                        book.cover_image_url || "/images/book-placeholder.svg",
                      price: book.price || 0,
                      isFree: book.is_free,
                      rating: 4.5,
                      reviews: book.likes_count,
                      publishedAt: book.published_at || book.created_at,
                    }}
                  />
                ))}
              </div>
            </section>

            {/* スクラップ */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  💬 活発なスクラップ
                </h2>
                <Link
                  href="/scraps"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  もっと見る →
                </Link>
              </div>
              <div className="space-y-4">
                {activeScraps.slice(0, 4).map((scrap) => (
                  <ScrapCard
                    key={scrap.id}
                    scrap={{
                      id: scrap.id,
                      title: scrap.title,
                      emoji: scrap.emoji,
                      author: {
                        username: scrap.user?.username || "Unknown",
                        name:
                          scrap.user?.display_name ||
                          scrap.user?.username ||
                          "Unknown",
                        avatar:
                          scrap.user?.avatar_url ||
                          "/images/avatar-placeholder.svg",
                      },
                      publishedAt: scrap.created_at,
                      comments: scrap.comments_count,
                      isOpen: !scrap.closed,
                      tags: [],
                    }}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <AIRecommendations />

              {/* 統計情報 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📊 統計情報
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">総記事数</span>
                    <span className="font-semibold">
                      {trendingArticles.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">総書籍数</span>
                    <span className="font-semibold">
                      {featuredBooks.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">活発なスクラップ</span>
                    <span className="font-semibold">{activeScraps.length}</span>
                  </div>
                </div>
              </div>

              {/* 人気タグ */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  🏷️ 人気タグ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "TypeScript",
                    "Next.js",
                    "Python",
                    "AWS",
                    "Docker",
                  ].map((tag) => (
                    <Link
                      key={tag}
                      href={`/topics/${tag}`}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
