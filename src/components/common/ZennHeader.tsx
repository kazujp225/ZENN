'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/features/SearchBar';
import { PostingModal } from '@/components/posting/PostingModal';
import { EnhancedLoginModal } from '@/components/auth/EnhancedLoginModal';

export const ZennHeader = () => {
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handlePostClick = () => {
    if (isLoggedIn) {
      setShowPostingModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="container header__container">
          <Link href="/zenn" className="text-2xl font-bold text-primary">
            Zenn
          </Link>
          
          <nav aria-label="Global navigation" className="header__nav">
            <Link href="/zenn" className="header__nav-item header__nav-item--active">
              Trending
            </Link>
            <Link href="/explore" className="header__nav-item">
              Explore
            </Link>
          </nav>
          
          <div className="flex gap-3 items-center">
            <SearchBar />
            <button
              onClick={handlePostClick}
              className="zenn-header__post-btn"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#3ea8ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              投稿する
            </button>
            {!isLoggedIn && (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="zenn-header__login-btn"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#3ea8ff',
                  border: '1px solid #3ea8ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      <PostingModal
        isOpen={showPostingModal}
        onClose={() => setShowPostingModal(false)}
        isLoggedIn={isLoggedIn}
        onLogin={() => {
          setShowPostingModal(false);
          setShowLoginModal(true);
        }}
      />

      <EnhancedLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (showLoginModal) {
            handleLogin();
          }
        }}
      />
    </>
  );
};