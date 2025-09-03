'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EarningsSummary, Transaction } from '@/types/monetization'

interface EarningsDashboardProps {
  summary: EarningsSummary
}

export const EarningsDashboard = ({ summary }: EarningsDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [showTransactionDetails, setShowTransactionDetails] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`
    }
    return `$${amount.toFixed(2)}`
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'article_purchase': return '📝'
      case 'consultation': return '💬'
      case 'job_payment': return '💼'
      case 'tip': return '💝'
      default: return '💰'
    }
  }

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'article_purchase': return '記事購入'
      case 'consultation': return 'コンサルテーション'
      case 'job_payment': return '案件報酬'
      case 'tip': return '投げ銭'
      default: return '取引'
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="earnings-badge earnings-badge--success">完了</span>
      case 'pending':
        return <span className="earnings-badge earnings-badge--warning">処理中</span>
      case 'failed':
        return <span className="earnings-badge earnings-badge--error">失敗</span>
      case 'refunded':
        return <span className="earnings-badge earnings-badge--refunded">返金済み</span>
      default:
        return null
    }
  }

  return (
    <div className="earnings-dashboard">
      {/* Header */}
      <div className="earnings-dashboard__header">
        <h1 className="earnings-dashboard__title">💰 収益ダッシュボード</h1>
        <div className="earnings-dashboard__actions">
          <Link href="/settings/payment" className="earnings-dashboard__button earnings-dashboard__button--secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V8M8 8L5 5M8 8L11 5M2 11H14V15H2V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            出金申請
          </Link>
          <Link href="/settings/billing" className="earnings-dashboard__button earnings-dashboard__button--primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            請求書発行
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="earnings-dashboard__summary">
        <div className="earnings-card earnings-card--total">
          <div className="earnings-card__icon">💎</div>
          <div className="earnings-card__content">
            <div className="earnings-card__label">総収益</div>
            <div className="earnings-card__amount">
              {formatCurrency(summary.totalEarnings, summary.currency)}
            </div>
            <div className="earnings-card__trend earnings-card__trend--up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L6 6L8 8L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>+12.5%</span>
            </div>
          </div>
        </div>

        <div className="earnings-card earnings-card--monthly">
          <div className="earnings-card__icon">📅</div>
          <div className="earnings-card__content">
            <div className="earnings-card__label">今月の収益</div>
            <div className="earnings-card__amount">
              {formatCurrency(summary.monthlyEarnings, summary.currency)}
            </div>
            <div className="earnings-card__progress">
              <div className="earnings-card__progress-bar">
                <div 
                  className="earnings-card__progress-fill" 
                  style={{ width: '75%' }}
                ></div>
              </div>
              <span className="earnings-card__progress-label">目標の75%達成</span>
            </div>
          </div>
        </div>

        <div className="earnings-card earnings-card--pending">
          <div className="earnings-card__icon">⏳</div>
          <div className="earnings-card__content">
            <div className="earnings-card__label">振込予定額</div>
            <div className="earnings-card__amount">
              {formatCurrency(summary.pendingPayouts, summary.currency)}
            </div>
            <div className="earnings-card__note">
              次回振込: 月末
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="earnings-stats">
        <div className="earnings-stat">
          <div className="earnings-stat__icon">📝</div>
          <div className="earnings-stat__value">{summary.stats.articlesold}</div>
          <div className="earnings-stat__label">記事販売</div>
        </div>
        <div className="earnings-stat">
          <div className="earnings-stat__icon">💬</div>
          <div className="earnings-stat__value">{summary.stats.consultationsCompleted}</div>
          <div className="earnings-stat__label">相談実施</div>
        </div>
        <div className="earnings-stat">
          <div className="earnings-stat__icon">💼</div>
          <div className="earnings-stat__value">{summary.stats.jobsCompleted}</div>
          <div className="earnings-stat__label">案件完了</div>
        </div>
        <div className="earnings-stat">
          <div className="earnings-stat__icon">⭐</div>
          <div className="earnings-stat__value">{summary.stats.averageRating.toFixed(1)}</div>
          <div className="earnings-stat__label">平均評価</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="earnings-chart">
        <div className="earnings-chart__header">
          <h2 className="earnings-chart__title">収益推移</h2>
          <div className="earnings-chart__controls">
            <button 
              className={`earnings-chart__period ${selectedPeriod === 'week' ? 'earnings-chart__period--active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              週
            </button>
            <button 
              className={`earnings-chart__period ${selectedPeriod === 'month' ? 'earnings-chart__period--active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              月
            </button>
            <button 
              className={`earnings-chart__period ${selectedPeriod === 'year' ? 'earnings-chart__period--active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              年
            </button>
          </div>
        </div>
        <div className="earnings-chart__container">
          <div className="earnings-chart__bars">
            {summary.chartData.values.map((value, index) => (
              <div key={index} className="earnings-chart__bar-wrapper">
                <div 
                  className="earnings-chart__bar" 
                  style={{ height: `${(value / Math.max(...summary.chartData.values)) * 100}%` }}
                >
                  <span className="earnings-chart__bar-value">
                    {formatCurrency(value, summary.currency)}
                  </span>
                </div>
                <span className="earnings-chart__bar-label">
                  {summary.chartData.labels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="earnings-transactions">
        <div className="earnings-transactions__header">
          <h2 className="earnings-transactions__title">最近の取引</h2>
          <Link href="/dashboard/transactions" className="earnings-transactions__link">
            すべて見る →
          </Link>
        </div>
        <div className="earnings-transactions__list">
          {summary.transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-item__icon">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="transaction-item__details">
                <div className="transaction-item__title">
                  {transaction.item.title}
                </div>
                <div className="transaction-item__meta">
                  <span className="transaction-item__type">
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                  <span className="transaction-item__buyer">
                    @{transaction.buyer.username}
                  </span>
                  <span className="transaction-item__date">
                    {new Date(transaction.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <div className="transaction-item__amount">
                <div className="transaction-item__gross">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
                <div className="transaction-item__net">
                  手数料: {formatCurrency(transaction.fee, transaction.currency)}
                </div>
              </div>
              <div className="transaction-item__status">
                {getStatusBadge(transaction.status)}
              </div>
              <button
                className="transaction-item__expand"
                onClick={() => setShowTransactionDetails(
                  showTransactionDetails === transaction.id ? null : transaction.id
                )}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d={showTransactionDetails === transaction.id 
                      ? "M4 10L8 6L12 10" 
                      : "M4 6L8 10L12 6"} 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              {showTransactionDetails === transaction.id && (
                <div className="transaction-item__expanded">
                  <div className="transaction-detail">
                    <div className="transaction-detail__row">
                      <span className="transaction-detail__label">取引ID:</span>
                      <span className="transaction-detail__value">{transaction.id}</span>
                    </div>
                    <div className="transaction-detail__row">
                      <span className="transaction-detail__label">売上金額:</span>
                      <span className="transaction-detail__value">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                    <div className="transaction-detail__row">
                      <span className="transaction-detail__label">プラットフォーム手数料 (10%):</span>
                      <span className="transaction-detail__value">
                        -{formatCurrency(transaction.fee, transaction.currency)}
                      </span>
                    </div>
                    <div className="transaction-detail__row transaction-detail__row--total">
                      <span className="transaction-detail__label">受取金額:</span>
                      <span className="transaction-detail__value">
                        {formatCurrency(transaction.netAmount, transaction.currency)}
                      </span>
                    </div>
                    {transaction.refundedAt && (
                      <div className="transaction-detail__row transaction-detail__row--refund">
                        <span className="transaction-detail__label">返金日:</span>
                        <span className="transaction-detail__value">
                          {new Date(transaction.refundedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="earnings-actions">
        <h3 className="earnings-actions__title">クイックアクション</h3>
        <div className="earnings-actions__grid">
          <Link href="/articles/new?paid=true" className="earnings-action">
            <div className="earnings-action__icon">📝</div>
            <div className="earnings-action__label">有料記事を書く</div>
          </Link>
          <Link href="/consultations/new" className="earnings-action">
            <div className="earnings-action__icon">💬</div>
            <div className="earnings-action__label">相談枠を作る</div>
          </Link>
          <Link href="/jobs" className="earnings-action">
            <div className="earnings-action__icon">💼</div>
            <div className="earnings-action__label">案件を探す</div>
          </Link>
          <Link href="/settings/pricing" className="earnings-action">
            <div className="earnings-action__icon">💳</div>
            <div className="earnings-action__label">価格設定</div>
          </Link>
        </div>
      </div>
    </div>
  )
}