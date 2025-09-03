import Link from 'next/link'

export const ZennFooter = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__section">
            <h4>About</h4>
            <nav className="footer__links">
              <Link href="/about" className="footer__link">
                Zennについて
              </Link>
              <Link href="/terms" className="footer__link">
                利用規約
              </Link>
              <Link href="/privacy" className="footer__link">
                プライバシーポリシー
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>Resources</h4>
            <nav className="footer__links">
              <Link href="/docs" className="footer__link">
                ドキュメント
              </Link>
              <Link href="/api" className="footer__link">
                API
              </Link>
              <Link href="/blog" className="footer__link">
                ブログ
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>Community</h4>
            <nav className="footer__links">
              <Link href="/discord" className="footer__link">
                Discord
              </Link>
              <Link href="/github" className="footer__link">
                GitHub
              </Link>
              <Link href="/twitter" className="footer__link">
                Twitter
              </Link>
            </nav>
          </div>
          
          <div className="footer__section">
            <h4>Legal</h4>
            <nav className="footer__links">
              <Link href="/guidelines" className="footer__link">
                ガイドライン
              </Link>
              <Link href="/support" className="footer__link">
                サポート
              </Link>
              <Link href="/contact" className="footer__link">
                お問い合わせ
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>&copy; 2025 Zenn Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}