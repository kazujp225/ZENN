# コンテンツタイプ別エディター設計書

## 1. 概要

### 1.1 目的
Zennクローンにおける3つのコンテンツタイプ（記事・書籍・スクラップ）それぞれに最適化されたエディター体験を提供する。

### 1.2 コンテンツタイプの特性

| 項目 | 記事 (Article) | 書籍 (Book) | スクラップ (Scrap) |
|------|---------------|-------------|-------------------|
| 長さ | 中程度（3,000-10,000字） | 長文（50,000字以上） | 短文（100-1,000字） |
| 構造 | 単一ページ | チャプター形式 | タイムライン形式 |
| 編集方式 | Markdownエディター | チャプター管理付きエディター | シンプルエディター |
| プレビュー | リアルタイム | チャプター単位 | インライン |
| 保存単位 | 記事全体 | チャプター毎 | コメント毎 |
| 公開設定 | 公開/下書き | 無料/有料/下書き | Open/Closed |
| バージョン管理 | あり | チャプター単位 | なし |

## 2. 統合エディターアーキテクチャ

### 2.1 エディター切り替えシステム

```tsx
// components/Editor/UnifiedEditor.tsx
import React, { useState, useEffect } from 'react';
import { ArticleEditor } from './ArticleEditor';
import { BookEditor } from './BookEditor';
import { ScrapEditor } from './ScrapEditor';
import { ContentType } from '@/types';

interface UnifiedEditorProps {
  contentType: ContentType;
  contentId?: string;
  onSave: (content: any) => Promise<void>;
}

export const UnifiedEditor: React.FC<UnifiedEditorProps> = ({
  contentType,
  contentId,
  onSave,
}) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentId) {
      loadContent(contentType, contentId);
    } else {
      createNewContent(contentType);
    }
  }, [contentType, contentId]);

  const loadContent = async (type: ContentType, id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${type}s/${id}`);
      const data = await response.json();
      setContent(data);
    } finally {
      setLoading(false);
    }
  };

  const createNewContent = (type: ContentType) => {
    const templates = {
      article: createArticleTemplate(),
      book: createBookTemplate(),
      scrap: createScrapTemplate(),
    };
    setContent(templates[type]);
    setLoading(false);
  };

  if (loading) {
    return <EditorSkeleton />;
  }

  const editors = {
    article: (
      <ArticleEditor
        article={content}
        onSave={onSave}
      />
    ),
    book: (
      <BookEditor
        book={content}
        onSave={onSave}
      />
    ),
    scrap: (
      <ScrapEditor
        scrap={content}
        onSave={onSave}
      />
    ),
  };

  return (
    <div className="unified-editor">
      <EditorHeader contentType={contentType} />
      {editors[contentType]}
    </div>
  );
};
```

## 3. 記事エディター

### 3.1 記事エディター仕様

```tsx
// components/Editor/ArticleEditor/index.tsx
import React, { useState } from 'react';
import { MarkdownEditor } from '../MarkdownEditor';
import { PreviewPane } from '../PreviewPane';
import { ArticleFrontMatter } from './ArticleFrontMatter';
import { ArticleToolbar } from './ArticleToolbar';
import { useAutoSave } from '@/hooks/useAutoSave';

interface Article {
  id?: string;
  title: string;
  emoji: string;
  type: 'tech' | 'idea';
  topics: string[];
  content: string;
  published: boolean;
  publishedAt?: Date;
}

