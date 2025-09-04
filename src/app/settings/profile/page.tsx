'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/pages/settings.css';

export default function ProfileSettingsPage() {
  const { user, updateProfile, isLoading } = useAuth();
  const router = useRouter();
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
    if (!user && !isLoading) {
      router.push('/');
    }
    
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
  }, [user, isLoading, router]);

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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings">
      <div className="settings__container">
        <div className="settings__sidebar">
          <nav className="settings__nav">
            <Link href="/settings/profile" className="settings__nav-item settings__nav-item--active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              プロフィール
            </Link>
            <Link href="/settings/account" className="settings__nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              アカウント
            </Link>
            <Link href="/settings/notifications" className="settings__nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              通知設定
            </Link>
            <Link href="/settings/privacy" className="settings__nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              プライバシー
            </Link>
            <Link href="/settings/earnings" className="settings__nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              収益設定
            </Link>
          </nav>
        </div>

        <div className="settings__content">
          <h1 className="settings__title">プロフィール設定</h1>

          {successMessage && (
            <div className="settings__success">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings__form">
            {/* アバター設定 */}
            <div className="settings__avatar-section">
              <img 
                src={user.avatar} 
                alt={user.displayName}
                className="settings__avatar"
              />
              <div className="settings__avatar-actions">
                <label htmlFor="avatar-upload" className="settings__avatar-btn">
                  画像を変更
                  <input 
                    type="file" 
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <button type="button" className="settings__avatar-remove">
                  削除
                </button>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="settings__group">
              <h2 className="settings__group-title">基本情報</h2>
              
              <div className="settings__field">
                <label htmlFor="displayName">表示名</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="settings__field">
                <label htmlFor="username">ユーザー名</label>
                <div className="settings__input-group">
                  <span className="settings__input-prefix">@</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    pattern="[a-zA-Z0-9_]+"
                    required
                  />
                </div>
                <p className="settings__help">英数字とアンダースコアのみ使用可能</p>
              </div>

              <div className="settings__field">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="settings__field">
                <label htmlFor="bio">自己紹介</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="あなたについて教えてください"
                />
                <p className="settings__help">{formData.bio.length}/160</p>
              </div>
            </div>

            {/* 追加情報 */}
            <div className="settings__group">
              <h2 className="settings__group-title">追加情報</h2>
              
              <div className="settings__field">
                <label htmlFor="company">会社・組織</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="例: Tech Company Inc."
                />
              </div>

              <div className="settings__field">
                <label htmlFor="location">場所</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="例: Tokyo, Japan"
                />
              </div>

              <div className="settings__field">
                <label htmlFor="website">ウェブサイト</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* ソーシャルアカウント */}
            <div className="settings__group">
              <h2 className="settings__group-title">ソーシャルアカウント</h2>
              
              <div className="settings__field">
                <label htmlFor="twitter">Twitter</label>
                <div className="settings__input-group">
                  <span className="settings__input-prefix">@</span>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="settings__field">
                <label htmlFor="github">GitHub</label>
                <div className="settings__input-group">
                  <span className="settings__input-prefix">@</span>
                  <input
                    type="text"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="settings__group">
              <h2 className="settings__group-title">統計情報</h2>
              <div className="settings__stats">
                <div className="settings__stat">
                  <span className="settings__stat-label">記事数</span>
                  <span className="settings__stat-value">{user.stats.articles}</span>
                </div>
                <div className="settings__stat">
                  <span className="settings__stat-label">本</span>
                  <span className="settings__stat-value">{user.stats.books}</span>
                </div>
                <div className="settings__stat">
                  <span className="settings__stat-label">スクラップ</span>
                  <span className="settings__stat-value">{user.stats.scraps}</span>
                </div>
                <div className="settings__stat">
                  <span className="settings__stat-label">フォロワー</span>
                  <span className="settings__stat-value">{user.stats.followers}</span>
                </div>
                <div className="settings__stat">
                  <span className="settings__stat-label">総閲覧数</span>
                  <span className="settings__stat-value">{user.stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="settings__stat">
                  <span className="settings__stat-label">総いいね</span>
                  <span className="settings__stat-value">{user.stats.totalLikes}</span>
                </div>
              </div>
              <p className="settings__help">
                アカウント作成日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>

            {/* 保存ボタン */}
            <div className="settings__actions">
              <button 
                type="submit" 
                className="settings__submit"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '変更を保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}