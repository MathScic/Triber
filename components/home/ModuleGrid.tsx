import Link from 'next/link'
import { Users, Calendar, BarChart2, CreditCard, ImageIcon, Settings, ChevronRight } from 'lucide-react'

const MODULES = [
  { label: 'Membres', Icon: Users, href: '/members', color: '#2A9D4E', bg: '#E8F5EE' },
  { label: 'Événements', Icon: Calendar, href: '/events', color: '#2A9D4E', bg: '#E8F5EE' },
  { label: 'Stats', Icon: BarChart2, href: '/stats', color: '#E8622A', bg: '#FDF0EB' },
  { label: 'Finances', Icon: CreditCard, href: '/finances', color: '#E8622A', bg: '#FDF0EB' },
  { label: 'Médias', Icon: ImageIcon, href: '/media', color: '#6B7280', bg: '#F4F4F6' },
  { label: 'Paramètres', Icon: Settings, href: '/settings', color: '#6B7280', bg: '#F4F4F6' },
]

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {MODULES.map(({ label, Icon, href, color, bg }) => (
        <Link
          key={label}
          href={href}
          className="bg-white rounded-xl border border-[#D1D1D6] p-3.5 flex items-center gap-3 hover:border-[#2A9D4E] hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)] flex-1 leading-tight">{label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D1D1D6] group-hover:text-[#2A9D4E] transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}
