#!/usr/bin/env ts-node

/**
 * データベースとアプリケーションの一致率検査スクリプト
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qyvjtrdvbfxgfdydyhqe.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dmp0cmR2YmZ4Z2ZkeWR5aHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0NDE0MSwiZXhwIjoyMDcyOTIwMTQxfQ.2s628jmVl6K-Y_RjRtM2X9IepSSWxJxfffIRTL9dHXs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseMatch() {
  console.log('🔍 Zenn-Clone データベース一致率検査\n')
  console.log('=' .repeat(60))

  const results = {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    details: [] as any[]
  }

  // 1. テーブル存在確認
  console.log('\n📋 1. テーブル存在確認')
  console.log('-' .repeat(40))
  
  const requiredTables = [
    'users',
    'articles', 
    'books',
    'book_chapters',
    'scraps',
    'scrap_comments',
    'article_comments',
    'topics',
    'likes',
    'follows'
  ]

  for (const table of requiredTables) {
    results.totalChecks++
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (!error) {
        console.log(`✅ ${table}: 存在 (${count || 0}件)`)
        results.passedChecks++
        results.details.push({ table, status: 'OK', count })
      } else {
        console.log(`❌ ${table}: エラー - ${error.message}`)
        results.failedChecks++
        results.details.push({ table, status: 'ERROR', error: error.message })
      }
    } catch (e: any) {
      console.log(`❌ ${table}: 接続エラー`)
      results.failedChecks++
      results.details.push({ table, status: 'CONNECTION_ERROR' })
    }
  }

  // 2. API モジュール確認
  console.log('\n📚 2. API モジュール確認')
  console.log('-' .repeat(40))
  
  const apiModules = [
    'articles.ts',
    'books.ts',
    'scraps.ts',
    'users.ts',
    'topics.ts',
    'comments.ts',
    'auth.ts'
  ]

  const apiPath = path.join(process.cwd(), 'src/lib/api')
  for (const module of apiModules) {
    results.totalChecks++
    const modulePath = path.join(apiPath, module)
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf-8')
      const hasSupabaseImport = content.includes('supabase')
      if (hasSupabaseImport) {
        console.log(`✅ ${module}: Supabase統合済み`)
        results.passedChecks++
      } else {
        console.log(`⚠️  ${module}: Supabase未統合`)
        results.failedChecks++
      }
    } else {
      console.log(`❌ ${module}: ファイル不在`)
      results.failedChecks++
    }
  }

  // 3. ページのAPI利用状況
  console.log('\n🖥️  3. ページのAPI利用状況')
  console.log('-' .repeat(40))
  
  const pagesToCheck = [
    { path: 'src/app/page.tsx', name: 'ホーム' },
    { path: 'src/app/articles/page.tsx', name: '記事一覧' },
    { path: 'src/app/books/page.tsx', name: '書籍一覧' },
    { path: 'src/app/scraps/page.tsx', name: 'スクラップ一覧' },
    { path: 'src/app/explore/page.tsx', name: 'Explore' },
    { path: 'src/app/dashboard/page.tsx', name: 'ダッシュボード' },
    { path: 'src/app/trending/page.tsx', name: 'トレンディング' },
    { path: 'src/app/articles/[slug]/page.tsx', name: '記事詳細' },
    { path: 'src/app/books/[slug]/page.tsx', name: '書籍詳細' },
    { path: 'src/app/scraps/[id]/page.tsx', name: 'スクラップ詳細' }
  ]

  for (const page of pagesToCheck) {
    results.totalChecks++
    const pagePath = path.join(process.cwd(), page.path)
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf-8')
      const hasApiImport = content.includes('@/lib/api') || content.includes('Api')
      const hasMockData = content.includes('mock') || content.includes('サンプル') || content.includes('田中太郎')
      
      if (hasApiImport && !hasMockData) {
        console.log(`✅ ${page.name}: API接続済み`)
        results.passedChecks++
      } else if (hasApiImport && hasMockData) {
        console.log(`⚠️  ${page.name}: API接続あり（モックデータ混在）`)
        results.failedChecks++
      } else {
        console.log(`❌ ${page.name}: API未接続`)
        results.failedChecks++
      }
    } else {
      console.log(`❌ ${page.name}: ファイル不在`)
      results.failedChecks++
    }
  }

  // 4. データ整合性チェック
  console.log('\n🔗 4. データ整合性チェック')
  console.log('-' .repeat(40))
  
  // ユーザーが存在するか
  results.totalChecks++
  const { data: users } = await supabase.from('users').select('*').limit(1)
  if (users && users.length > 0) {
    console.log(`✅ ユーザーデータ: 存在`)
    results.passedChecks++
    
    // そのユーザーの記事が存在するか
    results.totalChecks++
    const { data: articles } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', users[0].id)
      .limit(1)
    
    if (articles && articles.length > 0) {
      console.log(`✅ 記事データ: ユーザーと関連付け済み`)
      results.passedChecks++
    } else {
      console.log(`⚠️  記事データ: ユーザーと未関連`)
      results.failedChecks++
    }
  } else {
    console.log(`❌ ユーザーデータ: 不在`)
    results.failedChecks++
  }

  // 5. 最終結果
  console.log('\n' + '=' .repeat(60))
  console.log('📊 検査結果サマリー')
  console.log('=' .repeat(60))
  
  const matchRate = Math.round((results.passedChecks / results.totalChecks) * 100)
  
  console.log(`\n総チェック数: ${results.totalChecks}`)
  console.log(`✅ 成功: ${results.passedChecks}`)
  console.log(`❌ 失敗: ${results.failedChecks}`)
  console.log(`\n🎯 データベース一致率: ${matchRate}%`)
  
  if (matchRate >= 90) {
    console.log('\n✨ 素晴らしい！データベースとアプリケーションは高度に統合されています。')
  } else if (matchRate >= 70) {
    console.log('\n🔧 良好ですが、いくつかの改善点があります。')
  } else if (matchRate >= 50) {
    console.log('\n⚠️  統合は部分的です。追加の作業が必要です。')
  } else {
    console.log('\n❌ 統合レベルが低いです。大幅な改善が必要です。')
  }

  return results
}

// 実行
checkDatabaseMatch()
  .then(results => {
    process.exit(results.failedChecks > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('エラー:', error)
    process.exit(1)
  })