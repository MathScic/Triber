'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAnnouncements } from '@/lib/hooks/useAnnouncements'

interface Props { organizationId: string; canCreate: boolean; currentUserId: string }

export function AnnouncementSection({ organizationId, canCreate, currentUserId }: Props) {
  const { announcements, loading, fetchAnnouncements, createAnnouncement, deleteAnnouncement } = useAnnouncements(organizationId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { void fetchAnnouncements() }, [fetchAnnouncements])

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) return
    setSaving(true)
    const ok = await createAnnouncement(title.trim(), message.trim())
    if (ok) { setTitle(''); setMessage(''); setShowForm(false) }
    setSaving(false)
  }

  if (loading) return <div className="bg-white rounded-xl border border-brand-border h-28 animate-pulse" />

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm p-4 h-full min-h-[260px]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-[family-name:var(--font-nunito)]">Annonces</p>
        {canCreate && <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold text-success hover:underline font-[family-name:var(--font-nunito)]">+ Publier</button>}
      </div>

      {showForm && (
        <div className="space-y-2 mb-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre"
            className="w-full h-9 rounded-xl border border-brand-border px-3 text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message…" rows={2}
            className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm bg-brand-bg focus:outline-none focus:border-success resize-none font-[family-name:var(--font-nunito)]" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving || !title.trim() || !message.trim()}
              className="flex-1 h-9 rounded-xl bg-success text-white text-sm font-bold disabled:opacity-50 hover:bg-success/90 transition-colors font-[family-name:var(--font-nunito)]">
              {saving ? '…' : 'Publier'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 h-9 rounded-xl text-sm text-brand-muted hover:bg-brand-bg font-[family-name:var(--font-nunito)]">Annuler</button>
          </div>
        </div>
      )}

      {announcements.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center">
            <Bell className="w-5 h-5 text-brand-muted/50" />
          </div>
          <p className="text-sm font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">Aucune annonce</p>
          {canCreate && <p className="text-xs text-brand-muted font-[family-name:var(--font-nunito)]">Publiez la première annonce du club</p>}
        </div>
      )}

      <div className="space-y-2">
        {announcements.slice(0, 3).map(a => {
          const isOpen = expanded === a.id
          const date = new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          return (
            <div key={a.id} className="border border-brand-sand rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)} className="w-full p-3 flex items-start justify-between gap-3 text-left">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-brand-dark truncate font-[family-name:var(--font-barlow)] uppercase tracking-tight">{a.title}</p>
                  <p className="text-xs text-brand-muted mt-0.5 font-[family-name:var(--font-nunito)]">{a.profiles?.full_name ?? 'Équipe'} · {date}</p>
                </div>
                <span className="text-brand-muted text-xs flex-shrink-0 mt-0.5">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-sm text-brand-dark leading-relaxed font-[family-name:var(--font-nunito)] whitespace-pre-wrap">{a.message}</p>
                  {a.author_id === currentUserId && (
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-xs text-red-600 hover:underline font-[family-name:var(--font-nunito)]">Supprimer</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
