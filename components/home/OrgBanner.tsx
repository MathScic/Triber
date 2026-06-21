interface Props {
  name: string
  fullName: string
  logoUrl?: string | null
  coverUrl?: string | null
  initial: string
}

export function OrgBanner({ name, fullName, logoUrl, coverUrl, initial }: Props) {
  return (
    <div className="mb-6">
      {/* Photo de couverture */}
      {coverUrl && (
        <div className="w-full h-32 rounded-2xl overflow-hidden mb-4">
          <img src={coverUrl} className="w-full h-full object-cover" alt="Couverture" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo de l'organisation */}
          {logoUrl ? (
            <img src={logoUrl} className="w-10 h-10 rounded-xl object-contain border border-[#DDD8CE]" alt={name} />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#2A9D4E] flex items-center justify-center">
              <span className="text-white text-sm font-[800] font-[family-name:var(--font-barlow)]">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-[800] text-[#1A1F16] font-[family-name:var(--font-barlow)] uppercase tracking-tight leading-none">
              {name}
            </h1>
            <p className="text-sm text-[#7A8070] font-[family-name:var(--font-nunito)]">
              Bonjour, {fullName} 👋
            </p>
          </div>
        </div>

        {/* Avatar utilisateur */}
        <div className="w-10 h-10 rounded-full bg-[#2A9D4E] flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-sm font-[800] font-[family-name:var(--font-barlow)]">{initial}</span>
        </div>
      </div>
    </div>
  )
}
