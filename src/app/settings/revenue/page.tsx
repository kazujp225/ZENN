'use client'

import { useState } from 'react'
import '@/styles/pages/settings.css'

export default function RevenueSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [settings, setSettings] = useState({
    enableMonetization: false,
    payoutMethod: 'bank', // bank, paypal, stripe
    minPayout: 5000,
    bankAccount: {
      bankName: '',
      branchName: '',
      accountType: 'savings',
      accountNumber: '',
      accountHolder: ''
    },
    taxInfo: {
      taxId: '',
      country: 'JP',
      businessType: 'individual'
    }
  })

  const [earnings] = useState({
    total: 45320,
    thisMonth: 8500,
    pending: 3200,
    available: 42120
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: '収益設定を更新しました' })
    } catch (error) {
      setMessage({ type: 'error', text: '設定の更新に失敗しました' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">収益設定</h1>
        <p className="settings-content__description">
          記事や本の収益化設定を管理します
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 収益概要 */}
      <div className="settings-section">
        <h2 className="settings-section__title">収益概要</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>総収益</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ¥{earnings.total.toLocaleString()}
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>今月の収益</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ¥{earnings.thisMonth.toLocaleString()}
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>保留中</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              ¥{earnings.pending.toLocaleString()}
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>出金可能</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              ¥{earnings.available.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 収益化設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">収益化</h2>
        
        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.enableMonetization}
                onChange={(e) => setSettings({ ...settings, enableMonetization: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">収益化を有効にする</div>
                <div className="settings-switch__description">
                  有料記事や本を販売できるようになります
                </div>
              </div>
            </label>
          </div>
        </div>

        {settings.enableMonetization && (
          <>
            <div className="settings-field">
              <label className="settings-field__label">最小出金額</label>
              <select
                value={settings.minPayout}
                onChange={(e) => setSettings({ ...settings, minPayout: parseInt(e.target.value) })}
                className="settings-field__select"
              >
                <option value="1000">¥1,000</option>
                <option value="3000">¥3,000</option>
                <option value="5000">¥5,000</option>
                <option value="10000">¥10,000</option>
              </select>
              <p className="settings-field__help">
                この金額に達すると出金リクエストができます
              </p>
            </div>
          </>
        )}
      </div>

      {/* 支払い方法 */}
      <div className="settings-section">
        <h2 className="settings-section__title">支払い方法</h2>
        
        <div className="settings-field">
          <label className="settings-field__label">出金方法</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payoutMethod"
                value="bank"
                checked={settings.payoutMethod === 'bank'}
                onChange={(e) => setSettings({ ...settings, payoutMethod: e.target.value })}
                style={{ marginRight: '8px' }}
              />
              <span>銀行振込</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payoutMethod"
                value="paypal"
                checked={settings.payoutMethod === 'paypal'}
                onChange={(e) => setSettings({ ...settings, payoutMethod: e.target.value })}
                style={{ marginRight: '8px' }}
              />
              <span>PayPal</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="payoutMethod"
                value="stripe"
                checked={settings.payoutMethod === 'stripe'}
                onChange={(e) => setSettings({ ...settings, payoutMethod: e.target.value })}
                style={{ marginRight: '8px' }}
              />
              <span>Stripe</span>
            </label>
          </div>
        </div>

        {settings.payoutMethod === 'bank' && (
          <>
            <div className="settings-field">
              <label className="settings-field__label">銀行名</label>
              <input
                type="text"
                value={settings.bankAccount.bankName}
                onChange={(e) => setSettings({
                  ...settings,
                  bankAccount: { ...settings.bankAccount, bankName: e.target.value }
                })}
                className="settings-field__input"
                placeholder="例: 三菱UFJ銀行"
              />
            </div>

            <div className="settings-field">
              <label className="settings-field__label">支店名</label>
              <input
                type="text"
                value={settings.bankAccount.branchName}
                onChange={(e) => setSettings({
                  ...settings,
                  bankAccount: { ...settings.bankAccount, branchName: e.target.value }
                })}
                className="settings-field__input"
                placeholder="例: 渋谷支店"
              />
            </div>

            <div className="settings-field">
              <label className="settings-field__label">口座種別</label>
              <select
                value={settings.bankAccount.accountType}
                onChange={(e) => setSettings({
                  ...settings,
                  bankAccount: { ...settings.bankAccount, accountType: e.target.value }
                })}
                className="settings-field__select"
              >
                <option value="savings">普通</option>
                <option value="checking">当座</option>
              </select>
            </div>

            <div className="settings-field">
              <label className="settings-field__label">口座番号</label>
              <input
                type="text"
                value={settings.bankAccount.accountNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  bankAccount: { ...settings.bankAccount, accountNumber: e.target.value }
                })}
                className="settings-field__input"
                placeholder="1234567"
              />
            </div>

            <div className="settings-field">
              <label className="settings-field__label">口座名義（カナ）</label>
              <input
                type="text"
                value={settings.bankAccount.accountHolder}
                onChange={(e) => setSettings({
                  ...settings,
                  bankAccount: { ...settings.bankAccount, accountHolder: e.target.value }
                })}
                className="settings-field__input"
                placeholder="ヤマダ タロウ"
              />
            </div>
          </>
        )}
      </div>

      {/* 税務情報 */}
      <div className="settings-section">
        <h2 className="settings-section__title">税務情報</h2>
        
        <div className="settings-field">
          <label className="settings-field__label">納税者番号</label>
          <input
            type="text"
            value={settings.taxInfo.taxId}
            onChange={(e) => setSettings({
              ...settings,
              taxInfo: { ...settings.taxInfo, taxId: e.target.value }
            })}
            className="settings-field__input"
            placeholder="マイナンバーまたは法人番号"
          />
          <p className="settings-field__help">
            税務申告に必要な情報です。個人の方はマイナンバーを入力してください。
          </p>
        </div>

        <div className="settings-field">
          <label className="settings-field__label">事業形態</label>
          <select
            value={settings.taxInfo.businessType}
            onChange={(e) => setSettings({
              ...settings,
              taxInfo: { ...settings.taxInfo, businessType: e.target.value }
            })}
            className="settings-field__select"
          >
            <option value="individual">個人</option>
            <option value="corporation">法人</option>
            <option value="freelance">個人事業主</option>
          </select>
        </div>
      </div>

      {/* 収益履歴 */}
      <div className="settings-section">
        <h2 className="settings-section__title">出金履歴</h2>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>日付</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>金額</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>方法</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>状態</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>2024/01/15</td>
              <td style={{ padding: '12px' }}>¥15,000</td>
              <td style={{ padding: '12px' }}>銀行振込</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '2px 8px', 
                  background: '#10b981', 
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>完了</span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>2023/12/20</td>
              <td style={{ padding: '12px' }}>¥8,500</td>
              <td style={{ padding: '12px' }}>銀行振込</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '2px 8px', 
                  background: '#10b981', 
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>完了</span>
              </td>
            </tr>
          </tbody>
        </table>

        <button 
          className="settings-button settings-button--secondary"
          style={{ marginTop: '16px' }}
        >
          出金をリクエスト
        </button>
      </div>

      <div className="settings-form__actions">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="settings-button settings-button--primary"
        >
          {isLoading ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  )
}