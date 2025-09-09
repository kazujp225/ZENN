# エディターUX改善設計書

## 1. 現状の問題点と改善案

### 1.1 識別された問題点

| 問題点 | 現状 | 改善案 |
|--------|------|--------|
| 初期作成フロー | タイプ選択が不明瞭 | 明確な作成ボタンとガイド |
| 保存状態の可視性 | 保存状態が分かりにくい | リアルタイム保存インジケーター |
| ショートカット不足 | 基本的な操作のみ | Zenn独自記法の補完強化 |
| プレビュー遅延 | 全体再レンダリング | 差分レンダリング |
| 画像管理 | アップロード後の管理なし | メディアライブラリ |
| 下書き一覧 | アクセスしづらい | クイックアクセスパネル |

## 2. 改善された作成フロー

### 2.1 新規作成ウィザード

```tsx
// components/Editor/CreateWizard/index.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FileText, 
  Book, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';

export const CreateWizard: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();

  const contentTypes = [
    {
      id: 'article',
      icon: FileText,
      title: '記事を書く',
      description: '技術記事やアイデアを共有',
      features: ['Markdown対応', '画像埋め込み', 'コード��イライト'],
      estimatedTime: '10-30分',
      path: '/editor/article/new',
    },
    {
      id: 'book',
      icon: Book,
      title: '本を執筆',
      description: '体系的な知識を書籍として公開',
      features: ['チャプター管理', '有料販売可', '目次自動生成'],
      estimatedTime: '数時間〜数日',
      path: '/editor/book/new',
    },
    {
      id: 'scrap',
      icon: MessageSquare,
      title: 'スクラップを作成',
      description: 'アイデアや進捗を気軽に共有',
      features: ['リアルタイム更新', 'ディスカッション', 'Markdown対応'],
      estimatedTime: '1-5分',
      path: '/editor/scrap/new',
    },
  ];

  const handleCreate = () => {
    const selected = contentTypes.find(t => t.id === selectedType);
    if (selected) {
      // 最近の作成履歴を保存
      localStorage.setItem('lastCreatedType', selectedType);
      router.push(selected.path);
    }
  };

  return (
    <div className="create-wizard">
      <div className="wizard-header">
        <h1>新規作成</h1>
        <p>どのようなコンテンツを作成しますか？</p>
      </div>

      <div className="content-type-grid">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            >
              <div className="card-header">
                <Icon size={32} />
                <h3>{type.title}</h3>
              </div>
              
              <p className="card-description">{type.description}</p>
              
              <div className="card-features">
                {type.features.map((feature, i) => (
                  <span key={i} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
              
              <div className="card-meta">
                <span className="time-estimate">
                  <Clock size={14} />
                  {type.estimatedTime}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedType && (
        <div className="wizard-actions">
          <QuickTemplates type={selectedType} />
          
          <button onClick={handleCreate} className="btn-create">
            作成を開始
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <RecentDrafts />
    </div>
  );
};

// クイックテンプレート選択
const QuickTemplates: React.FC<{ type: string }> = ({ type }) => {
  const templates = {
    article: [
      { id: 'tutorial', name: 'チュートリアル', icon: '📚' },
      { id: 'review', name: 'ツールレビュー', icon: '⭐' },
      { id: 'tips', name: 'Tips & Tricks', icon: '💡' },
    ],
    book: [
      { id: 'guide', name: '入門ガイド', icon: '🎓' },
      { id: 'reference', name: 'リファレンス', icon: '📖' },
    ],
    scrap: [
      { id: 'til', name: 'Today I Learned', icon: '✨' },
      { id: 'wip', name: '作業ログ', icon: '🚧' },
    ],
  };

  return (
    <div className="quick-templates">
      <h4>
        <Sparkles size={16} />
        テンプレートから始める（オプション）
      </h4>
      <div className="template-chips">
        {templates[type]?.map(template => (
          <button key={template.id} className="template-chip">
            <span>{template.icon}</span>
            <span>{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 最近の下書き
const RecentDrafts: React.FC = () => {
  const drafts = useDrafts();
  
  if (drafts.length === 0) return null;
  
  return (
    <div className="recent-drafts">
      <h3>最近の下書き</h3>
      <div className="draft-list">
        {drafts.slice(0, 5).map(draft => (
          <a
            key={draft.id}
            href={`/editor/${draft.type}/${draft.id}`}
            className="draft-item"
          >
            <span className="draft-emoji">{draft.emoji || '📝'}</span>
            <div className="draft-info">
              <span className="draft-title">{draft.title || '無題'}</span>
              <span className="draft-meta">
                {formatDistanceToNow(draft.updatedAt)}前
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
```

