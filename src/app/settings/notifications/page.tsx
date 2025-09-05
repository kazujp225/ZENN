'use client'

import { useState } from 'react'
import '@/styles/pages/settings.css'

interface NotificationSettings {
  email: {
    comments: boolean
    likes: boolean
    follows: boolean
    mentions: boolean
    weeklyDigest: boolean
    productUpdates: boolean
  }
  push: {
    comments: boolean
    likes: boolean
    follows: boolean
    mentions: boolean
  }
  desktop: {
    enabled: boolean
    sound: boolean
  }
}

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      comments: true,
      likes: false,
      follows: true,
      mentions: true,
      weeklyDigest: true,
      productUpdates: false
    },
    push: {
      comments: true,
      likes: false,
      follows: true,
      mentions: true
    },
    desktop: {
      enabled: true,
      sound: false
    }
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: '通知設定を更新しました' })
    } catch (error) {
      setMessage({ type: 'error', text: '設定の更新に失敗しました' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggle = (category: 'email' | 'push', key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev.email]
      }
    }))
  }

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">通知設定</h1>
        <p className="settings-content__description">
          通知の受け取り方法をカスタマイズします
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* メール通知 */}
      <div className="settings-section">
        <h2 className="settings-section__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          メール通知
        </h2>
        <p className="settings-section__description">
          重要な更新をメールで受け取ります
        </p>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.comments}
                onChange={() => handleToggle('email', 'comments')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">コメント</div>
                <div className="settings-switch__description">
                  あなたの記事にコメントがついたとき
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.likes}
                onChange={() => handleToggle('email', 'likes')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">いいね</div>
                <div className="settings-switch__description">
                  あなたの記事がいいねされたとき
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.follows}
                onChange={() => handleToggle('email', 'follows')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">フォロー</div>
                <div className="settings-switch__description">
                  新しいフォロワーが増えたとき
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.mentions}
                onChange={() => handleToggle('email', 'mentions')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">メンション</div>
                <div className="settings-switch__description">
                  誰かがあなたをメンションしたとき
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.weeklyDigest}
                onChange={() => handleToggle('email', 'weeklyDigest')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">週間ダイジェスト</div>
                <div className="settings-switch__description">
                  毎週の人気記事とトレンドをお届け
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.email.productUpdates}
                onChange={() => handleToggle('email', 'productUpdates')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">プロダクトアップデート</div>
                <div className="settings-switch__description">
                  Zennの新機能やお知らせ
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* プッシュ通知 */}
      <div className="settings-section">
        <h2 className="settings-section__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          プッシュ通知
        </h2>
        <p className="settings-section__description">
          ブラウザのプッシュ通知で即座にお知らせ
        </p>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.push.comments}
                onChange={() => handleToggle('push', 'comments')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">コメント</div>
                <div className="settings-switch__description">
                  リアルタイムでコメント通知を受け取る
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.push.likes}
                onChange={() => handleToggle('push', 'likes')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">いいね</div>
                <div className="settings-switch__description">
                  いいね通知をリアルタイムで受け取る
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.push.follows}
                onChange={() => handleToggle('push', 'follows')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">フォロー</div>
                <div className="settings-switch__description">
                  新しいフォロワーの通知を即座に受け取る
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.push.mentions}
                onChange={() => handleToggle('push', 'mentions')}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">メンション</div>
                <div className="settings-switch__description">
                  メンション通知を即座に受け取る
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* デスクトップ通知 */}
      <div className="settings-section">
        <h2 className="settings-section__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
          </svg>
          デスクトップ通知
        </h2>
        <p className="settings-section__description">
          デスクトップに通知を表示します
        </p>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.desktop.enabled}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  desktop: { ...prev.desktop, enabled: !prev.desktop.enabled }
                }))}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">デスクトップ通知を有効化</div>
                <div className="settings-switch__description">
                  ブラウザの許可が必要です
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.desktop.sound}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  desktop: { ...prev.desktop, sound: !prev.desktop.sound }
                }))}
                className="settings-switch__input"
                disabled={!settings.desktop.enabled}
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">通知音</div>
                <div className="settings-switch__description">
                  通知時にサウンドを再生
                </div>
              </div>
            </label>
          </div>
        </div>

        {settings.desktop.enabled && (
          <button className="settings-button settings-button--secondary">
            通知をテスト
          </button>
        )}
      </div>

      {/* 通知頻度 */}
      <div className="settings-section">
        <h2 className="settings-section__title">通知頻度</h2>
        <div className="settings-frequency">
          <div className="settings-field">
            <label className="settings-field__label">通知をまとめる</label>
            <select className="settings-field__select">
              <option value="instant">即座に通知</option>
              <option value="5min">5分ごとにまとめる</option>
              <option value="30min">30分ごとにまとめる</option>
              <option value="1hour">1時間ごとにまとめる</option>
            </select>
            <p className="settings-field__help">
              複数の通知を指定した間隔でまとめて受け取ります
            </p>
          </div>

          <div className="settings-field">
            <label className="settings-field__label">通知を停止する時間帯</label>
            <div className="settings-time-range">
              <input type="time" className="settings-field__input settings-field__input--time" defaultValue="22:00" />
              <span>〜</span>
              <input type="time" className="settings-field__input settings-field__input--time" defaultValue="07:00" />
            </div>
            <p className="settings-field__help">
              指定した時間帯は通知を送信しません
            </p>
          </div>
        </div>
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