import Link from 'next/link'
import { Users, Calendar, BarChart2, CreditCard, ImageIcon, Settings, ChevronRight } from 'lucide-react'

const MODULES = [
  { label: 'Membres', Icon: Users, href: '/members', color: 'var(--color-success)', bg: 'var(--color-primary-light)' },
  { label: 'Événements', Icon: Calendar, href: '/events', color: 'var(--color-success)', bg: 'var(--color-primary-light)' },
  { label: 'Stats', Icon: BarChart2, href: '/stats', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  { label: 'Finances', Icon: CreditCard, href: '/finances', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
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
          className="bg-white rounded-xl border border-[#D1D1D6] p-3.5 flex items-center gap-3 hover:border-success hover:shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)] flex-1 leading-tight">{label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D1D1D6] group-hover:text-success transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}
