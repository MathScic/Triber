import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref = '/home', action }: Props) {
  return (
    // Empilé sur mobile (sinon le sous-titre se tronque à l'excès à côté d'une action large)
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          className="w-9 h-9 rounded-xl border border-[#D1D1D6] flex items-center justify-center flex-shrink-0 hover:bg-[#E8E8EA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-3xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)] leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 sm:ml-3">{action}</div>}
    </div>
  )
}