## 3. リアルタイム保存とステータス表示

### 3.1 保存ステータスインジケーター

```tsx
// components/Editor/SaveIndicator.tsx
import React from 'react';
import { 
  Check, 
  Cloud, 
  CloudOff, 
  Loader, 
  AlertTriangle,
  WifiOff 
} from 'lucide-react';

interface SaveIndicatorProps {
  status: 'saved' | 'saving' | 'error' | 'offline' | 'conflict';
  lastSaved?: Date;
  onResolveConflict?: () => void;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  lastSaved,
  onResolveConflict,
}) => {
  const indicators = {
    saved: {
      icon: Check,
      text: '保存済み',
      color: 'green',
      pulse: false,
    },
    saving: {
      icon: Cloud,
      text: '保存中...',
      color: 'blue',
      pulse: true,
    },
    error: {
      icon: AlertTriangle,
      text: '保存エラー',
      color: 'red',
      pulse: false,
    },
    offline: {
      icon: WifiOff,
      text: 'オフライン',
      color: 'gray',
      pulse: false,
    },
    conflict: {
      icon: CloudOff,
      text: '競合あり',
      color: 'orange',
      pulse: true,
    },
  };

  const current = indicators[status];
  const Icon = current.icon;

  return (
    <div className={`save-indicator status-${status}`}>
      <div className={`indicator-icon ${current.pulse ? 'pulse' : ''}`}>
        {status === 'saving' ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <Icon size={16} />
        )}
      </div>
      
      <span className="indicator-text">{current.text}</span>
      
      {lastSaved && status === 'saved' && (
        <span className="last-saved">
          {formatTimeAgo(lastSaved)}
        </span>
      )}
      
      {status === 'conflict' && (
        <button onClick={onResolveConflict} className="resolve-btn">
          解決
        </button>
      )}
      
      {status === 'offline' && (
        <OfflineQueue />
      )}
    </div>
  );
};

// オフライン時のキュー表示
const OfflineQueue: React.FC = () => {
  const queue = useOfflineQueue();
  
  if (queue.length === 0) return null;
  
  return (
    <div className="offline-queue">
      <span className="queue-count">{queue.length}件の変更が保留中</span>
      <button onClick={() => syncOfflineChanges()}>
        オンライン時に同期
      </button>
    </div>
  );
};
```

## 4. スマート補完とサジェスション

### 4.1 Zenn記法の高度な補完

