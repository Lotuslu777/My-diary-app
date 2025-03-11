'use client'
import Link from 'next/link'
import { Home, User, BarChart } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a4a5e]/80 backdrop-blur-sm">
      <div className="flex justify-around p-4">
        <Link href="/" className={pathname === '/' ? 'text-white' : 'text-white/60'}>
          <Home />
        </Link>
        <Link href="/analysis" className={pathname === '/analysis' ? 'text-white' : 'text-white/60'}>
          <BarChart />
        </Link>
        <Link href="/profile" className={pathname === '/profile' ? 'text-white' : 'text-white/60'}>
          <User />
        </Link>
      </div>
    </nav>
  )
}