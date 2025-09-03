'use client'

import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { PageProvider } from '@/providers/EnhancedAppProvider'

// Mock data for trending content
const mockTrendingArticles = [
  {
    id: '1',
    title: 'React 19の新機能完全ガイド',
    emoji: '⚡',
    content: 'React 19の注目すべき新機能について詳しく解説します...',
    author: {
      id: 'author1',
      name: 'React Developer',
      username: 'reactdev',
      avatar: '/images/avatar-placeholder.svg',
      githubUsername: 'reactdev'
    },
    publishedAt: '2024-01-15',
    likes: 245,
    comments: 32,
    tags: ['React', 'JavaScript', 'Frontend'],
    type: 'tech' as const,
    slug: 'react-19-features',
    isLiked: false
  },
  {
    id: '2',
    title: 'TypeScriptでより良いコードを書くための10のTips',
    emoji: '📝',
    content: 'TypeScriptを使ってより保守性の高いコードを書くための実践的なアドバイス...',
    author: {
      id: 'author2',
      name: 'TypeScript Master',
      username: 'tsmaster',
      avatar: '/images/avatar-placeholder.svg',
      githubUsername: 'tsmaster'
    },
    publishedAt: '2024-01-14',
    likes: 189,
    comments: 24,
    tags: ['TypeScript', 'JavaScript'],
    type: 'tech' as const,
    slug: 'typescript-tips',
    isLiked: false
  }
]

const mockTrendingBooks = [
  {
    id: '1',
    title: 'モダンフロントエンド開発入門',
    emoji: '📚',
    description: 'React、Next.js、TypeScriptを使った現代的なフロントエンド開発手法を学びます',
    author: {
      id: 'author1',
      name: 'Frontend Expert',
      username: 'frontend-expert',
      avatar: '/images/avatar-placeholder.svg',
      githubUsername: 'frontend-expert'
    },
    publishedAt: '2024-01-10',
    likes: 156,
    price: 1980,
    chapters: 12,
    tags: ['React', 'Next.js', 'TypeScript'],
    slug: 'modern-frontend-development',
    isLiked: false
  }
]

const mockTrendingScraps = [
  {
    id: '1',
    title: '新しいCSS機能についての雑談',
    author: {
      id: 'author3',
      name: 'CSS Ninja',
      username: 'css-ninja',
      avatar: '/images/avatar-placeholder.svg',
      githubUsername: 'css-ninja'
    },
    publishedAt: '2024-01-16',
    likes: 42,
    comments: 15,
    isLiked: false,
    slug: 'css-discussion',
    status: 'open' as const
  }
]

export default function TrendingPage() {

  return (
    <PageProvider title="Trending" description="トレンドの記事、本、スクラップ">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔥 Trending
            </h1>
            <p className="text-gray-600">
              今話題になっている記事、本、スクラップをチェックしよう
            </p>
          </div>

          <Tabs 
            tabs={[
              { key: 'articles', label: '記事', content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    トレンディング記事
                  </h2>
                  <span className="text-sm text-gray-500">
                    過去24時間で最も注目された記事
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTrendingArticles.map((article) => (
                    <ArticleCard key={article.id} {...article} />
                  ))}
                </div>
              </div>
              ) },
              { key: 'books', label: '本', content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    トレンディング本
                  </h2>
                  <span className="text-sm text-gray-500">
                    最近人気が高まっている本
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTrendingBooks.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              </div>
              ) },
              { key: 'scraps', label: 'スクラップ', content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    トレンディングスクラップ
                  </h2>
                  <span className="text-sm text-gray-500">
                    活発な議論が行われているスクラップ
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTrendingScraps.map((scrap) => (
                    <ScrapCard key={scrap.id} {...scrap} />
                  ))}
                </div>
              </div>
              ) }
            ]}
            defaultTab="articles"
          />
        </div>
      </div>
    </PageProvider>
  )
}