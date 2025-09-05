'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ArticlesRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard with articles tab
    // Note: In a real app, we'd pass state or query params to activate the articles tab
    router.replace('/dashboard#articles')
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>リダイレクト中...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>ダッシュボードへ移動しています</div>
      </div>
    </div>
  )
}