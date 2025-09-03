'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children, ...props }) => {
          const text = Array.isArray(children) ? children.join('') : children?.toString() || ''
          const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // 特殊文字を除去
            .replace(/\s+/g, '-')     // スペースをハイフンに
            .trim()
          return (
            <h1 {...props} id={id} className="text-4xl font-bold mt-8 mb-6 pb-3 border-b-2 border-blue-500">
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
            <h2 {...props} id={id} className="text-3xl font-bold mt-8 mb-4 pl-4 border-l-4 border-blue-500">
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
            <h3 {...props} id={id} className="text-2xl font-semibold mt-6 mb-3">
              {children}
            </h3>
          )
        },
        h4: ({ children, ...props }: any) => (
          <h4 {...props} className="text-xl font-semibold mt-4 mb-2">
            {children}
          </h4>
        ),
        p: ({ children, ...props }: any) => (
          <p {...props} className="text-base leading-relaxed mb-4">
            {children}
          </p>
        ),
        ul: ({ children, ...props }: any) => (
          <ul {...props} className="list-disc list-inside mb-4 space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: any) => (
          <ol {...props} className="list-decimal list-inside mb-4 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children, ...props }: any) => (
          <li {...props} className="ml-4">
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }: any) => (
          <blockquote {...props} className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic bg-gray-50 rounded-r">
            {children}
          </blockquote>
        ),
        table: ({ children, ...props }: any) => (
          <div className="overflow-x-auto my-6">
            <table {...props} className="min-w-full divide-y divide-gray-200">
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
          <th {...props} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
          return !inline && match ? (
            <div className="my-4 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm flex justify-between items-center">
                <span className="font-mono">{match[1]}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
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
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        a: ({ children, href, ...props }: any) => (
          <a 
            {...props} 
            href={href}
            className="text-primary underline underline-offset-2 hover:text-blue-700 transition-colors"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        img: ({ src, alt, ...props }: any) => (
          <figure className="my-6">
            <img 
              {...props}
              src={src} 
              alt={alt} 
              className="w-full rounded-lg shadow-md"
            />
            {alt && (
              <figcaption className="text-center text-sm text-gray-600 mt-2">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        hr: (...props: any[]) => (
          <hr className="my-8 border-t border-gray-200" />
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
            <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
              {children}
            </pre>
          )
        }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}