interface ArticleEditorProps {
  article: Article;
  onSave: (article: Article) => Promise<void>;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article: initialArticle,
  onSave,
}) => {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [showSettings, setShowSettings] = useState(false);

  // 自動保存
  const { saveStatus, restore } = useAutoSave(article, {
    onSave: async (data) => {
      await onSave(data);
    },
    localStorageKey: `article-draft-${article.id || 'new'}`,
  });

  const updateContent = (content: string) => {
    setArticle({ ...article, content });
  };

  const updateFrontMatter = (frontMatter: Partial<Article>) => {
    setArticle({ ...article, ...frontMatter });
  };

  return (
    <div className="article-editor">
      <ArticleToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSettingsClick={() => setShowSettings(!showSettings)}
        saveStatus={saveStatus}
        onPublish={() => handlePublish()}
      />

      {showSettings && (
        <ArticleFrontMatter
          title={article.title}
          emoji={article.emoji}
          type={article.type}
          topics={article.topics}
          published={article.published}
          onChange={updateFrontMatter}
        />
      )}

      <div className={`editor-layout view-${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane">
            <MarkdownEditor
              value={article.content}
              onChange={updateContent}
              placeholder="記事を書き始めましょう..."
              extensions={['article-snippets', 'emoji-picker', 'link-card']}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <ArticlePreview
              title={article.title}
              emoji={article.emoji}
              type={article.type}
              topics={article.topics}
              content={article.content}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3.2 記事専用機能

```tsx
// components/Editor/ArticleEditor/ArticleFeatures.tsx

// トピック選択
export const TopicSelector: React.FC<{
  selected: string[];
  onChange: (topics: string[]) => void;
}> = ({ selected, onChange }) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const popularTopics = [
    'javascript', 'typescript', 'react', 'vue', 'nodejs',
    'python', 'go', 'rust', 'aws', 'docker', 'kubernetes',
  ];

  const searchTopics = async (query: string) => {
    const response = await fetch(`/api/topics/search?q=${query}`);
    const data = await response.json();
    setSuggestions(data.topics);
  };

  return (
    <div className="topic-selector">
      <div className="selected-topics">
        {selected.map(topic => (
          <span key={topic} className="topic-tag">
            #{topic}
            <button onClick={() => removeTag(topic)}>×</button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          searchTopics(e.target.value);
        }}
        placeholder="トピックを追加（最大5つ）"
        disabled={selected.length >= 5}
      />
      
      {suggestions.length > 0 && (
        <div className="topic-suggestions">
          {suggestions.map(topic => (
            <button
              key={topic}
              onClick={() => {
                if (selected.length < 5 && !selected.includes(topic)) {
                  onChange([...selected, topic]);
                }
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 記事テンプレート
export const ArticleTemplates: React.FC<{
  onSelect: (template: string) => void;
}> = ({ onSelect }) => {
  const templates = [
    { id: 'blank', name: '空白', icon: '📄' },
    { id: 'tech', name: '技術記事', icon: '💻' },
    { id: 'tutorial', name: 'チュートリアル', icon: '📚' },
    { id: 'review', name: 'レビュー', icon: '⭐' },
    { id: 'tips', name: 'Tips', icon: '💡' },
  ];

  return (
    <div className="article-templates">
      <h3>テンプレートから開始</h3>
      <div className="template-grid">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="template-card"
          >
            <span className="template-icon">{template.icon}</span>
            <span className="template-name">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 4. 書籍エディター

### 4.1 書籍エディター仕様

```tsx
// components/Editor/BookEditor/index.tsx
import React, { useState } from 'react';
import { ChapterList } from './ChapterList';
import { ChapterEditor } from './ChapterEditor';
import { BookSettings } from './BookSettings';
import { BookPreview } from './BookPreview';

interface Chapter {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  free: boolean;
}

interface Book {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  chapters: Chapter[];
  price: number;
  published: boolean;
  topics: string[];
}

export const BookEditor: React.FC<{
  book: Book;
  onSave: (book: Book) => Promise<void>;
}> = ({ book: initialBook, onSave }) => {
  const [book, setBook] = useState<Book>(initialBook);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    book.chapters[0]?.id || null
  );
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const activeChapter = book.chapters.find(c => c.id === activeChapterId);

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    setBook({
      ...book,
      chapters: book.chapters.map(ch =>
        ch.id === chapterId ? { ...ch, ...updates } : ch
      ),
    });
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: '新しいチャプター',
      slug: `chapter-${book.chapters.length + 1}`,
      content: '',
      order: book.chapters.length,
      free: false,
    };
    
    setBook({
      ...book,
      chapters: [...book.chapters, newChapter],
    });
    setActiveChapterId(newChapter.id);
  };

  const deleteChapter = (chapterId: string) => {
    setBook({
      ...book,
      chapters: book.chapters.filter(ch => ch.id !== chapterId),
    });
  };

  const reorderChapters = (chapters: Chapter[]) => {
    setBook({ ...book, chapters });
  };

  return (
    <div className="book-editor">
      <div className="book-editor-header">
        <BookSettings
          title={book.title}
          summary={book.summary}
          price={book.price}
          topics={book.topics}
          published={book.published}
          onChange={(updates) => setBook({ ...book, ...updates })}
        />
        
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('edit')}
            className={viewMode === 'edit' ? 'active' : ''}
          >
            編集
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={viewMode === 'preview' ? 'active' : ''}
          >
            プレビュー
          </button>
        </div>
      </div>

      <div className="book-editor-body">
        <aside className="chapter-sidebar">
          <ChapterList
            chapters={book.chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={setActiveChapterId}
            onAddChapter={addChapter}
            onDeleteChapter={deleteChapter}
            onReorder={reorderChapters}
          />
        </aside>

        <main className="chapter-content">
          {viewMode === 'edit' ? (
            activeChapter && (
              <ChapterEditor
                chapter={activeChapter}
                onChange={(updates) => updateChapter(activeChapter.id, updates)}
                onSave={() => onSave(book)}
              />
            )
          ) : (
            <BookPreview book={book} />
          )}
        </main>
      </div>
    </div>
  );
};
```

### 4.2 チャプター管理

```tsx
// components/Editor/BookEditor/ChapterList.tsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock,
  ChevronRight 
} from 'lucide-react';

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onAddChapter: () => void;
  onDeleteChapter: (id: string) => void;
  onReorder: (chapters: Chapter[]) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onReorder,
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 順序を更新
    const updatedChapters = items.map((ch, index) => ({
      ...ch,
      order: index,
    }));

    onReorder(updatedChapters);
  };

  return (
    <div className="chapter-list">
      <div className="chapter-list-header">
        <h3>チャプター</h3>
        <button onClick={onAddChapter} className="add-chapter-btn">
          <Plus size={16} />
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="chapter-items"
            >
              {chapters.map((chapter, index) => (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`chapter-item ${
                        activeChapterId === chapter.id ? 'active' : ''
                      } ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="drag-handle"
                      >
                        <GripVertical size={16} />
                      </div>
                      
                      <button
                        onClick={() => onSelectChapter(chapter.id)}
                        className="chapter-content"
                      >
                        <span className="chapter-number">
                          {index + 1}
                        </span>
                        <span className="chapter-title">
                          {chapter.title}
                        </span>
                        {chapter.free ? (
                          <Unlock size={14} className="free-icon" />
                        ) : (
                          <Lock size={14} className="paid-icon" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => onDeleteChapter(chapter.id)}
                        className="delete-btn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="chapter-stats">
        <span>合計 {chapters.length} チャプター</span>
        <span>
          無料 {chapters.filter(ch => ch.free).length} / 
          有料 {chapters.filter(ch => !ch.free).length}
        </span>
      </div>
    </div>
  );
};
```

### 4.3 チャプターエディター

```tsx
// components/Editor/BookEditor/ChapterEditor.tsx
import React from 'react';
import { MarkdownEditor } from '../MarkdownEditor';
import { Toggle } from '@/components/ui/Toggle';

interface ChapterEditorProps {
  chapter: Chapter;
  onChange: (updates: Partial<Chapter>) => void;
  onSave: () => void;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({
  chapter,
  onChange,
  onSave,
}) => {
  return (
    <div className="chapter-editor">
      <div className="chapter-header">
        <input
          type="text"
          value={chapter.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="chapter-title-input"
          placeholder="チャプタータイトル"
        />
        
        <div className="chapter-settings">
          <label className="free-toggle">
            <Toggle
              checked={chapter.free}
              onChange={(free) => onChange({ free })}
            />
            <span>無料公開</span>
          </label>
          
          <button onClick={onSave} className="save-btn">
            保存
          </button>
        </div>
      </div>

      <div className="chapter-slug">
        <label>スラッグ（URL）</label>
        <input
          type="text"
          value={chapter.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          pattern="[a-z0-9-]+"
        />
      </div>

      <div className="chapter-editor-content">
        <MarkdownEditor
          value={chapter.content}
          onChange={(content) => onChange({ content })}
          placeholder="チャプターの内容を書きましょう..."
          extensions={['book-navigation', 'footnotes', 'table-of-contents']}
        />
      </div>
    </div>
  );
};
```

## 5. スクラップエディター

### 5.1 スクラップエディター仕様

```tsx
// components/Editor/ScrapEditor/index.tsx
import React, { useState, useRef } from 'react';
import { ScrapComment } from './ScrapComment';
import { ScrapInput } from './ScrapInput';
import { Clock, Lock, Unlock, Archive } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Scrap {
  id?: string;
  title: string;
  comments: Comment[];
  topics: string[];
  closed: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ScrapEditor: React.FC<{
  scrap: Scrap;
  onSave: (scrap: Scrap) => Promise<void>;
}> = ({ scrap: initialScrap, onSave }) => {
  const [scrap, setScrap] = useState<Scrap>(initialScrap);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addComment = async (content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedScrap = {
      ...scrap,
      comments: [...scrap.comments, newComment],
      updatedAt: new Date(),
    };

    setScrap(updatedScrap);
    await onSave(updatedScrap);
    
    // 最新コメントまでスクロール
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateComment = async (commentId: string, content: string) => {
    const updatedScrap = {
      ...scrap,
      comments: scrap.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, content, updatedAt: new Date() }
          : comment
      ),
      updatedAt: new Date(),
    };

    setScrap(updatedScrap);
    await onSave(updatedScrap);
    setEditingCommentId(null);
  };

  const deleteComment = async (commentId: string) => {
    const updatedScrap = {
      ...scrap,
      comments: scrap.comments.filter(c => c.id !== commentId),
      updatedAt: new Date(),
    };

    setScrap(updatedScrap);
    await onSave(updatedScrap);
  };

  const toggleStatus = async () => {
    const updatedScrap = {
      ...scrap,
      closed: !scrap.closed,
      updatedAt: new Date(),
    };

    setScrap(updatedScrap);
    await onSave(updatedScrap);
  };

  return (
    <div className="scrap-editor">
      <div className="scrap-header">
        <input
          type="text"
          value={scrap.title}
          onChange={(e) => setScrap({ ...scrap, title: e.target.value })}
          className="scrap-title"
          placeholder="スクラップのタイトル"
        />
        
        <div className="scrap-actions">
          <button
            onClick={toggleStatus}
            className={`status-btn ${scrap.closed ? 'closed' : 'open'}`}
          >
            {scrap.closed ? (
              <>
                <Lock size={16} />
                Closed
              </>
            ) : (
              <>
                <Unlock size={16} />
                Open
              </>
            )}
          </button>
          
          {scrap.archived && (
            <span className="archived-badge">
              <Archive size={16} />
              アーカイブ済み
            </span>
          )}
        </div>
      </div>

      <div className="scrap-topics">
        <TopicInput
          topics={scrap.topics}
          onChange={(topics) => setScrap({ ...scrap, topics })}
          placeholder="トピックを追加"
        />
      </div>

      <div className="scrap-timeline">
        {scrap.comments.map((comment, index) => (
          <ScrapComment
            key={comment.id}
            comment={comment}
            isFirst={index === 0}
            isLast={index === scrap.comments.length - 1}
            isEditing={editingCommentId === comment.id}
            onEdit={() => setEditingCommentId(comment.id)}
            onUpdate={(content) => updateComment(comment.id, content)}
            onDelete={() => deleteComment(comment.id)}
            onCancelEdit={() => setEditingCommentId(null)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {!scrap.closed && (
        <div className="scrap-input-container">
          <ScrapInput
            onSubmit={addComment}
            placeholder="コメントを追加..."
          />
        </div>
      )}

      {scrap.closed && (
        <div className="scrap-closed-message">
          このスクラップはクローズされています
        </div>
      )}
    </div>
  );
};
```

### 5.2 スクラップコメント

```tsx
// components/Editor/ScrapEditor/ScrapComment.tsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ScrapCommentProps {
  comment: Comment;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

export const ScrapComment: React.FC<ScrapCommentProps> = ({
  comment,
  isFirst,
  isLast,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}) => {
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent);
    }
  };

  return (
    <div className={`scrap-comment ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}>
      <div className="timeline-connector" />
      <div className="timeline-dot" />
      
      <div className="comment-content">
        <div className="comment-header">
          <time className="comment-time">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </time>
          
          {!isEditing && (
            <div className="comment-actions">
              <button onClick={onEdit} className="action-btn">
                <Edit2 size={14} />
              </button>
              <button onClick={onDelete} className="action-btn danger">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="comment-editor">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-textarea"
              autoFocus
            />
            <div className="editor-actions">
              <button onClick={handleSave} className="btn-save">
                <Save size={14} />
                保存
              </button>
              <button onClick={onCancelEdit} className="btn-cancel">
                <X size={14} />
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-body">
            <MarkdownRenderer content={comment.content} />
          </div>
        )}

        {comment.updatedAt > comment.createdAt && (
          <div className="comment-edited">
            編集済み
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5.3 スクラップ入力

```tsx
// components/Editor/ScrapEditor/ScrapInput.tsx
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Code, Bold, Italic } from 'lucide-react';

interface ScrapInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

export const ScrapInput: React.FC<ScrapInputProps> = ({
  onSubmit,
  placeholder = 'コメントを追加...',
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = 
      content.substring(0, start) +
      prefix + selectedText + suffix +
      content.substring(end);
    
    setContent(newText);
    
    // カーソル位置を調整
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className={`scrap-input ${isExpanded ? 'expanded' : ''}`}>
      {isExpanded && (
        <div className="input-toolbar">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="toolbar-btn"
            title="太字"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="toolbar-btn"
            title="斜体"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="toolbar-btn"
            title="コード"
          >
            <Code size={14} />
          </button>
          <button
            onClick={() => insertMarkdown('```\n', '\n```')}
            className="toolbar-btn"
            title="コードブロック"
          >
            {'</>'}
          </button>
        </div>
      )}

      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="scrap-textarea"
          rows={isExpanded ? 5 : 1}
        />
        
        <div className="input-actions">
          <button className="attach-btn" title="ファイルを添付">
            <Paperclip size={16} />
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="submit-btn"
            title="送信 (Ctrl+Enter)"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="input-hint">
          Markdownが使えます • Ctrl+Enterで送信
        </div>
      )}
    </div>
  );
};
```

## 6. 共通コンポーネント

### 6.1 エディター設定

```tsx
// components/Editor/EditorSettings.tsx
import React from 'react';
import { Settings, Moon, Sun, Type, Eye } from 'lucide-react';

interface EditorSettingsProps {
  settings: {
    theme: 'light' | 'dark';
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    wordWrap: boolean;
    showLineNumbers: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
  };
  onChange: (settings: any) => void;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="editor-settings">
      <h3>エディター設定</h3>
      
      <div className="setting-group">
        <label>テーマ</label>
        <div className="theme-selector">
          <button
            onClick={() => onChange({ ...settings, theme: 'light' })}
            className={settings.theme === 'light' ? 'active' : ''}
          >
            <Sun size={16} />
            ライト
          </button>
          <button
            onClick={() => onChange({ ...settings, theme: 'dark' })}
            className={settings.theme === 'dark' ? 'active' : ''}
          >
            <Moon size={16} />
            ダーク
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>フォントサイズ</label>
        <input
          type="range"
          min="12"
          max="20"
          value={settings.fontSize}
          onChange={(e) => onChange({ ...settings, fontSize: parseInt(e.target.value) })}
        />
        <span>{settings.fontSize}px</span>
      </div>

      <div className="setting-group">
        <label>フォント</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
        >
          <option value="monospace">等幅フォント</option>
          <option value="sans-serif">ゴシック体</option>
          <option value="serif">明朝体</option>
        </select>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.wordWrap}
            onChange={(e) => onChange({ ...settings, wordWrap: e.target.checked })}
          />
          折り返し
        </label>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.showLineNumbers}
            onChange={(e) => onChange({ ...settings, showLineNumbers: e.target.checked })}
          />
          行番号を表示
        </label>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => onChange({ ...settings, autoSave: e.target.checked })}
          />
          自動保存
        </label>
        {settings.autoSave && (
          <select
            value={settings.autoSaveInterval}
            onChange={(e) => onChange({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
          >
            <option value="30000">30秒ごと</option>
            <option value="60000">1分ごと</option>
            <option value="180000">3分ごと</option>
            <option value="300000">5分ごと</option>
          </select>
        )}
      </div>
    </div>
  );
};
```

### 6.2 公開設定

```tsx
// components/Editor/PublishSettings.tsx
import React from 'react';
import { Calendar, Globe, Lock, DollarSign } from 'lucide-react';

interface PublishSettingsProps {
  contentType: 'article' | 'book' | 'scrap';
  settings: any;
  onChange: (settings: any) => void;
}

export const PublishSettings: React.FC<PublishSettingsProps> = ({
  contentType,
  settings,
  onChange,
}) => {
  const renderArticleSettings = () => (
    <>
      <div className="publish-option">
        <input
          type="radio"
          id="public"
          name="visibility"
          checked={settings.published}
          onChange={() => onChange({ ...settings, published: true })}
        />
        <label htmlFor="public">
          <Globe size={16} />
          <span>公開</span>
          <small>誰でも閲覧可能</small>
        </label>
      </div>
      
      <div className="publish-option">
        <input
          type="radio"
          id="draft"
          name="visibility"
          checked={!settings.published}
          onChange={() => onChange({ ...settings, published: false })}
        />
        <label htmlFor="draft">
          <Lock size={16} />
          <span>下書き</span>
          <small>自分だけが閲覧可能</small>
        </label>
      </div>

      {settings.published && (
        <div className="schedule-option">
          <label>
            <Calendar size={16} />
            予約投稿
          </label>
          <input
            type="datetime-local"
            value={settings.publishedAt || ''}
            onChange={(e) => onChange({ ...settings, publishedAt: e.target.value })}
          />
        </div>
      )}
    </>
  );

  const renderBookSettings = () => (
    <>
      <div className="price-setting">
        <label>
          <DollarSign size={16} />
          価格設定
        </label>
        <div className="price-options">
          <label>
            <input
              type="radio"
              checked={settings.price === 0}
              onChange={() => onChange({ ...settings, price: 0 })}
            />
            無料
          </label>
          <label>
            <input
              type="radio"
              checked={settings.price > 0}
              onChange={() => onChange({ ...settings, price: 500 })}
            />
            有料
          </label>
        </div>
        {settings.price > 0 && (
          <input
            type="number"
            value={settings.price}
            onChange={(e) => onChange({ ...settings, price: parseInt(e.target.value) })}
            min="100"
            max="10000"
            step="100"
          />
        )}
      </div>
    </>
  );

  const renderScrapSettings = () => (
    <>
      <div className="scrap-visibility">
        <label>
          <input
            type="checkbox"
            checked={!settings.closed}
            onChange={(e) => onChange({ ...settings, closed: !e.target.checked })}
          />
          コメントを受け付ける
        </label>
      </div>
    </>
  );

  return (
    <div className="publish-settings">
      <h3>公開設定</h3>
      {contentType === 'article' && renderArticleSettings()}
      {contentType === 'book' && renderBookSettings()}
      {contentType === 'scrap' && renderScrapSettings()}
    </div>
  );
};
```

## 7. エディター切り替えロジック

### 7.1 ルーティング設定

```tsx
// pages/editor/[type]/[[...params]].tsx
import { useRouter } from 'next/router';
import { UnifiedEditor } from '@/components/Editor/UnifiedEditor';

export default function EditorPage() {
  const router = useRouter();
  const { type, params } = router.query;

  const contentType = type as 'article' | 'book' | 'scrap';
  const contentId = params?.[0];

  if (!['article', 'book', 'scrap'].includes(contentType)) {
    return <InvalidContentType />;
  }

  return (
    <UnifiedEditor
      contentType={contentType}
      contentId={contentId}
      onSave={async (content) => {
        // 保存処理
      }}
    />
  );
}
```

### 7.2 エディター状態管理

```typescript
// stores/editor.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  // 現在の編集中コンテンツ
  activeContent: {
    type: 'article' | 'book' | 'scrap';
    id?: string;
    data: any;
  } | null;

  // エディター設定
  settings: {
    theme: 'light' | 'dark';
    fontSize: number;
    autoSave: boolean;
  };

  // 下書き
  drafts: Map<string, any>;

  // アクション
  setActiveContent: (content: any) => void;
  updateSettings: (settings: any) => void;
  saveDraft: (key: string, data: any) => void;
  loadDraft: (key: string) => any;
  clearDraft: (key: string) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      activeContent: null,
      settings: {
        theme: 'light',
        fontSize: 16,
        autoSave: true,
      },
      drafts: new Map(),

      setActiveContent: (content) => set({ activeContent: content }),
      
      updateSettings: (settings) => 
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      saveDraft: (key, data) =>
        set((state) => {
          const drafts = new Map(state.drafts);
          drafts.set(key, data);
          return { drafts };
        }),

      loadDraft: (key) => get().drafts.get(key),

      clearDraft: (key) =>
        set((state) => {
          const drafts = new Map(state.drafts);
          drafts.delete(key);
          return { drafts };
        }),
    }),
    {
      name: 'editor-storage',
    }
  )
);
```

---

*最終更新: 2025-09-05*
*バージョン: 1.0.0*