'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAnnouncements } from '@/lib/hooks/useAnnouncements'
import { Megaphone, X, Trash2 } from 'lucide-react'

export default function CommunicationsPage() {
  const router = useRouter()
  const [orgId, setOrgId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [ready, setReady] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return; fetched.current = true
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      s.from('organization_members').select('organization_id, role').eq('user_id', user.id).maybeSingle()
        .then(({ data: m }) => { if (m) { setOrgId(m.organization_id as string); setIsAdmin(m.role === 'admin' || m.role === 'member_active') }; setReady(true) })
    })
  }, [router])

  const { announcements, loading, createAnnouncement, deleteAnnouncement, fetchAnnouncements } = useAnnouncements(orgId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (orgId) void fetchAnnouncements() }, [orgId, fetchAnnouncements])

  const submit = async () => {
    if (!title.trim() || !message.trim()) return; setSaving(true)
    const ok = await createAnnouncement(title.trim(), message.trim())
    if (ok) { setTitle(''); setMessage(''); setShowForm(false) }
    setSaving(false)
  }

  if (!ready) return <div className="min-h-screen bg-brand-bg" />

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8">
      <div className="max-w-3xl lg:max-w-[90%] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">Communications</h1>
            <p className="text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Annonces du club</p>
          </div>
          {isAdmin && <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 h-10 px-4 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 font-[family-name:var(--font-nunito)]"><Megaphone className="w-4 h-4" /> Nouvelle annonce</button>}
        </div>

        {showForm && isAdmin && (
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Nouvelle annonce</p>
              <button onClick={() => { setShowForm(false); setTitle(''); setMessage('') }}><X className="w-4 h-4 text-brand-muted" /></button>
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" className="w-full h-10 rounded-xl border border-brand-border px-3 text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message pour tous les membres…" rows={3} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm bg-brand-bg focus:outline-none focus:border-success resize-none font-[family-name:var(--font-nunito)]" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setTitle(''); setMessage('') }} className="h-10 px-4 text-sm text-brand-muted font-[family-name:var(--font-nunito)]">Annuler</button>
              <button onClick={() => void submit()} disabled={saving || !title.trim() || !message.trim()} className="h-10 px-5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 disabled:opacity-50 font-[family-name:var(--font-nunito)]">{saving ? '…' : 'Publier'}</button>
            </div>
          </div>
        )}

        {loading && <div className="h-48 bg-white rounded-2xl border border-brand-border animate-pulse" />}
        {!loading && announcements.length === 0 && (
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center"><Megaphone className="w-5 h-5 text-brand-muted" /></div>
            <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Aucune annonce</p>
            <p className="text-xs text-brand-muted font-[family-name:var(--font-nunito)]">{isAdmin ? 'Publiez votre première annonce.' : 'Aucune annonce pour le moment.'}</p>
          </div>
        )}

        <div className="space-y-3">
          {announcements.map(a => {
            const date = new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-tight">{a.title}</p>
                    <p className="text-xs text-brand-muted mt-0.5 font-[family-name:var(--font-nunito)]">{a.profiles?.full_name ?? 'Admin'} · {date}</p>
                  </div>
                  {isAdmin && a.author_id === userId && <button onClick={() => void deleteAnnouncement(a.id)}><Trash2 className="w-4 h-4 text-brand-muted hover:text-red-500 transition-colors" /></button>}
                </div>
                <p className="text-sm text-brand-dark leading-relaxed font-[family-name:var(--font-nunito)] whitespace-pre-wrap">{a.message}</p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
