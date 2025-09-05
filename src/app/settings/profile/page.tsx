'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/pages/settings.css';

export default function ProfileSettingsPage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        website: user.website || '',
        twitter: user.twitter || '',
        github: user.github || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      await updateProfile(formData);
      setSuccessMessage('プロフィールを更新しました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ダミー実装: 実際はファイルをアップロードしてURLを取得
    const avatarUrl = URL.createObjectURL(file);
    await updateProfile({ avatar: avatarUrl });
  };

  if (isLoading) {
    return (
      <div className="settings-content">
        <div className="settings-content__header">
          <h1 className="settings-content__title">読み込み中...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-content">
        <div className="settings-content__header">
          <h1 className="settings-content__title">ユーザー情報が見つかりません</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">プロフィール設定</h1>
        <p className="settings-content__description">
          公開プロフィールの情報を編集します
        </p>
      </div>

      {successMessage && (
        <div className="settings-message settings-message--success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* アバター */}
        <div className="settings-section">
          <h2 className="settings-section__title">プロフィール画像</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img 
              src={user.avatar || '/images/avatar-placeholder.svg'} 
              alt={user.displayName || user.username}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '3px solid #e5e7eb'
              }}
            />
            <div>
              <label className="settings-button settings-button--primary" style={{ cursor: 'pointer' }}>
                画像を変更
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="settings-field__help" style={{ marginTop: '8px' }}>
                JPG、PNG、GIF形式。最大5MBまで。
              </p>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="settings-section">
          <h2 className="settings-section__title">基本情報</h2>
          
          <div className="settings-field">
            <label htmlFor="displayName" className="settings-field__label">
              表示名
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="settings-field__input"
              placeholder="山田 太郎"
            />
            <p className="settings-field__help">
              記事やコメントに表示される名前です
            </p>
          </div>

          <div className="settings-field">
            <label htmlFor="username" className="settings-field__label">
              ユーザー名
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <span style={{ padding: '10px 12px', background: '#f3f4f6', borderRight: '1px solid #e5e7eb' }}>
                @
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none' }}
                placeholder="username"
              />
            </div>
            <p className="settings-field__help">
              URL: https://zenn.dev/{formData.username || 'username'}
            </p>
          </div>

          <div className="settings-field">
            <label htmlFor="email" className="settings-field__label">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="settings-field__input"
              disabled
            />
            <p className="settings-field__help">
              メールアドレスは他のユーザーには公開されません
            </p>
          </div>

          <div className="settings-field">
            <label htmlFor="bio" className="settings-field__label">
              自己紹介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="settings-field__textarea"
              rows={4}
              placeholder="フロントエンドエンジニアです。React/Next.jsを使った開発が得意です。"
            />
            <p className="settings-field__help">
              最大160文字まで
            </p>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="settings-section">
          <h2 className="settings-section__title">詳細情報</h2>
          
          <div className="settings-field">
            <label htmlFor="company" className="settings-field__label">
              会社名
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="settings-field__input"
              placeholder="株式会社Example"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="location" className="settings-field__label">
              所在地
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="settings-field__input"
              placeholder="Tokyo, Japan"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="website" className="settings-field__label">
              ウェブサイト
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="settings-field__input"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* ソーシャルリンク */}
        <div className="settings-section">
          <h2 className="settings-section__title">ソーシャルリンク</h2>
          
          <div className="settings-field">
            <label htmlFor="twitter" className="settings-field__label">
              Twitter
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <span style={{ padding: '10px 12px', background: '#f3f4f6', borderRight: '1px solid #e5e7eb', fontSize: '14px' }}>
                twitter.com/
              </span>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none' }}
                placeholder="username"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="github" className="settings-field__label">
              GitHub
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <span style={{ padding: '10px 12px', background: '#f3f4f6', borderRight: '1px solid #e5e7eb', fontSize: '14px' }}>
                github.com/
              </span>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none' }}
                placeholder="username"
              />
            </div>
          </div>
        </div>

        {/* アカウント統計 */}
        <div className="settings-section">
          <h2 className="settings-section__title">アカウント統計</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.stats?.articles || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>記事</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.stats?.followers || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>フォロワー</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.stats?.following || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>フォロー中</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.stats?.totalLikes || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>いいね</div>
            </div>
          </div>
        </div>

        <div className="settings-form__actions">
          <button
            type="submit"
            disabled={isSaving}
            className="settings-button settings-button--primary"
          >
            {isSaving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}