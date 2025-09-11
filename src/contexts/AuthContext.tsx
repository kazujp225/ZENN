'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface UserStats {
  articles: number;
  books: number;
  scraps: number;
  followers: number;
  following: number;
  totalViews: number;
  totalLikes: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  createdAt: string;
  stats: UserStats;
  followingIds: string[];
  followerIds: string[];
  likedArticleIds: string[];
  bookmarkedArticleIds: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  likeArticle: (articleId: string) => Promise<void>;
  unlikeArticle: (articleId: string) => Promise<void>;
  bookmarkArticle: (articleId: string) => Promise<void>;
  unbookmarkArticle: (articleId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元
    const loadUser = () => {
      try {
        // ブラウザ環境のみで実行
        if (typeof window !== 'undefined') {
          // まず 'user' キーをチェック (AuthContext用)
          let storedUser = localStorage.getItem('user');
          
          // 'user' キーがなければ 'auth-user' をチェック (EnhancedAuth用)
          if (!storedUser) {
            const enhancedAuthUser = localStorage.getItem('auth-user');
            if (enhancedAuthUser) {
              // EnhancedAuth形式のユーザーをAuthContext形式に変換
              const enhancedUser = JSON.parse(enhancedAuthUser);
              const convertedUser: User = {
                id: enhancedUser.id,
                username: enhancedUser.username || enhancedUser.email.split('@')[0],
                displayName: enhancedUser.name || enhancedUser.username || enhancedUser.email.split('@')[0],
                email: enhancedUser.email,
                avatar: enhancedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enhancedUser.email}`,
                bio: enhancedUser.bio || '',
                company: '',
                location: enhancedUser.location || '',
                website: enhancedUser.website || '',
                twitter: '',
                github: enhancedUser.username || enhancedUser.email.split('@')[0],
                createdAt: enhancedUser.createdAt || new Date().toISOString(),
                stats: {
                  articles: enhancedUser.articlesCount || 0,
                  books: 0,
                  scraps: 0,
                  followers: enhancedUser.followersCount || 0,
                  following: enhancedUser.followingCount || 0,
                  totalViews: 0,
                  totalLikes: 0,
                },
                followingIds: [],
                followerIds: [],
                likedArticleIds: [],
                bookmarkedArticleIds: [],
              };
              
              // 変換したユーザーを両方のキーに保存
              localStorage.setItem('user', JSON.stringify(convertedUser));
              storedUser = JSON.stringify(convertedUser);
            }
          }
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // ユーザー読み込み成功
          }
        }
      } catch (error) {
        // localStorageからのユーザー読み込み失敗
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // ダミー実装：任意のメールアドレスとパスワードでログイン可能
      await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しをシミュレート

      const baseUsername = email.split('@')[0];
      
      // デバッグログを削除（セキュリティ対応）

      // sync-userエンドポイントを使用してユーザー情報を同期
      let syncedUser;
      try {
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            username: baseUsername
          }),
        });
        
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          syncedUser = syncData.user;
          // ユーザー同期成功
        } else {
          const errorData = await syncResponse.json();
          // ユーザー同期失敗
          throw new Error(errorData.error || 'ユーザー同期に失敗しました');
        }
      } catch (error) {
        // ユーザー同期エラー
        throw error;
      }

      const dummyUser: User = {
        id: syncedUser.id,
        username: syncedUser.username,
        displayName: syncedUser.displayName,
        email: syncedUser.email,
        avatar: syncedUser.avatar,
        bio: 'フロントエンドエンジニア。React/Next.jsが得意です。',
        company: 'Tech Company',
        location: 'Tokyo, Japan',
        website: '',
        github: syncedUser.username,
        twitter: syncedUser.username,
        createdAt: new Date().toISOString(),
        stats: {
          articles: 0,
          books: 0,
          scraps: 0,
          followers: 0,
          following: 0,
          totalViews: 0,
          totalLikes: 0,
        },
        followingIds: [],
        followerIds: [],
        likedArticleIds: [],
        bookmarkedArticleIds: [],
      };

      // 本番環境ではユーザー情報ログを無効化
      if (process.env.NODE_ENV === 'development') {
        // ユーザー情報設定完了
      }
      setUser(dummyUser);
      localStorage.setItem('user', JSON.stringify(dummyUser));
    } catch (error) {
      // ログイン失敗
      throw error;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    // ダミー実装：任意の情報でサインアップ可能
    await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しをシミュレート

    const dummyUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      company: '',
      location: '',
      github: username,
      twitter: username,
      createdAt: new Date().toISOString().split('T')[0],
      stats: {
        articles: 0,
        books: 0,
        scraps: 0,
        followers: 0,
        following: 0,
        totalViews: 0,
        totalLikes: 0,
      },
      followingIds: [],
      followerIds: [],
      likedArticleIds: [],
      bookmarkedArticleIds: [],
    };

    setUser(dummyUser);
    localStorage.setItem('user', JSON.stringify(dummyUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // 両方のキーをクリア
    localStorage.removeItem('user');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-session'); // EnhancedAuthのセッションもクリア
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;

    await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しをシミュレート

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const followUser = useCallback(async (userId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      followingIds: [...user.followingIds, userId],
      stats: {
        ...user.stats,
        following: user.stats.following + 1,
      },
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const unfollowUser = useCallback(async (userId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      followingIds: user.followingIds.filter(id => id !== userId),
      stats: {
        ...user.stats,
        following: user.stats.following - 1,
      },
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const likeArticle = useCallback(async (articleId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      likedArticleIds: [...user.likedArticleIds, articleId],
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const unlikeArticle = useCallback(async (articleId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      likedArticleIds: user.likedArticleIds.filter(id => id !== articleId),
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const bookmarkArticle = useCallback(async (articleId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      bookmarkedArticleIds: [...user.bookmarkedArticleIds, articleId],
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const unbookmarkArticle = useCallback(async (articleId: string) => {
    if (!user) return;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedUser = {
      ...user,
      bookmarkedArticleIds: user.bookmarkedArticleIds.filter(id => id !== articleId),
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      updateProfile,
      followUser,
      unfollowUser,
      likeArticle,
      unlikeArticle,
      bookmarkArticle,
      unbookmarkArticle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};