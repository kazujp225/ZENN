import { ReactNode } from 'react'
import { ZennHeader } from '@/components/common/ZennHeader'
import { ZennFooter } from '@/components/common/ZennFooter'

interface LayoutProps {
  children: ReactNode
}

export default function ZennLayout({ children }: LayoutProps) {
  return (
    <>
      <ZennHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ZennFooter />
    </>
  )
}