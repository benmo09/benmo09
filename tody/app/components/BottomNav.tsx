'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const navItems = [
    { href: '/feed-video', label: 'HOME', icon: '🏠' },
    { href: '/search', label: 'SEARCH', icon: '🔍' },
    { href: '/sell', label: 'SELL', icon: '📤' },
    { href: '/live', label: 'LIVE', icon: '🔴' },
    { href: '/profile', label: 'PROFILE', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-white/10 z-50 safe-area-inset-b">
      <div className="flex justify-around items-center max-w-7xl mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-4 px-2 text-center transition ${
              isActive(item.href)
                ? 'text-blue-500 border-t-2 border-blue-500'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs font-bold">{item.label}</div>
          </Link>
        ))}
      </div>
    </nav>
  )
}
