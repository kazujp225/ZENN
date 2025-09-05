'use client'

import { useState } from 'react'
import '@/styles/pages/settings.css'

type Theme = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'
type CodeTheme = 'github' | 'monokai' | 'dracula' | 'solarized'

export default function AppearanceSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [settings, setSettings] = useState({
    theme: 'light' as Theme,
    fontSize: 'medium' as FontSize,
    codeTheme: 'github' as CodeTheme,
    reducedMotion: false,
    highContrast: false,
    showLineNumbers: true,
    enableSyntaxHighlighting: true,
    compactMode: false,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: '表示設定を更新しました' })
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
        <h1 className="settings-content__title">表示設定</h1>
        <p className="settings-content__description">
          テーマや表示方法をカスタマイズします
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* テーマ設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">テーマ</h2>
        <div className="settings-field">
          <label className="settings-field__label">カラーテーマ</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['light', 'dark', 'system'] as Theme[]).map(theme => (
              <label key={theme} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={settings.theme === theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as Theme })}
                  style={{ marginRight: '8px' }}
                />
                <span>
                  {theme === 'light' && 'ライト'}
                  {theme === 'dark' && 'ダーク'}
                  {theme === 'system' && 'システム設定に従う'}
                </span>
              </label>
            ))}
          </div>
          <p className="settings-field__help">
            サイト全体の配色を変更します
          </p>
        </div>
      </div>

      {/* フォント設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">フォント</h2>
        <div className="settings-field">
          <label className="settings-field__label">文字サイズ</label>
          <select
            value={settings.fontSize}
            onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as FontSize })}
            className="settings-field__select"
          >
            <option value="small">小</option>
            <option value="medium">中（デフォルト）</option>
            <option value="large">大</option>
          </select>
          <p className="settings-field__help">
            記事本文の文字サイズを調整します
          </p>
        </div>
      </div>

      {/* コードブロック設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">コードブロック</h2>
        
        <div className="settings-field">
          <label className="settings-field__label">シンタックステーマ</label>
          <select
            value={settings.codeTheme}
            onChange={(e) => setSettings({ ...settings, codeTheme: e.target.value as CodeTheme })}
            className="settings-field__select"
          >
            <option value="github">GitHub</option>
            <option value="monokai">Monokai</option>
            <option value="dracula">Dracula</option>
            <option value="solarized">Solarized</option>
          </select>
        </div>

        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => setSettings({ ...settings, showLineNumbers: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">行番号を表示</div>
                <div className="settings-switch__description">
                  コードブロックに行番号を表示します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.enableSyntaxHighlighting}
                onChange={(e) => setSettings({ ...settings, enableSyntaxHighlighting: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">シンタックスハイライト</div>
                <div className="settings-switch__description">
                  コードの構文に色付けを行います
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* アクセシビリティ設定 */}
      <div className="settings-section">
        <h2 className="settings-section__title">アクセシビリティ</h2>
        
        <div className="settings-switches">
          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">視覚効果を減らす</div>
                <div className="settings-switch__description">
                  アニメーションやトランジション効果を最小限にします
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => setSettings({ ...settings, highContrast: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">高コントラストモード</div>
                <div className="settings-switch__description">
                  文字と背景のコントラストを強調します
                </div>
              </div>
            </label>
          </div>

          <div className="settings-switch">
            <label className="settings-switch__label">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                className="settings-switch__input"
              />
              <span className="settings-switch__slider"></span>
              <div className="settings-switch__content">
                <div className="settings-switch__title">コンパクトモード</div>
                <div className="settings-switch__description">
                  余白を減らしてより多くのコンテンツを表示します
                </div>
              </div>
            </label>
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