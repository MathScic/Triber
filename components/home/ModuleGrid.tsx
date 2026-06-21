import Link from 'next/link'

const MODULES = [
  { label: 'Membres', icon: '👥', href: '/members' },
  { label: 'Événements', icon: '📅', href: '/events' },
  { label: 'Stats', icon: '📊', href: '/stats' },
  { label: 'Finances', icon: '💳', href: '/finances' },
  { label: 'Médias', icon: '🖼️', href: '/media' },
  { label: 'Paramètres', icon: '⚙️', href: '/settings' },
]

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MODULES.map(({ label, icon, href }) => (
        <Link
          key={label}
          href={href}
          className="bg-white rounded-2xl border border-[#DDD8CE] p-4 flex flex-col items-center gap-2 hover:border-[#2A9D4E] hover:shadow-sm transition-all"
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-sm font-semibold text-[#1A1F16] font-[family-name:var(--font-nunito)]">{label}</span>
        </Link>
      ))}
    </div>
  )
}
