'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { Send, Megaphone, X, Trash2 } from 'lucide-react'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

type Message = { id: string; content: string; sent_at: string; profiles?: { full_name: string | null } | null }

export default function CommunicationsPage() {
  const router = useRouter()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const fetchMessages = useCallback(async (oid: string) => {
    const s = createClient()
    const { data: rows } = await s
      .from('messages').select('id, content, sent_at, sender_id')
      .eq('organization_id', oid).order('sent_at', { ascending: false }).limit(50)
    if (!rows?.length) { setMessages([]); setLoading(false); return }
    const senderIds = [...new Set(rows.map(r => r.sender_id as string).filter(Boolean))]
    const { data: profiles } = await s.from('profiles').select('id, full_name').in('id', senderIds)
    setMessages(rows.map(r => ({
      id: r.id as string, content: r.content as string, sent_at: r.sent_at as string,
      profiles: (profiles ?? []).find(p => p.id === r.sender_id) ?? null,
    })))
    setLoading(false)
  }, [])

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      s.from('organization_members').select('organization_id, role').eq('user_id', user.id).maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) return
          const oid = mem.organization_id as string
          setOrgId(oid)
          setIsAdmin(mem.role === 'admin' || mem.role === 'member_active')
          void fetchMessages(oid)
        })
    })
  }, [router, fetchMessages])

  const sendMessage = async () => {
    if (!content.trim() || !orgId) return
    setSending(true)
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    await s.from('messages').insert({ organization_id: orgId, sender_id: user?.id, content: content.trim() })
    setContent(''); setShowForm(false)
    await fetchMessages(orgId)
    setSending(false)
  }

  const deleteMessage = async (id: string) => {
    setDeletingId(id)
    await createClient().from('messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
    setDeletingId(null)
    setConfirmId(null)
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-brand-bg px-6 py-8`}>
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-[800] text-brand-dark uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Communications
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">Annonces du club</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 h-10 px-4 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors font-[family-name:var(--font-nunito)]">
              <Megaphone className="w-4 h-4" /> Nouvelle annonce
            </button>
          )}
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Nouvelle annonce</p>
              <button onClick={() => { setShowForm(false); setContent('') }}>
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
              placeholder="Votre message pour tous les membres du club…"
              className="w-full px-3 py-2.5 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success resize-none font-[family-name:var(--font-nunito)]" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">{content.length} / 500</span>
              <button onClick={() => void sendMessage()} disabled={!content.trim() || sending}
                className="flex items-center gap-2 h-10 px-5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-[#d4571f] transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
                <Send className="w-4 h-4" /> {sending ? 'Envoi…' : 'Envoyer à tous'}
              </button>
            </div>
          </div>
        )}

        {loading && <div className="h-48 bg-white rounded-2xl border border-[#D1D1D6] animate-pulse" />}

        {!loading && messages.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <p className="text-sm font-bold text-brand-dark font-[family-name:var(--font-nunito)]">Aucune annonce</p>
            <p className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)]">
              {isAdmin ? 'Publiez votre première annonce.' : 'Aucune annonce pour le moment.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-[#D1D1D6] shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {(m.profiles?.full_name ?? 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-brand-dark font-[family-name:var(--font-nunito)]">
                      {m.profiles?.full_name ?? 'Admin'}
                    </span>
                    <span className="text-xs text-[#9CA3AF] font-[family-name:var(--font-nunito)] ml-2">
                      {fmtDate(m.sent_at)}
                    </span>
                  </div>
                </div>

                {isAdmin && confirmId !== m.id && (
                  <button
                    onClick={() => setConfirmId(m.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors group/del">
                    <Trash2 className="w-3.5 h-3.5 text-[#D1D1D6] group-hover/del:text-red-500 transition-colors" />
                  </button>
                )}
              </div>

              <p className="text-sm text-brand-dark leading-relaxed font-[family-name:var(--font-nunito)] mt-3">
                {m.content}
              </p>

              {/* Confirmation inline */}
              {confirmId === m.id && (
                <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <p className="text-xs font-semibold text-red-600 font-[family-name:var(--font-nunito)]">
                    Supprimer cette annonce ?
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setConfirmId(null)}
                      className="text-xs font-semibold text-[#6B7280] hover:text-brand-dark transition-colors font-[family-name:var(--font-nunito)] px-3 py-1">
                      Annuler
                    </button>
                    <button onClick={() => void deleteMessage(m.id)} disabled={deletingId === m.id}
                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors rounded-lg px-3 py-1.5 disabled:opacity-50 font-[family-name:var(--font-nunito)]">
                      {deletingId === m.id ? '…' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
