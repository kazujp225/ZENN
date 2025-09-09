'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration)
            
            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60000) // Check every minute
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  return null
}