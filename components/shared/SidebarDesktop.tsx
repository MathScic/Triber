'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Shield, Calendar,
  CreditCard, MessageSquare, BarChart2, Settings, CircleUser, LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'admin' | 'member_active' | 'member'

const NAV = [
  { href: '/home',           label: 'Accueil',        Icon: LayoutDashboard, minRole: undefined },
  { href: '/events',         label: 'Événements',     Icon: Calendar,        minRole: undefined },
  { href: '/stats',          label: 'Statistiques',   Icon: BarChart2,       minRole: undefined },
  { href: '/profile',        label: 'Mon profil',     Icon: CircleUser,      minRole: undefined },
  { href: '/members',        label: 'Membres',        Icon: Users,           minRole: 'admin' as Role },
  { href: '/teams',          label: 'Équipes',        Icon: Shield,          minRole: 'admin' as Role },
  { href: '/finances',       label: 'Finances',       Icon: CreditCard,      minRole: 'admin' as Role },
  { href: '/communications', label: 'Communications', Icon: MessageSquare,   minRole: 'member_active' as Role },
  { href: '/settings',       label: 'Paramètres',     Icon: Settings,        minRole: 'admin' as Role },
]

const ROLE_RANK: Record<Role, number> = { member: 0, member_active: 1, admin: 2 }
const canSee = (r: Role, min?: Role) => !min || ROLE_RANK[r] >= ROLE_RANK[min]
const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', member_active: 'Actif', member: 'Membre' }

interface Props { orgName: string | null; orgLogo: string | null; userName: string | null; role: Role; primaryColor: string }

export function SidebarDesktop({ orgName, orgLogo, userName, role, primaryColor }: Props) {
  const path = usePathname()
  const router = useRouter()
  const logout = async () => { await createClient().auth.signOut(); router.push('/login') }
  const initials = (userName ?? 'U').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-56 z-40 bg-brand-dark">

      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
          <Image src="/images/icon-triber.svg" alt="Triber" width={30} height={30} className="object-contain" />
        </div>
        <span className="text-lg font-[800] text-white uppercase tracking-widest font-[family-name:var(--font-barlow)]">
          TRIBER
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.filter(item => canSee(role, item.minRole)).map(({ href, label, Icon }) => {
          const base = href.split('?')[0]
          const active = path === base || (base !== '/home' && path.startsWith(base))
          return (
            <Link key={href} href={href}
              style={active ? { backgroundColor: primaryColor } : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                active ? 'text-white shadow-sm' : 'text-white/55 hover:text-white hover:bg-white/10'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {userName && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-[800] text-white/70 font-[family-name:var(--font-barlow)]">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white/90 truncate font-[family-name:var(--font-nunito)]">{userName}</p>
            <p className="text-[10px] text-white/40 font-[family-name:var(--font-nunito)]">{ROLE_LABEL[role]}</p>
          </div>
          <button onClick={() => void logout()} title="Se déconnecter"
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {orgLogo
            ? <img src={orgLogo} alt="logo" className="w-full h-full object-cover" />
            : <Shield className="w-4 h-4 text-white/40" />
          }
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white/90 truncate font-[family-name:var(--font-nunito)]">{orgName ?? 'Mon club'}</p>
          <p className="text-[10px] text-white/40 font-[family-name:var(--font-nunito)]">{new Date().getFullYear()} – {new Date().getFullYear() + 1}</p>
        </div>
      </div>
    </aside>
  )
}
