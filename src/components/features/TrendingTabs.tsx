'use client'

import { useState } from 'react'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { Tabs } from '@/components/ui/Tabs'

interface Article {
  id: string
  title: string
  emoji: string
  author: {
    username: string
    name: string
    avatar: string
  }
  publishedAt: string
  likes: number
  comments: number
  type: 'tech' | 'idea'
  tags: string[]
}

interface TrendingTabsProps {
  trendingArticles: Article[]
  forYouArticles: Article[]
}

export function TrendingTabs({ trendingArticles, forYouArticles }: TrendingTabsProps) {
  const [activeTab, setActiveTab] = useState('trending')

  const tabs = [
    { id: 'trending', label: 'トレンド' },
    { id: 'foryou', label: 'For you' }
  ]

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'trending' ? (
          <div className="card-grid">
            {trendingArticles.map(article => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        ) : (
          <div className="card-grid">
            {forYouArticles.length > 0 ? (
              forYouArticles.map(article => (
                <ArticleCard key={article.id} {...article} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted">
                  あなたの興味に基づいた記事を表示するには、記事を読んだりいいねをしてください
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}