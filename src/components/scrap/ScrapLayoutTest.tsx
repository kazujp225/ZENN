'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ScrapLayoutTest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/scraps" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              スクラップ一覧
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}