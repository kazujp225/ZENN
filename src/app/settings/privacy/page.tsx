'use client'

import { useState } from 'react'
import '@/styles/pages/settings.css'

export default function PrivacySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, followers, private
    showEmail: false,
    showLocation: true,
    showCompany: true,
    showWebsite: true,
    showSocialLinks: true,
    allowFollowing: true,
    allowMessages: 'everyone', // everyone, followers, none
    showActivityStatus: true,
    showReadingList: true,
    showLikedArticles: false,
    indexBySearchEngines: true,
    shareDataWithPartners: false,
    personalizedAds: false,
    analyticsTracking: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'プライバシー設定を更新しました' })
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
        <h1 className="settings-content__title">プライバシー設定</h1>
        <p className="settings-content__description">
          プロフィールの公開範囲とプライバシーを管理します
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* プロフィール公開設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">プロフィール公開設定</h2>
        
        <div className="settings-field">
          <label className="settings-field__label">プロフィールの公開範囲</label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
            className="settings-field__select"
          >
            <option value="public">全体に公開</option>
            <option value="followers">フォロワーのみ</option>
            <option value="private">非公開</option>
          </select>
          <p className="settings-field__help">
            プロフィールページを閲覧できるユーザーを制限します
          </p>
        </div>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showEmail}
                onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">メールアドレスを公開</div>
                <div className="settings-switch__description">
                  プロフィールにメールアドレスを表示します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showLocation}
                onChange={(e) => setSettings({ ...settings, showLocation: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">所在地を表示</div>
                <div className="settings-switch__description">
                  プロフィールに所在地情報を表示します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showCompany}
                onChange={(e) => setSettings({ ...settings, showCompany: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">会社名を表示</div>
                <div className="settings-switch__description">
                  プロフィールに所属企業を表示します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showSocialLinks}
                onChange={(e) => setSettings({ ...settings, showSocialLinks: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">ソーシャルリンクを表示</div>
                <div className="settings-switch__description">
                  GitHub、Twitter等のリンクを表示します
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* アクティビティ設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">アクティビティ</h2>
        
        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showActivityStatus}
                onChange={(e) => setSettings({ ...settings, showActivityStatus: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">オンライン状態を表示</div>
                <div className="settings-switch__description">
                  最終ログイン時刻を他のユーザーに表示します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showReadingList}
                onChange={(e) => setSettings({ ...settings, showReadingList: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">読書リストを公開</div>
                <div className="settings-switch__description">
                  保存した記事のリストを他のユーザーに公開します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showLikedArticles}
                onChange={(e) => setSettings({ ...settings, showLikedArticles: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">いいねした記事を公開</div>
                <div className="settings-switch__description">
                  いいねした記事を他のユーザーに表示します
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* コミュニケーション設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">コミュニケーション</h2>
        
        <div className="settings-field">
          <label className="settings-field__label">メッセージを受け取る</label>
          <select
            value={settings.allowMessages}
            onChange={(e) => setSettings({ ...settings, allowMessages: e.target.value })}
            className="settings-field__select"
          >
            <option value="everyone">全員から</option>
            <option value="followers">フォロワーのみ</option>
            <option value="none">受け取らない</option>
          </select>
          <p className="settings-field__help">
            ダイレクトメッセージを送信できるユーザーを制限します
          </p>
        </div>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.allowFollowing}
                onChange={(e) => setSettings({ ...settings, allowFollowing: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">フォローを許可</div>
                <div className="settings-switch__description">
                  他のユーザーがあなたをフォローできるようにします
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 検索とデータ */}
      <div className="settings-section">
        <h2 className="settings-section__title">検索とデータ</h2>
        
        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.indexBySearchEngines}
                onChange={(e) => setSettings({ ...settings, indexBySearchEngines: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">検索エンジンのインデックスを許可</div>
                <div className="settings-switch__description">
                  GoogleやBing等の検索結果にプロフィールが表示されます
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.analyticsTracking}
                onChange={(e) => setSettings({ ...settings, analyticsTracking: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">分析データの収集</div>
                <div className="settings-switch__description">
                  サービス改善のための匿名データ収集を許可します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.personalizedAds}
                onChange={(e) => setSettings({ ...settings, personalizedAds: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">パーソナライズド広告</div>
                <div className="settings-switch__description">
                  興味関心に基づいた広告の表示を許可します
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* データエクスポート */}
      <div className="settings-section">
        <h2 className="settings-section__title">データ管理</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="settings-button settings-button--secondary">
            データをエクスポート
          </button>
          <button className="settings-button settings-button--secondary">
            データをダウンロード
          </button>
        </div>
        <p className="settings-field__help" style={{ marginTop: '12px' }}>
          あなたの投稿、コメント、プロフィール情報をダウンロードできます
        </p>
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