import { AlertTriangle, Image, Check } from 'lucide-react'
import type { TreasuryEntry } from '@/lib/hooks/useTreasury'

interface Props {
  entries: TreasuryEntry[]
  isFlagged: (e: TreasuryEntry) => boolean
}

export function BuvetteList({ entries, isFlagged }: Props) {
  if (!entries.length) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-8 text-center">
        <p className="text-sm text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucune entrée enregistrée.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      {entries.map((e, idx) => {
        const flagged = isFlagged(e)
        const ecart = e.amount_ticket_cents !== null ? e.amount_ticket_cents - e.amount_declared_cents : null
        const dateLabel = new Date(e.entry_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        const enteredBy = e.profiles?.full_name ?? '—'

        return (
          <div key={e.id} className={`flex items-start gap-3 px-4 py-3.5 ${idx !== entries.length - 1 ? 'border-b border-[#F4F4F6]' : ''} ${flagged ? 'bg-red-50' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${flagged ? 'bg-red-100' : 'bg-primary-light'}`}>
              {flagged ? <AlertTriangle className="w-4 h-4 text-secondary" /> : <Check className="w-4 h-4 text-success" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-[800] tabular-nums font-[family-name:var(--font-barlow)] text-brand-dark">
                  {(e.amount_declared_cents / 100).toFixed(2)} €
                </p>
                {flagged && ecart !== null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-white font-[family-name:var(--font-nunito)]">
                    {ecart < 0 ? '-' : '+'}{(Math.abs(ecart) / 100).toFixed(2)} €
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
                {dateLabel} · {enteredBy}
              </p>
              {e.notes && (
                <p className="text-xs text-[#6B7280] italic mt-0.5 font-[family-name:var(--font-nunito)]">{e.notes}</p>
              )}
              {flagged && e.amount_ticket_cents !== null && (
                <p className="text-xs text-secondary mt-0.5 font-[family-name:var(--font-nunito)]">
                  Ticket : {(e.amount_ticket_cents / 100).toFixed(2)} € · Écart signalé
                </p>
              )}
            </div>

            {e.photo_url && (
              <a href={e.photo_url} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl overflow-hidden border border-[#D1D1D6] flex-shrink-0 hover:opacity-80 transition-opacity">
                <img src={e.photo_url} alt="Ticket" className="w-full h-full object-cover" />
              </a>
            )}
            {!e.photo_url && (
              <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center flex-shrink-0">
                <Image className="w-4 h-4 text-[#D1D1D6]" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
