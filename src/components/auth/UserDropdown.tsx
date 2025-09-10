'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/components/user-dropdown.css';

export const UserDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // デバッグ用：ユーザー情報をコンソールに出力
  console.log('=== USER DROPDOWN DEBUG ===');
  console.log('Current user:', {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email
  });

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="ユーザーメニューを開く"
      >
        <img 
          src={user.avatar || '/images/avatar-placeholder.svg'} 
          alt={user.displayName || user.username}
          className="user-avatar"
        />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <img 
              src={user.avatar} 
              alt={user.displayName || user.username}
              className="user-avatar-large"
            />
            <div className="user-info">
              <div className="user-displayname">{user.displayName || user.username}</div>
              <div className="user-username">@{user.username}</div>
            </div>
          </div>

          <div className="user-dropdown-divider" />

          <nav className="user-dropdown-nav">
            <Link href={`/${user.username}`} className="user-dropdown-item" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              プロフィール
            </Link>
            
            <Link href="/dashboard" className="user-dropdown-item" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              ダッシュボード
            </Link>

            <Link href="/settings/profile" className="user-dropdown-item" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m6-12h6M6 12H0m16.24-4.24l-4.24 4.24m-8 0L2.76 4.76m14.48 14.48l-4.24-4.24m-8 0l-6.24 6.24"/>
              </svg>
              設定
            </Link>

          </nav>

          <div className="user-dropdown-divider" />
          
          <button onClick={() => { logout(); setIsOpen(false); }} className="user-dropdown-item user-dropdown-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};