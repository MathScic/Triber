import { Trash2 } from 'lucide-react'
import type { MatchAction, OrgMember } from '@/lib/match/types'
import { pairActionsWithAssists } from '@/lib/utils/match'
import { BallSvg, CardRect } from '@/components/match/MatchIcons'

interface Props {
  actions: MatchAction[]
  members: OrgMember[]
  onRemove?: (id: string) => void
  opponentName?: string
  isHome?: boolean | null
  orgName?: string
}
function BootSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280" className="flex-shrink-0">
      <path d="M6.5 3.5H9V11.5L16.5 13.5C17.5 13.8 17.8 15.2 17 15.8L5 19C4.2 19.3 3.5 18.7 3.5 17.8V11.5C3.5 7.2 4.5 5 6.5 3.5Z"/>
      <rect x="3" y="17.5" width="14" height="2.5" rx="1.2" fill="#5A6060"/>
    </svg>
  )
}

function abbrev(n: string) { const p = n.trim().split(' '); return p.length < 2 ? n : `${p[0][0]}.${p.slice(1).join(' ')}` }

function resolveName(a: MatchAction, members: OrgMember[], opp: string) {
  if (!a.is_own_team) return opp
  if (a.player_name) return abbrev(a.player_name)
  const m = members.find(m => m.user_id === a.user_id)
  return m ? abbrev(m.name) : '—'
}
function resolveJersey(uid: string | null, members: OrgMember[]) {
  return uid ? (members.find(m => m.user_id === uid)?.jersey ?? null) : null
}

export function EventTimeline({ actions, members, onRemove, opponentName = 'Adversaire', isHome = true, orgName = 'Nous' }: Props) {
  const pairs = pairActionsWithAssists(actions)

  if (!pairs.length) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-6 text-center">
        <p className="text-sm text-center text-[#6B7280] font-[family-name:var(--font-nunito)]">Aucune action enregistrée</p>
      </div>
    )
  }

  const homeLabel = isHome !== false ? orgName : opponentName
  const awayLabel = isHome !== false ? opponentName : orgName

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 gap-2 px-4 py-2.5 border-b border-[#F0F0F2]">
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest truncate font-[family-name:var(--font-nunito)]">{homeLabel}</p>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest text-right truncate font-[family-name:var(--font-nunito)]">{awayLabel}</p>
      </div>

      <div className="divide-y divide-[#F4F4F6]">
        {pairs.map(({ main: action, assist }) => {
          const isHomeAction = isHome !== false ? action.is_own_team : !action.is_own_team
          const name = resolveName(action, members, opponentName)
          const jersey = action.is_own_team ? resolveJersey(action.user_id, members) : null
          const assistName = assist ? resolveName(assist, members, opponentName) : null
          const assistJersey = assist ? resolveJersey(assist.user_id, members) : null
          const icon = action.type === 'goal'
            ? <BallSvg color={isHomeAction ? 'var(--color-brand-dark)' : '#ef4444'} />
            : <CardRect color={action.type === 'yellow_card' ? 'yellow' : 'red'} />
          const rev = !isHomeAction ? 'flex-row-reverse' : ''

          return (
            <div key={action.id} className="grid grid-cols-2 gap-0">
              <div className="px-3 py-2">
                {isHomeAction && (
                  <div className="space-y-0.5">
                    <div className={`flex items-center gap-2 ${rev}`}>
                      {onRemove && <button onClick={() => onRemove(action.id)} className="text-[#D1D1D6] hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="w-3 h-3" /></button>}
                      <span className="text-[11px] font-[800] text-[#6B7280] font-[family-name:var(--font-barlow)] tabular-nums flex-shrink-0">{action.minute}&apos;</span>
                      {icon}
                      <span className="flex-1 text-xs font-semibold font-[family-name:var(--font-nunito)] truncate text-brand-dark">
                        {jersey != null ? `${jersey} – ` : ''}{name}
                      </span>
                    </div>
                    {assistName && (
                      <div className="flex items-center gap-2 pl-10">
                        <BootSvg />
                        <span className="text-[11px] text-[#6B7280] font-[family-name:var(--font-nunito)] truncate">
                          {assistJersey != null ? `${assistJersey} – ` : ''}{assistName}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="px-3 py-2">
                {!isHomeAction && (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="flex-1 text-xs font-semibold font-[family-name:var(--font-nunito)] truncate text-right text-red-600">{name}</span>
                    {icon}
                    <span className="text-[11px] font-[800] text-[#6B7280] font-[family-name:var(--font-barlow)] tabular-nums flex-shrink-0">{action.minute}&apos;</span>
                    {onRemove && <button onClick={() => onRemove(action.id)} className="text-[#D1D1D6] hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="w-3 h-3" /></button>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
