'use client'

import { memo, useMemo, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface OptimizedMarkdownContentProps {
  content: string
  lazy?: boolean
  maxInitialLength?: number
}

const MarkdownRenderer = memo(({ content }: { content: string }) => {
  const renderedContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => {
          const text = Array.isArray(children) ? children.join('') : children?.toString() || ''
          const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
          return (
            <h1 
              {...props} 
              id={id} 
              className="text-4xl font-bold mt-8 mb-6 pb-3 border-b-2 border-blue-500 scroll-mt-20"
              tabIndex={-1}
            >
              {children}
            </h1>
          )
        },
        h2: ({ children, ...props }) => {
          const text = Array.isArray(children) ? children.join('') : children?.toString() || ''
          const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
          return (
            <h2 
              {...props} 
              id={id} 
              className="text-3xl font-bold mt-8 mb-4 pl-4 border-l-4 border-blue-500 scroll-mt-20"
              tabIndex={-1}
            >
              {children}
            </h2>
          )
        },
        h3: ({ children, ...props }) => {
          const text = Array.isArray(children) ? children.join('') : children?.toString() || ''
          const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
          return (
            <h3 
              {...props} 
              id={id} 
              className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20"
              tabIndex={-1}
            >
              {children}
            </h3>
          )
        },
        h4: ({ children, ...props }: any) => (
          <h4 {...props} className="text-xl font-semibold mt-4 mb-2 scroll-mt-20" tabIndex={-1}>
            {children}
          </h4>
        ),
        p: ({ children, ...props }: any) => (
          <p {...props} className="text-base leading-relaxed mb-4 text-gray-800">
            {children}
          </p>
        ),
        ul: ({ children, ...props }: any) => (
          <ul {...props} className="list-disc list-inside mb-4 space-y-1 ml-4" role="list">
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: any) => (
          <ol {...props} className="list-decimal list-inside mb-4 space-y-1 ml-4" role="list">
            {children}
          </ol>
        ),
        li: ({ children, ...props }: any) => (
          <li {...props} className="ml-4" role="listitem">
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }: any) => (
          <blockquote 
            {...props} 
            className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic bg-blue-50 rounded-r-lg"
            role="note"
            aria-label="引用"
          >
            {children}
          </blockquote>
        ),
        table: ({ children, ...props }: any) => (
          <div className="overflow-x-auto my-6" role="region" aria-label="データテーブル">
            <table {...props} className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }: any) => (
          <thead {...props} className="bg-gray-50">
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }: any) => (
          <tbody {...props} className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        ),
        th: ({ children, ...props }: any) => (
          <th 
            {...props} 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            scope="col"
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }: any) => (
          <td {...props} className="px-6 py-4 whitespace-nowrap text-sm">
            {children}
          </td>
        ),
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')
          
          return !inline && match ? (
            <div className="my-4 rounded-lg overflow-hidden" role="region" aria-label={`${match[1]}のコードブロック`}>
              <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm flex justify-between items-center">
                <span className="font-mono">{match[1]}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(codeString).then(() => {
                      // Success feedback could be added here
                    }).catch(() => {
                      // Error handling
                    })
                  }}
                  className="text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="コードをクリップボードにコピー"
                  title="コードをコピー"
                >
                  📋 Copy
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '0.875rem'
                }}
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code 
              className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" 
              {...props}
            >
              {children}
            </code>
          )
        },
        a: ({ children, href, ...props }: any) => (
          <a 
            {...props} 
            href={href}
            className="text-primary underline underline-offset-2 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={href?.startsWith('http') ? `外部リンク: ${children}` : undefined}
          >
            {children}
            {href?.startsWith('http') && (
              <span className="inline-block ml-1 text-xs opacity-70" aria-hidden="true">
                ↗
              </span>
            )}
          </a>
        ),
        img: ({ src, alt, ...props }: any) => (
          <figure className="my-6" role="img" aria-label={alt}>
            <img 
              {...props}
              src={src} 
              alt={alt} 
              className="w-full rounded-lg shadow-md"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                // Could show a placeholder here
              }}
            />
            {alt && (
              <figcaption className="text-center text-sm text-gray-600 mt-2">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        hr: (...props: any[]) => (
          <hr className="my-8 border-t border-gray-200" role="separator" />
        ),
        strong: ({ children, ...props }: any) => (
          <strong {...props} className="font-bold text-gray-900">
            {children}
          </strong>
        ),
        em: ({ children, ...props }: any) => (
          <em {...props} className="italic">
            {children}
          </em>
        ),
        pre: ({ children, ...props }: any) => {
          // Check if this pre contains a code block that will be handled by SyntaxHighlighter
          const codeChild = (children as any)?.props?.className?.startsWith('language-')
          if (codeChild) {
            return <>{children}</>
          }
          return (
            <pre 
              {...props} 
              className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"
              role="region"
              aria-label="コードブロック"
            >
              {children}
            </pre>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  ), [content])

  return renderedContent
})

MarkdownRenderer.displayName = 'MarkdownRenderer'

export const OptimizedMarkdownContent = memo(({ 
  content, 
  lazy = false, 
  maxInitialLength = 10000 
}: OptimizedMarkdownContentProps) => {
  const shouldRenderLazy = lazy && content.length > maxInitialLength
  
  if (shouldRenderLazy) {
    return (
      <div className="markdown-content">
        <Suspense fallback={
          <div className="space-y-4" role="status" aria-label="コンテンツを読み込み中">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        }>
          <MarkdownRenderer content={content} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="markdown-content" role="main" aria-label="記事本文">
      <MarkdownRenderer content={content} />
    </div>
  )
})

OptimizedMarkdownContent.displayName = 'OptimizedMarkdownContent'