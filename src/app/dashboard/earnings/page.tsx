'use client'

import { EarningsDashboard } from '@/components/monetization/EarningsDashboard'
import { EarningsSummary } from '@/types/monetization'

// サンプルデータ
const getEarningsSummary = (): EarningsSummary => {
  return {
    totalEarnings: 1234567,
    monthlyEarnings: 234567,
    pendingPayouts: 89000,
    currency: 'JPY',
    transactions: [
      {
        id: 'tx1',
        type: 'article_purchase',
        amount: 2980,
        currency: 'JPY',
        status: 'completed',
        buyer: {
          username: 'user1',
          name: '購入者A'
        },
        seller: {
          username: 'me',
          name: '私'
        },
        item: {
          id: 'article1',
          title: 'Next.js 14 完全ガイド',
          type: '有料記事'
        },
        fee: 298,
        netAmount: 2682,
        createdAt: '2025-01-15T10:00:00Z',
        completedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 'tx2',
        type: 'consultation',
        amount: 5000,
        currency: 'JPY',
        status: 'completed',
        buyer: {
          username: 'user2',
          name: '相談者B'
        },
        seller: {
          username: 'me',
          name: '私'
        },
        item: {
          id: 'consultation1',
          title: 'キャリア相談（60分）',
          type: 'コンサルテーション'
        },
        fee: 500,
        netAmount: 4500,
        createdAt: '2025-01-14T14:00:00Z',
        completedAt: '2025-01-14T15:00:00Z'
      },
      {
        id: 'tx3',
        type: 'job_payment',
        amount: 150000,
        currency: 'JPY',
        status: 'pending',
        buyer: {
          username: 'company1',
          name: '発注企業C'
        },
        seller: {
          username: 'me',
          name: '私'
        },
        item: {
          id: 'job1',
          title: 'Webアプリ開発案件（マイルストーン1）',
          type: '受託開発'
        },
        fee: 15000,
        netAmount: 135000,
        createdAt: '2025-01-13T09:00:00Z'
      },
      {
        id: 'tx4',
        type: 'tip',
        amount: 500,
        currency: 'JPY',
        status: 'completed',
        buyer: {
          username: 'user3',
          name: 'サポーターD'
        },
        seller: {
          username: 'me',
          name: '私'
        },
        item: {
          id: 'tip1',
          title: '記事への投げ銭',
          type: '投げ銭'
        },
        fee: 50,
        netAmount: 450,
        createdAt: '2025-01-12T20:00:00Z',
        completedAt: '2025-01-12T20:00:00Z'
      },
      {
        id: 'tx5',
        type: 'article_purchase',
        amount: 1980,
        currency: 'JPY',
        status: 'refunded',
        buyer: {
          username: 'user4',
          name: '購入者E'
        },
        seller: {
          username: 'me',
          name: '私'
        },
        item: {
          id: 'article2',
          title: 'TypeScript設計パターン',
          type: '有料記事'
        },
        fee: 198,
        netAmount: 0,
        createdAt: '2025-01-11T11:00:00Z',
        completedAt: '2025-01-11T11:00:00Z',
        refundedAt: '2025-01-12T10:00:00Z',
        refundReason: '内容が期待と異なった'
      }
    ],
    stats: {
      articlesold: 45,
      consultationsCompleted: 12,
      jobsCompleted: 3,
      averageRating: 4.8
    },
    chartData: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      values: [180000, 210000, 195000, 234567, 250000, 280000]
    }
  }
}

export default function EarningsPage() {
  const summary = getEarningsSummary()
  
  return (
    <div className="container py-8">
      <EarningsDashboard summary={summary} />
    </div>
  )
}