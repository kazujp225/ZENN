import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__section">
            <h4>メインページ</h4>
            <nav className="footer__links">
              <Link href="/" className="footer__link">
                トップページ
              </Link>
              <Link href="/trending" className="footer__link">
                トレンド
              </Link>
              <Link href="/explore" className="footer__link">
                探す
              </Link>
              <Link href="/search" className="footer__link">
                検索
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>コンテンツ</h4>
            <nav className="footer__links">
              <Link href="/articles" className="footer__link">
                記事一覧
              </Link>
              <Link href="/paid-articles" className="footer__link">
                有料記事
              </Link>
              <Link href="/books" className="footer__link">
                書籍
              </Link>
              <Link href="/scraps" className="footer__link">
                スクラップ
              </Link>
              <Link href="/topics" className="footer__link">
                トピック
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>投稿・編集</h4>
            <nav className="footer__links">
              <Link href="/new/article" className="footer__link">
                記事を書く
              </Link>
              <Link href="/edit/sample-article" className="footer__link">
                記事編集（サンプル）
              </Link>
              <Link href="/dashboard/earnings" className="footer__link">
                収益管理
              </Link>
              <Link href="/consultations" className="footer__link">
                相談
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>その他のページ</h4>
            <nav className="footer__links">
              <Link href="/jobs" className="footer__link">
                採用情報
              </Link>
              <Link href="/zenn" className="footer__link">
                Zennについて
              </Link>
              <Link href="/testuser" className="footer__link">
                プロフィール（サンプル）
              </Link>
              <Link href="/articles/sample-article" className="footer__link">
                記事詳細（サンプル）
              </Link>
              <Link href="/books/sample-book" className="footer__link">
                書籍詳細（サンプル）
              </Link>
              <Link href="/scraps/sample-scrap" className="footer__link">
                スクラップ詳細（サンプル）
              </Link>
              <Link href="/topics/react" className="footer__link">
                トピック詳細（React）
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="footer__divider" style={{ margin: '2rem 0', borderTop: '1px solid var(--color-border)' }}></div>
        
        <div className="footer__all-pages">
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>全ページ一覧（開発用）</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <Link href="/" className="footer__link" style={{ fontSize: '0.75rem' }}>/ (トップ)</Link>
            <Link href="/trending" className="footer__link" style={{ fontSize: '0.75rem' }}>/trending</Link>
            <Link href="/explore" className="footer__link" style={{ fontSize: '0.75rem' }}>/explore</Link>
            <Link href="/search" className="footer__link" style={{ fontSize: '0.75rem' }}>/search</Link>
            <Link href="/articles" className="footer__link" style={{ fontSize: '0.75rem' }}>/articles</Link>
            <Link href="/paid-articles" className="footer__link" style={{ fontSize: '0.75rem' }}>/paid-articles</Link>
            <Link href="/books" className="footer__link" style={{ fontSize: '0.75rem' }}>/books</Link>
            <Link href="/scraps" className="footer__link" style={{ fontSize: '0.75rem' }}>/scraps</Link>
            <Link href="/topics" className="footer__link" style={{ fontSize: '0.75rem' }}>/topics</Link>
            <Link href="/new/article" className="footer__link" style={{ fontSize: '0.75rem' }}>/new/article</Link>
            <Link href="/edit/sample-edit" className="footer__link" style={{ fontSize: '0.75rem' }}>/edit/sample-edit</Link>
            <Link href="/dashboard/earnings" className="footer__link" style={{ fontSize: '0.75rem' }}>/dashboard/earnings</Link>
            <Link href="/consultations" className="footer__link" style={{ fontSize: '0.75rem' }}>/consultations</Link>
            <Link href="/jobs" className="footer__link" style={{ fontSize: '0.75rem' }}>/jobs</Link>
            <Link href="/zenn" className="footer__link" style={{ fontSize: '0.75rem' }}>/zenn</Link>
            <Link href="/sampleuser" className="footer__link" style={{ fontSize: '0.75rem' }}>/sampleuser</Link>
            <Link href="/articles/sample-slug" className="footer__link" style={{ fontSize: '0.75rem' }}>/articles/sample-slug</Link>
            <Link href="/books/sample-slug" className="footer__link" style={{ fontSize: '0.75rem' }}>/books/sample-slug</Link>
            <Link href="/scraps/123" className="footer__link" style={{ fontSize: '0.75rem' }}>/scraps/123</Link>
            <Link href="/topics/nextjs" className="footer__link" style={{ fontSize: '0.75rem' }}>/topics/nextjs</Link>
          </div>
        </div>
        
        <div className="footer__bottom" style={{ marginTop: '2rem' }}>
          <p>&copy; 2025 Zenn Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}