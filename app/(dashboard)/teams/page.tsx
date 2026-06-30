'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

const AVATAR_COLORS = [
  { bg: '#DBEAFE', text: '#1D4ED8' }, { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#D1FAE5', text: '#065F46' }, { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#EDE9FE', text: '#5B21B6' }, { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#CFFAFE', text: '#0E7490' }, { bg: '#FFF7ED', text: '#9A3412' },
]
function avatarColor(name: string) {
  const h = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name: string) {
  const p = name.trim().split(' ').filter(Boolean)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

type Player = { name: string; jersey: number | null; avatar_url: string | null; category: string | null }

export default function TeamsPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      s.from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) return
          s.from('organization_members')
            .select('category, jersey_number, user_id')
            .eq('organization_id', mem.organization_id)
            .then(async ({ data: rows }) => {
              const uids = (rows ?? []).map(r => r.user_id as string)
              const { data: profiles } = await s.from('profiles').select('id, full_name, avatar_url').in('id', uids)
              setPlayers(
                (rows ?? []).map(r => {
                  const p = (profiles ?? []).find(pr => pr.id === r.user_id)
                  return {
                    name: p?.full_name ?? '—',
                    jersey: r.jersey_number as number | null,
                    avatar_url: p?.avatar_url as string | null,
                    category: r.category as string | null,
                  }
                }).sort((a, b) => a.name.localeCompare(b.name))
              )
              setLoading(false)
            })
        })
    })
  }, [router])

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-6 py-8`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            Équipe
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
            {players.length} membre{players.length > 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#D1D1D6] h-36 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {players.map((p, i) => {
              const color = avatarColor(p.name)
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-4 flex flex-col items-center gap-3 text-center">
                  {/* Photo ou initiales */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xl font-[800] font-[family-name:var(--font-barlow)]"
                    style={p.avatar_url ? {} : { backgroundColor: color.bg, color: color.text }}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                      : initials(p.name)
                    }
                  </div>

                  {/* Nom */}
                  <p className="text-sm font-bold text-brand-dark leading-tight font-[family-name:var(--font-nunito)] line-clamp-2">
                    {p.name}
                  </p>

                  {/* Numéro + catégorie */}
                  <div className="flex flex-col items-center gap-1">
                    {p.jersey && (
                      <span className="text-xs font-[800] text-white bg-[#1A2332] px-2.5 py-0.5 rounded-full tabular-nums font-[family-name:var(--font-barlow)]">
                        #{p.jersey}
                      </span>
                    )}
                    {p.category && (
                      <span className="text-[10px] font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">
                        {p.category}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
