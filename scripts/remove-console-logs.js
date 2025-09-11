#!/usr/bin/env node

/**
 * リリース前セキュリティ対応：console.logの一括削除スクリプト
 * 本番環境でのデバッグ情報漏洩を防ぐため、全てのconsole.logを削除
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // console.logパターンの置換
  let newContent = content
    // console.log(...) -> // console.log削除（セキュリティ対応）
    .replace(/^(\s*)console\.log\([^)]*\);?\s*$/gm, '$1// console.log削除（セキュリティ対応）')
    // console.error(...) -> // エラーログ削除（セキュリティ対応）
    .replace(/^(\s*)console\.error\([^)]*\);?\s*$/gm, '$1// エラーログ削除（セキュリティ対応）')
    // console.warn(...) -> // 警告ログ削除（セキュリティ対応）
    .replace(/^(\s*)console\.warn\([^)]*\);?\s*$/gm, '$1// 警告ログ削除（セキュリティ対応）')
    // console.debug(...) -> // デバッグログ削除（セキュリティ対応）
    .replace(/^(\s*)console\.debug\([^)]*\);?\s*$/gm, '$1// デバッグログ削除（セキュリティ対応）');

  if (newContent !== content) {
    modified = true;
    fs.writeFileSync(filePath, newContent);
    console.log(`✓ Modified: ${path.relative(srcDir, filePath)}`);
  }
  
  return modified;
}

function walkDirectory(dir) {
  let totalModified = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      totalModified += walkDirectory(filePath);
    } else if (stat.isFile()) {
      if (processFile(filePath)) {
        totalModified++;
      }
    }
  }
  
  return totalModified;
}

console.log('🔒 リリース前セキュリティ対応: console.log削除スクリプト実行中...');
console.log('📁 対象ディレクトリ:', srcDir);
console.log('');

const modifiedCount = walkDirectory(srcDir);

console.log('');
console.log('✅ セキュリティ対応完了');
console.log(`📝 修正ファイル数: ${modifiedCount} files`);
console.log('🛡️  本番環境での情報漏洩リスクを軽減しました');

if (modifiedCount === 0) {
  console.log('ℹ️  console.logは既に適切に処理済みです');
}