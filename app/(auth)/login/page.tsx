'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { LoginForm } from '@/components/auth/LoginForm'
import { createClient } from '@/lib/supabase/client'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

type OrgPreview = {
  name: string
  logo_url: string | null
  primary_color: string
  season: string
  wins: number
  draws: number
  losses: number
}

export default function LoginPage() {
  const [org, setOrg] = useState<OrgPreview | null>(null)

  useEffect(() => {
    // Récupère le dernier club connu (stocké à la connexion précédente)
    const cached = localStorage.getItem('triber_org_preview')
    if (cached) {
      try { setOrg(JSON.parse(cached) as OrgPreview) } catch { /* ignore */ }
    }

    // Si une session existe encore, rafraîchit les données du club
    const s = createClient()
    s.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: mem } = await s
        .from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle()
      if (!mem) return
      const { data: o } = await s
        .from('organizations').select('name, logo_url, primary_color, season').eq('id', mem.organization_id).maybeSingle()
      if (!o) return
      const { data: results } = await s
        .from('match_results').select('score_home, score_away, events!inner(organization_id, is_home)')
        .eq('events.organization_id', mem.organization_id)
      let wins = 0, draws = 0, losses = 0
      for (const r of results ?? []) {
        const ev = Array.isArray(r.events) ? r.events[0] : r.events
        const isHome = (ev as { is_home?: boolean } | null)?.is_home ?? true
        const us = isHome ? r.score_home : r.score_away
        const them = isHome ? r.score_away : r.score_home
        if (us > them) wins++; else if (us === them) draws++; else losses++
      }
      const preview: OrgPreview = {
        name: o.name as string, logo_url: o.logo_url as string | null,
        primary_color: (o.primary_color as string) || '#1E5C38',
        season: (o.season as string) || '2025-2026',
        wins, draws, losses,
      }
      localStorage.setItem('triber_org_preview', JSON.stringify(preview))
      setOrg(preview)
    })
  }, [])

  const primary = org?.primary_color ?? '#1E5C38'

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen flex`}>

      {/* ── Panneau gauche — branding club ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-10 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${primary}dd 0%, ${primary} 100%)` }}
      >
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Image src="/images/icon-triber.svg" alt="Triber" width={28} height={28} />
          </div>
          <span className="text-white text-lg font-[800] tracking-widest font-[family-name:var(--font-barlow)]">TRIBER</span>
        </div>

        <div className="relative z-10 space-y-5">
          {org?.logo_url ? (
            <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden">
              <img src={org.logo_url} alt="logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
              <span className="text-white text-2xl font-[800] font-[family-name:var(--font-barlow)]">
                {org ? org.name.slice(0, 2).toUpperCase() : 'T'}
              </span>
            </div>
          )}
          <h1 className="text-4xl font-[800] text-white uppercase tracking-tight font-[family-name:var(--font-barlow)]">
            {org?.name ?? 'Triber'}
          </h1>
          <p className="text-white/60 text-sm font-[family-name:var(--font-nunito)]">
            Saison {org?.season ?? '2025–2026'}
          </p>
          {org && (
            <div className="flex gap-8">
              {[{ v: org.wins, l: 'Victoires' }, { v: org.draws, l: 'Nuls' }, { v: org.losses, l: 'Défaites' }].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-3xl font-[800] text-white font-[family-name:var(--font-barlow)]">{v}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-[family-name:var(--font-nunito)]">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-white/30 text-xs relative z-10 font-[family-name:var(--font-nunito)]">
          La plateforme des clubs amateurs français
        </p>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex items-center justify-center bg-brand-bg px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          <div className="lg:hidden flex justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Image src="/images/icon-triber.svg" alt="Triber" width={26} height={26} />
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Bienvenue
            </h2>
            <p className="text-sm text-brand-muted mt-1 font-[family-name:var(--font-nunito)]">
              Connectez-vous à votre espace club
            </p>
          </div>

          <div className="space-y-5">
            <LoginForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-brand-bg px-3 text-brand-muted font-[family-name:var(--font-nunito)]">ou</span>
              </div>
            </div>
            <Link
              href="/register"
              className="flex items-center justify-center w-full h-12 rounded-xl border border-brand-border bg-white text-brand-dark font-semibold text-sm hover:bg-brand-sand transition-colors font-[family-name:var(--font-nunito)]"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
