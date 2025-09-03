import Link from 'next/link'
import { SearchBar } from '@/components/features/SearchBar'

export const ZennHeader = () => {
  return (
    <header className="header" role="banner">
      <div className="container header__container">
        <Link href="/zenn" className="text-2xl font-bold text-primary">
          Zenn
        </Link>
        
        <nav aria-label="Global navigation" className="header__nav">
          <Link href="/zenn" className="header__nav-item header__nav-item--active">
            Trending
          </Link>
          <Link href="/explore" className="header__nav-item">
            Explore
          </Link>
        </nav>
        
        <div className="flex gap-4 items-center">
          <SearchBar />
          <button className="btn btn--primary">
            ログイン
          </button>
        </div>
      </div>
    </header>
  )
}