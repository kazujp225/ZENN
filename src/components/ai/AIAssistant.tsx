'use client'

import { useState, useRef, useEffect } from 'react'
import '@/styles/components/ai-assistant.css'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'code' | 'suggestion'
  language?: string
}

interface AIAssistantProps {
  context?: 'article' | 'book' | 'scrap' | 'general'
  initialPrompt?: string
  onSuggestion?: (suggestion: string) => void
}

export const AIAssistant = ({ context = 'general', initialPrompt, onSuggestion }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！Zenn AIアシスタントです。技術記事の執筆、コードの改善、学習のサポートなど、何でもお手伝いします。どのようなことでお困りですか？',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // コンテキストに応じたプロンプト提案
  const contextPrompts: Record<string, string[]> = {
    article: [
      '📝 記事の構成を提案して',
      '🔍 このトピックの重要ポイントは？',
      '💡 タイトルのアイデアを5つ',
      '✨ イントロダクションを改善して',
      '📊 図表で説明すべき箇所は？'
    ],
    book: [
      '📚 章立ての構成を提案',
      '🎯 ターゲット読者の定義',
      '📖 各章のサマリーを作成',
      '💭 演習問題のアイデア',
      '🔗 関連トピックの提案'
    ],
    scrap: [
      '💬 議論のポイントを整理',
      '❓ 深掘りすべき質問',
      '🤔 別の視点から考察',
      '📌 要点をまとめて',
      '🔄 関連する話題は？'
    ],
    general: [
      '🚀 Next.jsの最新機能',
      '🦀 Rustを学ぶメリット',
      '☁️ AWSのベストプラクティス',
      '🐳 Docker入門ガイド',
      '🤖 AI開発の始め方'
    ]
  }

  useEffect(() => {
    setSuggestedPrompts(contextPrompts[context])
  }, [context])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // AI応答のシミュレーション
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, context)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      
      if (onSuggestion && aiResponse.type === 'suggestion') {
        onSuggestion(aiResponse.content)
      }
    }, 1500)
  }

  const generateAIResponse = (prompt: string, context: string): Message => {
    const responses: Record<string, () => Message> = {
      'Next.js': () => ({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Next.js 14の主要な新機能をご紹介します：

## 🚀 App Router (安定版)
- **Server Components**: デフォルトでサーバーサイドレンダリング
- **Layouts**: 共通レイアウトの効率的な管理
- **Loading UI**: 自動的なローディング状態の管理
- **Error Handling**: エラー境界の簡単な実装

## ⚡ パフォーマンス改善
\`\`\`typescript
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // ISRの設定
  })
  return <div>{/* コンテンツ */}</div>
}
\`\`\`

## 🔧 開発体験の向上
- **Turbopack**: より高速なビルド
- **Server Actions**: フォーム処理の簡素化
- **Parallel Routes**: 複数のページを同時表示

これらの機能を活用することで、より高速で保守性の高いWebアプリケーションを構築できます。`,
        timestamp: new Date(),
        type: 'code',
        language: 'typescript'
      }),
      'Rust': () => ({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Rustを学ぶメリットを詳しく説明します：

## 🦀 Rustの特徴

### 1. **メモリ安全性**
所有権システムにより、ガベージコレクタなしでメモリ安全性を保証：
\`\`\`rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // 所有権が移動
    // println!("{}", s1); // コンパイルエラー
    println!("{}", s2); // OK
}
\`\`\`

### 2. **高速性**
C/C++に匹敵するパフォーマンス：
- ゼロコスト抽象化
- 効率的なメモリ管理
- 最適化されたコンパイラ

### 3. **並行処理**
データ競合をコンパイル時に防ぐ：
\`\`\`rust
use std::thread;
use std::sync::Arc;

let data = Arc::new(vec![1, 2, 3]);
let data_clone = Arc::clone(&data);

thread::spawn(move || {
    println!("{:?}", data_clone);
});
\`\`\`

### 4. **実用例**
- **WebAssembly**: ブラウザで高速処理
- **システムプログラミング**: OS、組み込み
- **Web開発**: Actix-web、Rocket
- **ゲーム開発**: Bevy Engine`,
        timestamp: new Date(),
        type: 'code',
        language: 'rust'
      }),
      default: () => ({
        id: Date.now().toString(),
        role: 'assistant',
        content: `ご質問ありがとうございます。「${prompt}」について説明します。

このトピックについて、以下の観点から解説させていただきます：

1. **基本概念**: 核となる考え方と原理
2. **実装方法**: 具体的な手順とコード例
3. **ベストプラクティス**: 推奨される実装パターン
4. **注意点**: よくある落とし穴と対策
5. **関連リソース**: 参考になる資料とドキュメント

具体的にどの部分について詳しく知りたいですか？コード例や実装の詳細もお示しできます。`,
        timestamp: new Date(),
        type: 'text'
      })
    }

    // キーワードマッチング
    for (const [keyword, responseGen] of Object.entries(responses)) {
      if (keyword !== 'default' && prompt.toLowerCase().includes(keyword.toLowerCase())) {
        return responseGen()
      }
    }

    return responses.default()
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* AI Assistant Floating Button */}
      {!isOpen && (
        <button
          className="ai-assistant-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <span className="ai-assistant-fab__icon">🤖</span>
          <span className="ai-assistant-fab__badge">AI</span>
        </button>
      )}

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <div className={`ai-assistant ${isMinimized ? 'ai-assistant--minimized' : ''}`}>
          {/* Header */}
          <div className="ai-assistant__header">
            <div className="ai-assistant__header-left">
              <span className="ai-assistant__icon">🤖</span>
              <div>
                <h3 className="ai-assistant__title">Zenn AI Assistant</h3>
                <span className="ai-assistant__status">
                  {isTyping ? '入力中...' : 'オンライン'}
                </span>
              </div>
            </div>
            <div className="ai-assistant__header-actions">
              <button
                className="ai-assistant__header-btn"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                className="ai-assistant__header-btn"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Suggested Prompts */}
              <div className="ai-assistant__prompts">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="ai-assistant__prompt-chip"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="ai-assistant__messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`ai-assistant__message ai-assistant__message--${message.role}`}
                  >
                    {message.role === 'assistant' && (
                      <span className="ai-assistant__message-icon">🤖</span>
                    )}
                    <div className="ai-assistant__message-content">
                      {message.type === 'code' ? (
                        <div className="ai-assistant__code-block">
                          <pre><code>{message.content}</code></pre>
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                      )}
                      <span className="ai-assistant__message-time">
                        {message.timestamp.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="ai-assistant__message ai-assistant__message--assistant">
                    <span className="ai-assistant__message-icon">🤖</span>
                    <div className="ai-assistant__typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="ai-assistant__input-container">
                <textarea
                  ref={inputRef}
                  className="ai-assistant__input"
                  placeholder="質問を入力してください..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />
                <button
                  className="ai-assistant__send-btn"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <span>送信</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

// メッセージのフォーマット（Markdown風）
const formatMessage = (content: string): string => {
  return content
    .replace(/## (.*?)$/gm, '<h3>$1</h3>')
    .replace(/### (.*?)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>')
}