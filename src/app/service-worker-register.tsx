'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            // console.log削除（セキュリティ対応）
            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60000) // Check every minute
          })
          .catch((error) => {
            // エラーログ削除（セキュリティ対応）
          })
      })
    }
  }, [])

  return null
}