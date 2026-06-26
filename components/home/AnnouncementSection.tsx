'use client'

import { useEffect, useState } from 'react'
import { useAnnouncements } from '@/lib/hooks/useAnnouncements'

interface Props {
  organizationId: string
  canCreate: boolean
  currentUserId: string
}

export function AnnouncementSection({ organizationId, canCreate, currentUserId }: Props) {
  const { announcements, loading, fetchAnnouncements, createAnnouncement, deleteAnnouncement } = useAnnouncements(organizationId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetchAnnouncements() }, [organizationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) return
    setSaving(true)
    const ok = await createAnnouncement(title.trim(), message.trim())
    if (ok) { setTitle(''); setMessage(''); setShowForm(false) }
    setSaving(false)
  }

  if (loading) return <div className="h-16 bg-white rounded-xl border border-[#D1D1D6] animate-pulse" />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest font-[family-name:var(--font-nunito)]">Annonces</p>
        {canCreate && (
          <button onClick={() => setShowForm(v => !v)}
            className="text-xs font-semibold text-[#2A9D4E] hover:underline font-[family-name:var(--font-nunito)]">
            + Publier
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#D1D1D6] p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de l'annonce"
            className="w-full h-10 rounded-xl border border-[#D1D1D6] px-3 text-sm text-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#2A9D4E]" />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message…" rows={3}
            className="w-full rounded-xl border border-[#D1D1D6] px-3 py-2 text-sm text-[#1A1F16] focus:outline-none focus:ring-2 focus:ring-[#2A9D4E] resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving || !title.trim() || !message.trim()}
              className="flex-1 h-10 rounded-xl bg-[#2A9D4E] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#238742] transition-colors">
              {saving ? '…' : 'Publier'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 h-10 rounded-xl text-sm text-[#6B7280] hover:bg-[#E8E8EA] transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {announcements.length === 0 && !showForm && (
        <p className="text-sm text-[#6B7280] text-center py-4 font-[family-name:var(--font-nunito)]">
          Aucune annonce pour l'instant.
        </p>
      )}

      {announcements.map(a => {
        const isOpen = expanded === a.id
        const date = new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        const isAuthor = a.author_id === currentUserId
        return (
          <div key={a.id} className="bg-white rounded-xl border border-[#D1D1D6] shadow-sm">
            <button onClick={() => setExpanded(isOpen ? null : a.id)}
              className="w-full p-4 flex items-start justify-between gap-3 text-left">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#1A1F16] truncate font-[family-name:var(--font-barlow)] uppercase tracking-tight">{a.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
                  {a.profiles?.full_name ?? 'Équipe'} · {date}
                </p>
              </div>
              <span className="text-[#6B7280] text-xs flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                <p className="text-sm text-[#1A1F16] leading-relaxed font-[family-name:var(--font-nunito)] whitespace-pre-wrap">{a.message}</p>
                {isAuthor && (
                  <button onClick={() => deleteAnnouncement(a.id)}
                    className="text-xs text-red-600 hover:underline font-[family-name:var(--font-nunito)]">
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
