'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, BarChart2, CreditCard, Settings } from 'lucide-react'

const NAV = [
  { href: '/home', label: 'Accueil', Icon: Home },
  { href: '/events', label: 'Événements', Icon: Calendar },
  { href: '/members', label: 'Membres', Icon: Users },
  { href: '/stats', label: 'Stats', Icon: BarChart2 },
  { href: '/finances', label: 'Finances', Icon: CreditCard },
  { href: '/settings', label: 'Réglages', Icon: Settings },
]

export function AppNav() {
  const path = usePathname()

  return (
    <>
      {/* ── Barre basse — mobile & tablette ─────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-[#DDD8CE] flex">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors ${
                active ? 'text-[#2A9D4E]' : 'text-[#7A8070] hover:text-[#1A1F16]'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold font-[family-name:var(--font-nunito)] leading-none">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Sidebar gauche — desktop ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-52 bg-white border-r border-[#DDD8CE] z-40">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-2.5 border-b border-[#DDD8CE]">
          <div className="w-8 h-8 rounded-lg bg-[#2A9D4E] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-[800] font-[family-name:var(--font-barlow)]">T</span>
          </div>
          <span className="text-xl font-[800] text-[#1A1F16] uppercase font-[family-name:var(--font-barlow)] tracking-tight">
            Triber
          </span>
        </div>

        {/* Liens */}
        <nav className="flex flex-col px-3 py-4 gap-1 flex-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold font-[family-name:var(--font-nunito)] ${
                  active
                    ? 'bg-[#E8F5EE] text-[#2A9D4E]'
                    : 'text-[#7A8070] hover:bg-[#F0EBE1] hover:text-[#1A1F16]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
