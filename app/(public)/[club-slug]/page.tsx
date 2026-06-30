import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import Link from 'next/link'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

function anon() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export const revalidate = 60
const RANK = ['#1', '#2', '#3']

export default async function ClubPage({ params }: { params: Promise<{ 'club-slug': string }> }) {
  const { 'club-slug': slug } = await params
  const s = anon()

  const [{ data: org }, { data: allEvents }] = await Promise.all([
    s.from('organizations').select('id, name, slogan, logo_url, primary_color').eq('id', slug).maybeSingle(),
    s.from('events').select('id, title, type, start_at, location, opponent, is_home').eq('organization_id', slug).order('start_at', { ascending: false }),
  ])

  if (!org) notFound()

  const primary = (org.primary_color as string | null) ?? '#1E5C38'
  const matchIds = (allEvents ?? []).filter(e => e.type === 'match').map(e => e.id as string)

  const { data: lastResult } = matchIds.length
    ? await s.from('match_results').select('score_home, score_away, event_id').in('event_id', matchIds).order('entered_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }

  let topScorers: { name: string | null; goals: number }[] = []
  if (matchIds.length) {
    const { data: actions } = await s.from('match_actions')
      .select('player_name').in('event_id', matchIds).eq('type', 'goal').eq('is_own_team', true)
    if (actions?.length) {
      const map = new Map<string, number>()
      for (const a of actions) {
        const name = (a.player_name as string | null) ?? 'Inconnu'
        map.set(name, (map.get(name) ?? 0) + 1)
      }
      topScorers = [...map.entries()]
        .map(([name, goals]) => ({ name, goals }))
        .sort((a, b) => b.goals - a.goals).slice(0, 3)
    }
  }

  const nextEv = [...(allEvents ?? [])].reverse().find(e => new Date(e.start_at as string) > new Date())
  const lastMatchEv = lastResult ? (allEvents ?? []).find(e => e.id === lastResult.event_id) : null
  const isHome = lastMatchEv?.is_home !== false
  const our = lastResult ? (isHome ? lastResult.score_home : lastResult.score_away) as number : null
  const their = lastResult ? (isHome ? lastResult.score_away : lastResult.score_home) as number : null
  const resultLabel = our === null ? null : our > their! ? 'Victoire' : our === their ? 'Nul' : 'Défaite'
  const resultColor = resultLabel === 'Victoire' ? '#1E5C38' : resultLabel === 'Nul' ? '#6B7280' : 'var(--color-brand-danger)'

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg`}>
      <div className="px-5 pt-10 pb-8 text-center" style={{ background: `linear-gradient(160deg, ${primary}18 0%, ${primary}06 100%)`, borderBottom: `3px solid ${primary}26` }}>
        {org.logo_url ? (
          <img src={org.logo_url as string} alt={org.name as string} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md ring-4 ring-white" />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-[800] shadow-md font-[family-name:var(--font-barlow)]" style={{ backgroundColor: primary }}>
            {(org.name as string).split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
        <h1 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">{org.name as string}</h1>
        {org.slogan && <p className="text-sm text-[#6B7280] mt-1 font-[family-name:var(--font-nunito)]">{org.slogan as string}</p>}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {lastResult && lastMatchEv && (
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 font-[family-name:var(--font-nunito)]">Dernier résultat</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">vs {(lastMatchEv.opponent as string | null) ?? 'Adversaire'}</p>
                <span className="text-xs font-bold" style={{ color: resultColor }}>{resultLabel}</span>
              </div>
              <Link href={`/match/${lastResult.event_id}`} className="text-right group">
                <p className="text-3xl font-[800] text-brand-dark tabular-nums font-[family-name:var(--font-barlow)] leading-none">{our} – {their}</p>
                <p className="text-[10px] group-hover:underline font-[family-name:var(--font-nunito)]" style={{ color: primary }}>Voir le direct →</p>
              </Link>
            </div>
          </div>
        )}

        {nextEv && (
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-1 font-[family-name:var(--font-nunito)]">Prochain événement</p>
            <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">
              {nextEv.title as string}{nextEv.opponent ? ` · vs ${nextEv.opponent as string}` : ''}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
              {new Date(nextEv.start_at as string).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
              {nextEv.location ? ` · ${nextEv.location as string}` : ''}
            </p>
          </div>
        )}

        {topScorers.length > 0 && (
          <div className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm p-4">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 font-[family-name:var(--font-nunito)]">Top buteurs</p>
            <div className="space-y-2">
              {topScorers.map((sc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#6B7280] w-6 text-center flex-shrink-0">{RANK[i]}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: primary }}>
                    {(sc.name ?? '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <p className="text-sm font-semibold text-brand-dark flex-1 truncate font-[family-name:var(--font-nunito)]">{sc.name ?? '—'}</p>
                  <p className="text-sm font-[800] tabular-nums font-[family-name:var(--font-barlow)]" style={{ color: primary }}>
                    {sc.goals} <span className="text-[10px] font-normal text-[#6B7280]">but{sc.goals !== 1 ? 's' : ''}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#6B7280] font-[family-name:var(--font-nunito)] pt-2">
          Propulsé par <span className="font-[800] text-brand-dark font-[family-name:var(--font-barlow)]">Triber</span>
        </p>
      </div>
    </main>
  )
}
