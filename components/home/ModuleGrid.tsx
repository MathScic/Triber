import Link from 'next/link'
import { Users, Calendar, BarChart2, CreditCard, ImageIcon, Settings } from 'lucide-react'

const MODULES = [
  { label: 'Membres', Icon: Users, href: '/members' },
  { label: 'Événements', Icon: Calendar, href: '/events' },
  { label: 'Stats', Icon: BarChart2, href: '/stats' },
  { label: 'Finances', Icon: CreditCard, href: '/finances' },
  { label: 'Médias', Icon: ImageIcon, href: '/media' },
  { label: 'Paramètres', Icon: Settings, href: '/settings' },
]

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MODULES.map(({ label, Icon, href }) => (
        <Link
          key={label}
          href={href}
          className="bg-white rounded-2xl border border-[#DDD8CE] p-4 flex flex-col items-center gap-2 hover:border-[#2A9D4E] hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#2A9D4E]" />
          </div>
          <span className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">{label}</span>
        </Link>
      ))}
    </div>
  )
}
