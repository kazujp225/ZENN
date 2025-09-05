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
            console.log('User loaded:', parsedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // ダミー実装：任意のメールアドレスとパスワードでログイン可能
    await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しをシミュレート

    const dummyUser: User = {
      id: '1',
      username: email.split('@')[0],
      displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      bio: 'フロントエンドエンジニア。React/Next.jsが得意です。',
      company: 'Tech Company',
      location: 'Tokyo, Japan',
      github: email.split('@')[0],
      twitter: email.split('@')[0],
      createdAt: '2023-01-15',
      stats: {
        articles: 12,
        books: 2,
        scraps: 45,
        followers: 234,
        following: 156,
        totalViews: 12345,
        totalLikes: 567,
      },
      followingIds: ['2', '3', '4'],
      followerIds: ['5', '6', '7', '8'],
      likedArticleIds: ['1', '3', '5'],
      bookmarkedArticleIds: ['2', '4', '6'],
    };

    setUser(dummyUser);
    localStorage.setItem('user', JSON.stringify(dummyUser));
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