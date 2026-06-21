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
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          className="w-9 h-9 rounded-xl border border-[#DDD8CE] flex items-center justify-center flex-shrink-0 hover:bg-[#F0EBE1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#7A8070]" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-3xl font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)] leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  )
}
