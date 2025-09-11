'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Users, BookOpen, FileText, Activity, Calendar } from 'lucide-react'
import '@/styles/components/analytics-dashboard.css'

interface Analytics {
  overview: {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalFollowers: number
    totalArticles: number
    totalBooks: number
    viewsChange: number
    likesChange: number
    commentsChange: number
    followersChange: number
  }
  viewsTimeline: Array<{ date: string; views: number; uniqueViews: number }>
  contentPerformance: Array<{ title: string; views: number; likes: number; comments: number; engagementRate: number }>
  topTags: Array<{ tag: string; count: number; percentage: number }>
  readerDemographics: Array<{ source: string; value: number }>
  engagementByHour: Array<{ hour: string; engagement: number }>
  contentTypeDistribution: Array<{ type: string; count: number }>
  readerRetention: Array<{ period: string; newReaders: number; returningReaders: number }>
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [contentType, setContentType] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, contentType])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    
    // ダミーデータの生成
    setTimeout(() => {
      setAnalytics({
        overview: {
          totalViews: 45678,
          totalLikes: 3456,
          totalComments: 789,
          totalFollowers: 1234,
          totalArticles: 42,
          totalBooks: 3,
          viewsChange: 12.5,
          likesChange: 8.3,
          commentsChange: -2.1,
          followersChange: 15.7
        },
        viewsTimeline: [
          { date: '2024-01-01', views: 1234, uniqueViews: 987 },
          { date: '2024-01-02', views: 1456, uniqueViews: 1123 },
          { date: '2024-01-03', views: 1678, uniqueViews: 1345 },
          { date: '2024-01-04', views: 1890, uniqueViews: 1567 },
          { date: '2024-01-05', views: 2012, uniqueViews: 1678 },
          { date: '2024-01-06', views: 1789, uniqueViews: 1456 },
          { date: '2024-01-07', views: 2234, uniqueViews: 1890 },
        ],
        contentPerformance: [
          { title: 'Next.js 14の新機能', views: 5678, likes: 456, comments: 89, engagementRate: 8.5 },
          { title: 'TypeScriptベストプラクティス', views: 4567, likes: 378, comments: 67, engagementRate: 7.8 },
          { title: 'React Server Components入門', views: 3456, likes: 289, comments: 56, engagementRate: 9.2 },
          { title: 'Tailwind CSS活用術', views: 2345, likes: 234, comments: 45, engagementRate: 10.5 },
          { title: 'GraphQL実装ガイド', views: 1234, likes: 123, comments: 34, engagementRate: 11.2 },
        ],
        topTags: [
          { tag: 'React', count: 892, percentage: 25.5 },
          { tag: 'Next.js', count: 756, percentage: 21.6 },
          { tag: 'TypeScript', count: 634, percentage: 18.1 },
          { tag: 'JavaScript', count: 512, percentage: 14.6 },
          { tag: 'CSS', count: 389, percentage: 11.1 },
          { tag: 'Node.js', count: 317, percentage: 9.1 },
        ],
        readerDemographics: [
          { source: 'オーガニック検索', value: 4500 },
          { source: '直接アクセス', value: 3200 },
          { source: 'SNS', value: 2800 },
          { source: 'メール', value: 1200 },
          { source: 'その他', value: 800 },
        ],
        engagementByHour: [
          { hour: '00', engagement: 45 },
          { hour: '03', engagement: 23 },
          { hour: '06', engagement: 67 },
          { hour: '09', engagement: 234 },
          { hour: '12', engagement: 345 },
          { hour: '15', engagement: 289 },
          { hour: '18', engagement: 378 },
          { hour: '21', engagement: 256 },
        ],
        contentTypeDistribution: [
          { type: '記事', count: 42 },
          { type: '本', count: 3 },
          { type: 'スクラップ', count: 28 },
        ],
        readerRetention: [
          { period: '今週', newReaders: 234, returningReaders: 567 },
          { period: '先週', newReaders: 189, returningReaders: 489 },
          { period: '2週前', newReaders: 156, returningReaders: 423 },
          { period: '3週前', newReaders: 145, returningReaders: 389 },
        ]
      })
      setIsLoading(false)
    }, 1000)
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon 
  }: { 
    title: string
    value: number | string
    change?: number
    icon: any 
  }) => (
    <Card className="analytics-stat-card">
      <CardHeader className="analytics-stat-card__header">
        <CardTitle className="analytics-stat-card__title">{title}</CardTitle>
        <Icon className="analytics-stat-card__icon" />
      </CardHeader>
      <CardContent>
        <div className="analytics-stat-card__value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className={`analytics-stat-card__change ${change >= 0 ? 'analytics-stat-card__change--positive' : 'analytics-stat-card__change--negative'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  if (isLoading) {
    return (
      <div className="analytics-dashboard analytics-dashboard--loading">
        <div className="analytics-dashboard__spinner" />
        <p>分析データを読み込んでいます...</p>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-dashboard__header">
        <h1 className="analytics-dashboard__title">
          <Activity className="w-6 h-6" />
          アナリティクスダッシュボード
        </h1>
        <div className="analytics-dashboard__filters">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="analytics-dashboard__select">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">過去7日間</SelectItem>
              <SelectItem value="30d">過去30日間</SelectItem>
              <SelectItem value="90d">過去90日間</SelectItem>
              <SelectItem value="1y">過去1年間</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="analytics-dashboard__select">
              <SelectValue placeholder="コンテンツタイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="articles">記事</SelectItem>
              <SelectItem value="books">本</SelectItem>
              <SelectItem value="scraps">スクラップ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 概要ステータス */}
      <div className="analytics-dashboard__stats">
        <StatCard 
          title="総閲覧数" 
          value={analytics.overview.totalViews} 
          change={analytics.overview.viewsChange}
          icon={Eye}
        />
        <StatCard 
          title="総いいね数" 
          value={analytics.overview.totalLikes} 
          change={analytics.overview.likesChange}
          icon={Heart}
        />
        <StatCard 
          title="総コメント数" 
          value={analytics.overview.totalComments} 
          change={analytics.overview.commentsChange}
          icon={MessageSquare}
        />
        <StatCard 
          title="フォロワー数" 
          value={analytics.overview.totalFollowers} 
          change={analytics.overview.followersChange}
          icon={Users}
        />
      </div>

      <Tabs defaultValue="views" className="analytics-dashboard__tabs">
        <TabsList className="analytics-dashboard__tabs-list">
          <TabsTrigger value="views">閲覧数</TabsTrigger>
          <TabsTrigger value="engagement">エンゲージメント</TabsTrigger>
          <TabsTrigger value="content">コンテンツ</TabsTrigger>
          <TabsTrigger value="audience">オーディエンス</TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="analytics-dashboard__tab-content">
          <Card>
            <CardHeader>
              <CardTitle>閲覧数の推移</CardTitle>
              <CardDescription>総閲覧数とユニーク閲覧数</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.viewsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="総閲覧数" />
                  <Area type="monotone" dataKey="uniqueViews" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="ユニーク閲覧数" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="analytics-dashboard__grid">
            <Card>
              <CardHeader>
                <CardTitle>時間帯別エンゲージメント</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.engagementByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>読者リテンション</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.readerRetention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newReaders" fill="#f59e0b" name="新規読者" />
                    <Bar dataKey="returningReaders" fill="#3b82f6" name="リピーター" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="analytics-dashboard__tab-content">
          <Card>
            <CardHeader>
              <CardTitle>コンテンツパフォーマンス</CardTitle>
              <CardDescription>各コンテンツのエンゲージメント率</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="analytics-dashboard__performance-list">
                {analytics.contentPerformance.map((content, index) => (
                  <div key={index} className="analytics-dashboard__performance-item">
                    <div className="analytics-dashboard__performance-header">
                      <h4>{content.title}</h4>
                      <span className="analytics-dashboard__performance-rate">
                        {content.engagementRate}%
                      </span>
                    </div>
                    <div className="analytics-dashboard__performance-stats">
                      <span><Eye className="w-4 h-4" /> {content.views.toLocaleString()}</span>
                      <span><Heart className="w-4 h-4" /> {content.likes}</span>
                      <span><MessageSquare className="w-4 h-4" /> {content.comments}</span>
                    </div>
                    <div className="analytics-dashboard__performance-bar">
                      <div 
                        className="analytics-dashboard__performance-fill"
                        style={{ width: `${content.engagementRate * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="analytics-dashboard__tab-content">
          <div className="analytics-dashboard__grid">
            <Card>
              <CardHeader>
                <CardTitle>人気タグ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.topTags}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tag, percentage }) => `${tag} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.topTags.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>コンテンツタイプ分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analytics.contentTypeDistribution}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="type" />
                    <Radar name="投稿数" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="analytics-dashboard__tab-content">
          <Card>
            <CardHeader>
              <CardTitle>トラフィックソース</CardTitle>
              <CardDescription>読者の流入元</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.readerDemographics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="source" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {analytics.readerDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}