import type { Metadata, Viewport } from 'next'
import { Layout } from '@/components/common/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { EnhancedAuthProvider } from '@/hooks/useEnhancedAuth'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ServiceWorkerRegister } from './service-worker-register'
import '@/styles/globals.css'
import '@/styles/components/auth.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Zenn Clone - エンジニアのための知識共有コミュニティ',
  description: 'エンジニアが知識を共有するためのプラットフォーム。テック記事、アイデア、本、スクラップを投稿・閲覧できます。',
  keywords: 'エンジニア, プログラミング, 技術記事, 知識共有',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <EnhancedAuthProvider>
            <ServiceWorkerRegister />
            <Layout>{children}</Layout>
            <AIAssistant />
          </EnhancedAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}