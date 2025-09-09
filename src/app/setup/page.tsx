'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'

export default function SetupPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseAnon: boolean
    sessionSecret: boolean
  }>({
    supabaseUrl: false,
    supabaseAnon: false,
    sessionSecret: false
  })
  
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // 環境変数のチェック（クライアント側でアクセス可能なもののみ）
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      sessionSecret: false // サーバー側のみ
    })
  }, [])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const envTemplate = `NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-secret-key-here`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">セットアップガイド</h1>
        
        {/* 環境変数ステータス */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-500" />
            環境変数の設定状況
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
              {envStatus.supabaseUrl ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              {envStatus.supabaseAnon ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">SUPABASE_SERVICE_ROLE_KEY</span>
              <span className="text-gray-500 text-sm">サーバー側のみ</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">SESSION_SECRET</span>
              <span className="text-gray-500 text-sm">サーバー側のみ</span>
            </div>
          </div>
        </div>

        {/* セットアップ手順 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">セットアップ手順</h2>
          
          <ol className="space-y-4">
            <li>
              <h3 className="font-semibold mb-2">1. Supabaseプロジェクトを作成</h3>
              <p className="text-gray-600 mb-2">
                Supabaseダッシュボードで新しいプロジェクトを作成します。
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                Supabaseダッシュボードを開く
                <ExternalLink size={16} />
              </a>
            </li>
            
            <li>
              <h3 className="font-semibold mb-2">2. 環境変数を取得</h3>
              <p className="text-gray-600 mb-2">
                プロジェクト設定 → API から以下の値を取得します：
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Project URL</li>
                <li>anon (public) key</li>
                <li>service_role (secret) key</li>
              </ul>
            </li>
            
            <li>
              <h3 className="font-semibold mb-2">3. .env.localファイルを作成</h3>
              <p className="text-gray-600 mb-2">
                プロジェクトルートに <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> ファイルを作成し、以下の内容を記入します：
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                  <code>{envTemplate}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(envTemplate, 'env')}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  {copied === 'env' ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-300" />
                  )}
                </button>
              </div>
            </li>
            
            <li>
              <h3 className="font-semibold mb-2">4. データベースを初期化</h3>
              <p className="text-gray-600 mb-2">
                Supabase SQL Editorで <code className="bg-gray-100 px-2 py-1 rounded">SETUP.md</code> のSQLを実行します。
              </p>
            </li>
            
            <li>
              <h3 className="font-semibold mb-2">5. アプリケーションを再起動</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded">
                <code>npm run dev</code>
              </div>
            </li>
          </ol>
        </div>

        {/* Vercelデプロイ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Vercelへのデプロイ</h2>
          
          <p className="text-gray-600 mb-4">
            Vercelにデプロイする場合は、プロジェクト設定で環境変数を設定してください。
          </p>
          
          <div className="space-y-2">
            <p className="font-medium">必要な環境変数：</p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
              <li>SESSION_SECRET</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>注意：</strong> 環境変数を設定後、Vercelで再デプロイが必要です。
            </p>
          </div>
        </div>

        {/* エラー解決 */}
        {(!envStatus.supabaseUrl || !envStatus.supabaseAnon) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">
              環境変数が設定されていません
            </h3>
            <p className="text-red-700 text-sm">
              上記の手順に従って環境変数を設定してください。
              設定後はアプリケーションの再起動が必要です。
            </p>
          </div>
        )}
        
        {envStatus.supabaseUrl && envStatus.supabaseAnon && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">
              環境変数が正しく設定されています
            </h3>
            <p className="text-green-700 text-sm">
              Supabaseとの接続が可能です。データベースの初期化を忘れずに行ってください。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}