```typescript
// services/editor-intelligence.ts
export class EditorIntelligence {
  private suggestions = {
    // コンテキストベースの補完
    startOfLine: [
      { trigger: '#', items: ['# ', '## ', '### ', '#### '] },
      { trigger: '-', items: ['- ', '---'] },
      { trigger: '1', items: ['1. '] },
      { trigger: '>', items: ['> '] },
      { trigger: '|', items: this.generateTableTemplate },
      { trigger: '`', items: ['```\n\n```', '``'] },
    ],
    
    // Zenn独自記法
    zennSyntax: [
      { trigger: '::', items: [':::message\n\n:::', ':::message alert\n\n:::', ':::details タイトル\n\n:::'] },
      { trigger: '@[', items: this.getEmbedSuggestions },
      { trigger: 'https://', items: this.generateLinkCard },
    ],
    
    // 絵文字サジェスト
    emoji: [
      { trigger: ':', items: this.searchEmoji },
    ],
  };

  // テーブルテンプレート生成
  private generateTableTemplate(): string[] {
    return [
      '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
      '| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n|       |       |       |',
    ];
  }

  // 埋め込みサジェスト
  private getEmbedSuggestions(context: string): CompletionItem[] {
    const embeds = [
      { label: 'card', insert: '@[card](URL)', docs: 'リンクカード' },
      { label: 'tweet', insert: '@[tweet](URL)', docs: 'ツイート埋め込み' },
      { label: 'youtube', insert: '@[youtube](VIDEO_ID)', docs: 'YouTube動画' },
      { label: 'slideshare', insert: '@[slideshare](KEY)', docs: 'SlideShare' },
      { label: 'speakerdeck', insert: '@[speakerdeck](ID)', docs: 'Speaker Deck' },
      { label: 'codepen', insert: '@[codepen](URL)', docs: 'CodePen' },
      { label: 'codesandbox', insert: '@[codesandbox](ID)', docs: 'CodeSandbox' },
      { label: 'stackblitz', insert: '@[stackblitz](ID)', docs: 'StackBlitz' },
      { label: 'jsfiddle', insert: '@[jsfiddle](URL)', docs: 'JSFiddle' },
      { label: 'figma', insert: '@[figma](URL)', docs: 'Figmaデザイン' },
    ];

    // クリップボードにURLがある場合は自動判定
    const clipboardUrl = this.getClipboardUrl();
    if (clipboardUrl) {
      const embedType = this.detectEmbedType(clipboardUrl);
      if (embedType) {
        embeds.unshift({
          label: `📋 ${embedType.label}`,
          insert: embedType.insert(clipboardUrl),
          docs: 'クリップボードから',
        });
      }
    }

    return embeds;
  }

  // URL埋め込みタイプの自動検出
  private detectEmbedType(url: string): EmbedType | null {
    const patterns = [
      { regex: /twitter\.com|x\.com/, type: 'tweet' },
      { regex: /youtube\.com|youtu\.be/, type: 'youtube' },
      { regex: /codepen\.io/, type: 'codepen' },
      { regex: /codesandbox\.io/, type: 'codesandbox' },
      { regex: /stackblitz\.com/, type: 'stackblitz' },
      { regex: /jsfiddle\.net/, type: 'jsfiddle' },
      { regex: /figma\.com/, type: 'figma' },
      { regex: /speakerdeck\.com/, type: 'speakerdeck' },
      { regex: /slideshare\.net/, type: 'slideshare' },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(url)) {
        return {
          label: pattern.type,
          insert: (url) => `@[${pattern.type}](${this.extractId(url, pattern.type)})`,
        };
      }
    }

    // デフォルトはリンクカード
    return {
      label: 'card',
      insert: (url) => `@[card](${url})`,
    };
  }
}
```

### 4.2 インテリジェントなコード補完

```tsx
// components/Editor/CodeBlockEnhancer.tsx
import React, { useState } from 'react';
import { Copy, Check, Play, Download } from 'lucide-react';

interface CodeBlockEnhancerProps {
  language: string;
  code: string;
  filename?: string;
}

