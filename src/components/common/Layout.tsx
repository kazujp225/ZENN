import { ReactNode } from 'react'
import { EnhancedHeader } from '@/components/layout/EnhancedHeader'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-to-content">
        メインコンテンツへスキップ
      </a>
      
      <EnhancedHeader />
      
      <main id="main-content" className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}
