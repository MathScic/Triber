import { ExternalLink, Trophy } from 'lucide-react'

interface Props {
  url: string
}

export function ScoreEncoWidget({ url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between w-full px-4 py-3.5 bg-brand-bg rounded-xl border border-[#D1D1D6] hover:border-success hover:bg-primary-light transition-colors group"
    >
      <div className="flex items-center gap-2.5">
        <Trophy className="w-4 h-4 text-secondary" />
        <div>
          <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">
            Classement officiel Score'n'co
          </p>
          <p className="text-[11px] text-[#6B7280] font-[family-name:var(--font-nunito)]">
            Ouvre la page du championnat
          </p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-[#6B7280] group-hover:text-success transition-colors flex-shrink-0" />
    </a>
  )
}
