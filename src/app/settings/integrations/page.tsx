'use client'

import { useState } from 'react'
import '@/styles/pages/settings.css'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  connectedAccount?: string
  permissions?: string[]
}

export default function IntegrationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'GitHubリポジトリと連携して、コードを記事に埋め込みます',
      icon: 'github',
      connected: true,
      connectedAccount: '@username',
      permissions: ['リポジトリの読み取り', 'Gistの作成']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: '記事を自動的にツイートしたり、埋め込みツイートを表示します',
      icon: 'twitter',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: '新しい記事やコメントの通知をSlackに送信します',
      icon: 'slack',
      connected: false,
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Notionのページを記事としてインポートします',
      icon: 'notion',
      connected: false,
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Figmaのデザインを記事に埋め込みます',
      icon: 'figma',
      connected: false,
    },
    {
      id: 'codesandbox',
      name: 'CodeSandbox',
      description: 'インタラクティブなコードサンプルを埋め込みます',
      icon: 'codesandbox',
      connected: true,
      connectedAccount: 'user@example.com',
    },
  ])

  const handleConnect = async (id: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIntegrations(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, connected: true, connectedAccount: 'connected@example.com' }
            : item
        )
      )
      setMessage({ type: 'success', text: '連携が完了しました' })
    } catch (error) {
      setMessage({ type: 'error', text: '連携に失敗しました' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('この連携を解除してもよろしいですか？')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIntegrations(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, connected: false, connectedAccount: undefined }
            : item
        )
      )
      setMessage({ type: 'success', text: '連携を解除しました' })
    } catch (error) {
      setMessage({ type: 'error', text: '連携の解除に失敗しました' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const getIconColor = (icon: string) => {
    const colors: Record<string, string> = {
      github: '#24292E',
      twitter: '#1DA1F2',
      slack: '#4A154B',
      notion: '#000000',
      figma: '#F24E1E',
      codesandbox: '#040404',
    }
    return colors[icon] || '#666'
  }

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">外部サービス連携</h1>
        <p className="settings-content__description">
          外部サービスと連携して機能を拡張します
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 連携済みサービス */}
      <div className="settings-section">
        <h2 className="settings-section__title">連携済みのサービス</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {integrations.filter(item => item.connected).map(integration => (
            <div key={integration.id} className="settings-connection">
              <div className="settings-connection__provider">
                <div 
                  className="settings-connection__icon"
                  style={{ background: getIconColor(integration.icon) }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <rect width="24" height="24" />
                  </svg>
                </div>
                <div>
                  <div className="settings-connection__name">{integration.name}</div>
                  <div className="settings-connection__status">
                    接続済み: {integration.connectedAccount}
                  </div>
                  {integration.permissions && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      権限: {integration.permissions.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDisconnect(integration.id)}
                disabled={isLoading}
                className="settings-button settings-button--ghost"
              >
                連携を解除
              </button>
            </div>
          ))}
          
          {integrations.filter(item => item.connected).length === 0 && (
            <p style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
              連携済みのサービスはありません
            </p>
          )}
        </div>
      </div>

      {/* 利用可能なサービス */}
      <div className="settings-section">
        <h2 className="settings-section__title">利用可能なサービス</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {integrations.filter(item => !item.connected).map(integration => (
            <div key={integration.id} className="settings-connection">
              <div className="settings-connection__provider">
                <div 
                  className="settings-connection__icon"
                  style={{ background: getIconColor(integration.icon) }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <rect width="24" height="24" />
                  </svg>
                </div>
                <div>
                  <div className="settings-connection__name">{integration.name}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {integration.description}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleConnect(integration.id)}
                disabled={isLoading}
                className="settings-button settings-button--primary"
              >
                連携する
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">Webhook</h2>
        <p className="settings-section__description">
          特定のイベントが発生した時に、指定したURLにPOSTリクエストを送信します
        </p>
        
        <div className="settings-field">
          <label className="settings-field__label">Webhook URL</label>
          <input
            type="url"
            placeholder="https://example.com/webhook"
            className="settings-field__input"
          />
          <p className="settings-field__help">
            記事の公開、コメントの投稿などのイベントを通知します
          </p>
        </div>

        <div className="settings-field">
          <label className="settings-field__label">イベント</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['記事の公開', '記事の更新', 'コメントの投稿', 'フォロー通知'].map(event => (
              <label key={event} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '14px' }}>{event}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="settings-button settings-button--secondary">
          Webhookを追加
        </button>
      </div>

      {/* API設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">API アクセス</h2>
        <p className="settings-section__description">
          APIキーを使用してプログラムからZennにアクセスできます
        </p>
        
        <div className="settings-field">
          <label className="settings-field__label">APIキー</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value="zenn_xxxxxxxxxxxxxxxxxxxxxx"
              readOnly
              className="settings-field__input"
              style={{ fontFamily: 'monospace' }}
            />
            <button className="settings-button settings-button--secondary">
              コピー
            </button>
          </div>
          <p className="settings-field__help">
            このキーは秘密情報です。他人と共有しないでください。
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="settings-button settings-button--secondary">
            新しいキーを生成
          </button>
          <button className="settings-button settings-button--danger">
            キーを無効化
          </button>
        </div>
      </div>
    </div>
  )
}