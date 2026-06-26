'use client'

import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import type { StandingRow } from '@/lib/hooks/useStandings'

interface Props {
  rows: StandingRow[]
  season: string
  onUpsert: (row: Omit<StandingRow, 'id'> & { id?: string }) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

type DraftRow = Omit<StandingRow, 'id'> & { id?: string; dirty?: boolean }

const EMPTY = (rank: number, season: string): DraftRow => ({
  rank, team_name: '', played: 0, won: 0, drawn: 0, lost: 0,
  goals_for: 0, goals_against: 0, points: 0, is_own_team: false, season,
})

function numField(value: number, onChange: (n: number) => void) {
  return (
    <input
      type="number" min={0} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-10 text-center text-xs border border-[#D1D1D6] rounded-lg px-1 py-1.5 bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] tabular-nums font-[family-name:var(--font-nunito)]"
    />
  )
}

export function StandingsForm({ rows, season, onUpsert, onRemove }: Props) {
  const [drafts, setDrafts] = useState<DraftRow[]>(
    rows.length ? rows.map(r => ({ ...r })) : [EMPTY(1, season)]
  )
  const [saving, setSaving] = useState<string | null>(null)

  const update = (idx: number, patch: Partial<DraftRow>) =>
    setDrafts(d => d.map((r, i) => i === idx ? { ...r, ...patch, dirty: true } : r))

  const addRow = () =>
    setDrafts(d => [...d, EMPTY(d.length + 1, season)])

  const save = async (idx: number) => {
    const row = drafts[idx]
    setSaving(row.id ?? `new-${idx}`)
    await onUpsert(row)
    setSaving(null)
    setDrafts(d => d.map((r, i) => i === idx ? { ...r, dirty: false } : r))
  }

  const remove = async (idx: number) => {
    const row = drafts[idx]
    if (row.id) await onRemove(row.id)
    setDrafts(d => d.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#D1D1D6]">
              {['#', 'Équipe', 'J', 'V', 'N', 'D', 'Bp', 'Bc', 'Pts', 'Nous', ''].map(h => (
                <th key={h} className="py-2 px-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-center font-[family-name:var(--font-nunito)] first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drafts.map((row, idx) => (
              <tr key={idx} className="border-b border-[#F4F4F6]">
                <td className="py-1.5 px-1">
                  {numField(row.rank, v => update(idx, { rank: v }))}
                </td>
                <td className="py-1.5 px-1">
                  <input
                    type="text" value={row.team_name} placeholder="Nom équipe"
                    onChange={e => update(idx, { team_name: e.target.value })}
                    className="w-28 text-xs border border-[#D1D1D6] rounded-lg px-2 py-1.5 bg-[#F4F4F6] focus:outline-none focus:border-[#2A9D4E] font-[family-name:var(--font-nunito)]"
                  />
                </td>
                <td className="py-1.5 px-1">{numField(row.played, v => update(idx, { played: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.won, v => update(idx, { won: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.drawn, v => update(idx, { drawn: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.lost, v => update(idx, { lost: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.goals_for, v => update(idx, { goals_for: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.goals_against, v => update(idx, { goals_against: v }))}</td>
                <td className="py-1.5 px-1">{numField(row.points, v => update(idx, { points: v }))}</td>
                <td className="py-1.5 px-1 text-center">
                  <input
                    type="checkbox" checked={row.is_own_team}
                    onChange={e => update(idx, { is_own_team: e.target.checked })}
                    className="w-4 h-4 accent-[#2A9D4E] cursor-pointer"
                  />
                </td>
                <td className="py-1.5 px-1">
                  <div className="flex items-center gap-1">
                    {row.dirty && (
                      <button onClick={() => void save(idx)} disabled={saving !== null}
                        className="p-1.5 rounded-lg bg-[#E8622A] text-white hover:bg-[#d4571f] transition-colors">
                        <Save className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => void remove(idx)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FDF0EB] hover:text-[#E8622A] transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow}
        className="flex items-center gap-2 text-sm text-[#2A9D4E] font-semibold font-[family-name:var(--font-nunito)] hover:opacity-80 transition-opacity">
        <Plus className="w-4 h-4" />
        Ajouter une équipe
      </button>
    </div>
  )
}