export const CodeBlockEnhancer: React.FC<CodeBlockEnhancerProps> = ({
  language,
  code,
  filename,
}) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    // サンドボックス実行（JavaScriptのみ）
    if (language === 'javascript' || language === 'js') {
      try {
        const result = await runInSandbox(code);
        setOutput(result);
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      }
    }
  };

  const detectPackages = () => {
    // パッケージ自動検出
    const imports = code.match(/import .+ from ['"](.+)['"]/g) || [];
    const requires = code.match(/require\(['"](.+)['"]\)/g) || [];
    
    return [...imports, ...requires].map(line => {
      const match = line.match(/['"](.+)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean);
  };

  const packages = detectPackages();

  return (
    <div className="code-block-enhanced">
      <div className="code-header">
        <div className="code-info">
          {filename && <span className="filename">{filename}</span>}
          <span className="language">{language}</span>
        </div>
        
        <div className="code-actions">
          {(language === 'javascript' || language === 'js') && (
            <button onClick={handleRun} className="action-btn" title="実行">
              <Play size={14} />
            </button>
          )}
          
          <button onClick={handleCopy} className="action-btn" title="コピー">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>

      {packages.length > 0 && (
        <div className="package-info">
          <span className="package-label">使用パッケージ:</span>
          {packages.map(pkg => (
            <a
              key={pkg}
              href={`https://www.npmjs.com/package/${pkg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="package-link"
            >
              {pkg}
            </a>
          ))}
          
          <button className="install-cmd" onClick={() => copyInstallCommand(packages)}>
            <Download size={12} />
            npm install
          </button>
        </div>
      )}

      {output !== null && (
        <div className="code-output">
          <div className="output-header">実行結果</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};
```

## 5. メディアライブラリ

### 5.1 統合メディア管理

```tsx
// components/Editor/MediaLibrary.tsx
import React, { useState, useCallback } from 'react';
import { 
  Image, 
  Film, 
  FileText, 
  Search, 
  Grid, 
  List,
  Upload,
  Folder,
  Star,
  Trash2
} from 'lucide-react';

interface MediaLibraryProps {
  onSelect: (media: MediaItem) => void;
  onClose: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  onClose,
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { media, folders, loading } = useMediaLibrary({
    filter,
    search: searchQuery,
    folder: selectedFolder,
  });

  const handleDrop = useCallback((files: File[]) => {
    uploadFiles(files);
  }, []);

  return (
    <div className="media-library-modal">
      <div className="library-header">
        <h2>メディアライブラリ</h2>
        
        <div className="library-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="メディアを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="library-actions">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="view-toggle"
          >
            {view === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
          
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>
      </div>

      <div className="library-body">
        <aside className="library-sidebar">
          <div className="filter-section">
            <h3>フィルター</h3>
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('images')}
              className={filter === 'images' ? 'active' : ''}
            >
              <Image size={14} /> 画像
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={filter === 'videos' ? 'active' : ''}
            >
              <Film size={14} /> 動画
            </button>
            <button
              onClick={() => setFilter('files')}
              className={filter === 'files' ? 'active' : ''}
            >
              <FileText size={14} /> ファイル
            </button>
          </div>

          <div className="folder-section">
            <h3>フォルダ</h3>
            <FolderTree
              folders={folders}
              selected={selectedFolder}
              onSelect={setSelectedFolder}
            />
          </div>
        </aside>

        <main className="library-content">
          <DropZone onDrop={handleDrop}>
            <div className={`media-grid view-${view}`}>
              {media.map(item => (
                <MediaItem
                  key={item.id}
                  item={item}
                  view={view}
                  onSelect={() => onSelect(item)}
                  onDelete={() => deleteMedia(item.id)}
                  onFavorite={() => toggleFavorite(item.id)}
                />
              ))}
            </div>
          </DropZone>
        </main>
      </div>

      <MediaUploadProgress />
    </div>
  );
};

// メディアアイテムコンポーネント
const MediaItem: React.FC<{
  item: MediaItem;
  view: 'grid' | 'list';
  onSelect: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}> = ({ item, view, onSelect, onDelete, onFavorite }) => {
  return (
    <div className={`media-item view-${view}`} onClick={onSelect}>
      <div className="media-preview">
        {item.type === 'image' ? (
          <img src={item.thumbnail} alt={item.name} />
        ) : (
          <div className="file-icon">
            {getFileIcon(item.type)}
          </div>
        )}
        
        <div className="media-overlay">
          <button onClick={(e) => { e.stopPropagation(); onFavorite(); }}>
            <Star size={14} className={item.favorite ? 'filled' : ''} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="media-info">
        <span className="media-name">{item.name}</span>
        <span className="media-meta">
          {formatFileSize(item.size)} • {formatDate(item.uploadedAt)}
        </span>
      </div>
    </div>
  );
};
```

## 6. 下書き管理の改善

### 6.1 下書きダッシュボード

```tsx
// components/Dashboard/DraftsDashboard.tsx
import React, { useState } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Calendar,
  Filter,
  SortAsc,
  MoreVertical 
} from 'lucide-react';

export const DraftsDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'book' | 'scrap'>('all');

  const drafts = useDrafts({ sortBy, filterType });
  const stats = useDraftStats();

  return (
    <div className="drafts-dashboard">
      <div className="dashboard-header">
        <h1>下書き一覧</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">下書き総数</span>
            </div>
          </div>
          
          <div className="stat-card">
            <TrendingUp size={20} />
            <div>
              <span className="stat-value">{stats.thisWeek}</span>
              <span className="stat-label">今週の作成</span>
            </div>
          </div>
          
          <div className="stat-card">
            <Calendar size={20} />
            <div>
              <span className="stat-value">{stats.oldest}日</span>
              <span className="stat-label">最古の下書き</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="filter-controls">
          <button className="filter-btn">
            <Filter size={16} />
            フィルター
          </button>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">すべて</option>
            <option value="article">記事</option>
            <option value="book">書籍</option>
            <option value="scrap">スクラップ</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <button className="sort-btn">
            <SortAsc size={16} />
            並び替え
          </button>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="updated">更新日時</option>
            <option value="created">作成日時</option>
            <option value="title">タイトル</option>
          </select>
        </div>
      </div>

      <div className="drafts-grid">
        {drafts.map(draft => (
          <DraftCard
            key={draft.id}
            draft={draft}
            onEdit={() => router.push(`/editor/${draft.type}/${draft.id}`)}
            onPublish={() => publishDraft(draft.id)}
            onDelete={() => deleteDraft(draft.id)}
            onDuplicate={() => duplicateDraft(draft.id)}
          />
        ))}
      </div>

      {drafts.length === 0 && (
        <EmptyState
          icon={FileText}
          title="下書きがありません"
          description="新しいコンテンツを作成して始めましょう"
          action={{
            label: '作成を開始',
            onClick: () => router.push('/new'),
          }}
        />
      )}
    </div>
  );
};

// 下書きカード
const DraftCard: React.FC<{
  draft: Draft;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ draft, onEdit, onPublish, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const progress = calculateCompleteness(draft);
  
  return (
    <div className="draft-card" onClick={onEdit}>
      <div className="card-header">
        <span className="draft-type">{draft.type}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="menu-btn"
        >
          <MoreVertical size={16} />
        </button>
        
        {showMenu && (
          <div className="draft-menu">
            <button onClick={onPublish}>公開する</button>
            <button onClick={onDuplicate}>複製</button>
            <button onClick={onDelete} className="danger">削除</button>
          </div>
        )}
      </div>
      
      <div className="card-body">
        <h3>{draft.title || '無題の下書き'}</h3>
        {draft.emoji && <span className="draft-emoji">{draft.emoji}</span>}
        
        <p className="draft-preview">
          {getPreview(draft.content, 100)}
        </p>
        
        <div className="draft-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}% 完成</span>
        </div>
      </div>
      
      <div className="card-footer">
        <span className="draft-date">
          {formatDistanceToNow(draft.updatedAt)}前に更新
        </span>
        <span className="draft-words">
          {countWords(draft.content)}文字
        </span>
      </div>
    </div>
  );
};
```

## 7. パフォーマンス最適化

### 7.1 差分レンダリング

```typescript
// hooks/useDiffRenderer.ts
import { useMemo, useRef, useEffect } from 'react';
import { diff_match_patch } from 'diff-match-patch';

export function useDiffRenderer(content: string) {
  const previousContent = useRef<string>('');
  const renderCache = useRef<Map<string, string>>(new Map());
  const dmp = useMemo(() => new diff_match_patch(), []);

  const renderMarkdown = useMemo(() => {
    // キャッシュチェック
    if (renderCache.current.has(content)) {
      return renderCache.current.get(content)!;
    }

    // 差分計算
    const diffs = dmp.diff_main(previousContent.current, content);
    dmp.diff_cleanupSemantic(diffs);

    // 差分部分のみレンダリング
    let rendered = '';
    for (const [op, text] of diffs) {
      if (op === 0) {
        // 変更なし - キャッシュから取得
        rendered += getCachedRender(text);
      } else if (op === 1) {
        // 追加 - 新規レンダリング
        const partial = renderPartial(text);
        rendered += partial;
        updateCache(text, partial);
      }
      // 削除 (op === -1) は無視
    }

    previousContent.current = content;
    renderCache.current.set(content, rendered);

    // キャッシュサイズ制限
    if (renderCache.current.size > 100) {
      const firstKey = renderCache.current.keys().next().value;
      renderCache.current.delete(firstKey);
    }

    return rendered;
  }, [content]);

  return renderMarkdown;
}
```

### 7.2 仮想スクロール

```tsx
// components/Editor/VirtualScroll.tsx
import { VariableSizeList as List } from 'react-window';

export const VirtualEditor: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  const getItemSize = (index: number) => {
    // 行の高さを動的計算
    const line = lines[index];
    if (line.startsWith('#')) return 32; // ヘッダー
    if (line.startsWith('```')) return 24; // コードブロック
    return 20; // 通常の行
  };

  return (
    <List
      height={600}
      itemCount={lines.length}
      itemSize={getItemSize}
      width="100%"
      overscanCount={10}
    >
      {({ index, style }) => (
        <div style={style}>
          <LineRenderer line={lines[index]} lineNumber={index + 1} />
        </div>
      )}
    </List>
  );
};
```

## 8. ショートカットとアクセシビリティ

### 8.1 包括的なキーボードショートカット

```typescript
// config/shortcuts.ts
export const editorShortcuts = {
  // 基本操作
  'cmd+s': { action: 'save', description: '保存' },
  'cmd+shift+s': { action: 'saveAs', description: '名前を付けて保存' },
  'cmd+p': { action: 'preview', description: 'プレビュー切り替え' },
  'cmd+/': { action: 'toggleComment', description: 'コメント切り替え' },
  
  // フォーマット
  'cmd+b': { action: 'bold', description: '太字' },
  'cmd+i': { action: 'italic', description: '斜体' },
  'cmd+k': { action: 'link', description: 'リンク挿入' },
  'cmd+shift+c': { action: 'code', description: 'インラインコード' },
  'cmd+shift+k': { action: 'codeBlock', description: 'コードブロック' },
  
  // Zenn記法
  'cmd+shift+m': { action: 'message', description: 'メッセージブロック' },
  'cmd+shift+d': { action: 'details', description: '詳細ブロック' },
  'cmd+shift+e': { action: 'embed', description: '埋め込み' },
  
  // ナビゲーション
  'cmd+shift+o': { action: 'outline', description: 'アウトライン表示' },
  'cmd+g': { action: 'goto', description: '行へ移動' },
  'cmd+f': { action: 'find', description: '検索' },
  'cmd+h': { action: 'replace', description: '置換' },
  
  // メディア
  'cmd+shift+i': { action: 'insertImage', description: '画像挿入' },
  'cmd+shift+l': { action: 'mediaLibrary', description: 'メディアライブラリ' },
};
```

---

*最終更新: 2025-09-05*
*バージョン: 1.0.0*