'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, CircleUser, CreditCard, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'admin' | 'member_active' | 'member'

const NAV_ALL = [
  { href: '/home',        label: 'Accueil',    Icon: LayoutDashboard, minRole: undefined },
  { href: '/events',      label: 'Agenda',     Icon: Calendar,        minRole: undefined },
  { href: '/profile',     label: 'Profil',     Icon: CircleUser,      minRole: undefined },
  { href: '/finances',    label: 'Finances',   Icon: CreditCard,      minRole: 'admin' as Role },
  { href: '/settings',    label: 'Paramètres', Icon: Settings,        minRole: 'admin' as Role },
]

const ROLE_RANK: Record<Role, number> = { member: 0, member_active: 1, admin: 2 }

function canSee(userRole: Role, minRole: Role | undefined) {
  if (!minRole) return true
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole]
}

interface Props {
  primaryColor: string
  userName?: string | null
  role: Role
}

export function SidebarMobile({ primaryColor, userName, role }: Props) {
  const path = usePathname()
  const router = useRouter()
  const nav = NAV_ALL.filter(item => canSee(role, item.minRole))

  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-brand-dark border-t border-white/10 flex flex-col">
      {userName && (
        <div className="flex items-center justify-between px-4 py-1 border-b border-white/5">
          <p className="text-[9px] text-white/60 truncate font-[family-name:var(--font-nunito)]">{userName}</p>
          <button onClick={() => void logout()} className="text-white/25 hover:text-white/60 transition-colors ml-2 flex-shrink-0">
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex">
        {nav.map(({ href, label, Icon }) => {
          const active = path === href || (href !== '/home' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2.5 gap-1 transition-colors ${active ? 'text-white' : 'text-white/40'}`}>
              <div style={active ? { backgroundColor: primaryColor } : undefined} className="p-1 rounded-lg transition-colors">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="text-[9px] font-semibold font-[family-name:var(--font-nunito)] leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
