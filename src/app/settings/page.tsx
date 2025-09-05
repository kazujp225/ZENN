'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SettingsIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to profile settings as the default page
    router.replace('/settings/profile')
  }, [router])

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">設定</h1>
        <p className="settings-content__description">リダイレクト中...</p>
      </div>
    </div>
  )
}