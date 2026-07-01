import { BuvetteList } from '@/components/finances/BuvetteList'
import type { TreasuryEntry } from '@/lib/hooks/useTreasury'

interface Props {
  total: number
  flaggedCount: number
  entries: TreasuryEntry[]
  isFlagged: (e: TreasuryEntry) => boolean
}

export function BuvetteStatsGrid({ total, flaggedCount, entries, isFlagged }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-4">
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Total encaissé</p>
          <p className="text-2xl font-[800] text-success tabular-nums font-[family-name:var(--font-barlow)]">{(total / 100).toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-4">
          <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)]">Écarts signalés</p>
          <p className={`text-2xl font-[800] tabular-nums font-[family-name:var(--font-barlow)] ${flaggedCount > 0 ? 'text-secondary' : 'text-success'}`}>{flaggedCount}</p>
        </div>
      </div>
      <BuvetteList entries={entries} isFlagged={isFlagged} />
    </>
  )
}
