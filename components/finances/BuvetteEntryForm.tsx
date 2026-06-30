'use client'

import { useState, useRef } from 'react'
import { Camera, AlertCircle, ChevronRight, X } from 'lucide-react'
import { useTreasury } from '@/lib/hooks/useTreasury'

interface Props {
  orgId: string
  templateId: string
  onClose: () => void
  onSaved: () => void
}

export function BuvetteEntryForm({ orgId, templateId, onClose, onSaved }: Props) {
  const [declared, setDeclared] = useState('')
  const [ticket, setTicket] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { add, uploadPhoto } = useTreasury()

  const declaredCents = Math.round(parseFloat(declared || '0') * 100)
  const ticketCents = ticket ? Math.round(parseFloat(ticket) * 100) : null
  const ecart = ticketCents !== null ? ticketCents - declaredCents : null
  const isFlagged = ecart !== null && ecart !== 0

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const submit = async () => {
    if (declaredCents <= 0) return
    setSaving(true)
    let photoUrl: string | null = null
    if (photoFile) photoUrl = await uploadPhoto(photoFile, orgId)
    const ok = await add(orgId, templateId, {
      amount_declared_cents: declaredCents,
      amount_ticket_cents: ticketCents,
      photo_url: photoUrl,
      entry_date: date,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (ok) { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="relative flex items-center justify-center px-5 py-4 border-b border-[#F4F4F6]">
          <div className="text-center">
            <p className="text-base font-[800] text-brand-dark font-[family-name:var(--font-barlow)] uppercase tracking-tight">
              Nouvelle entrée buvette
            </p>
            <p className="text-xs text-[#6B7280] font-[family-name:var(--font-nunito)] mt-0.5">Vérification du ticket</p>
          </div>
          <button onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl hover:bg-brand-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Montant déclaré — grand input */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Montant déclaré *</label>
            <div className={`mt-1.5 flex items-center border-2 rounded-2xl bg-white h-16 overflow-hidden transition-colors ${declaredCents > 0 ? 'border-success' : 'border-[#D1D1D6]'} focus-within:border-success`}>
              <span className="pl-4 text-xl font-bold text-[#6B7280]">€</span>
              <input
                type="number" min="0" step="0.01" value={declared}
                onChange={e => setDeclared(e.target.value)}
                placeholder="0"
                className="flex-1 h-full px-3 bg-transparent text-3xl font-[800] text-brand-dark focus:outline-none font-[family-name:var(--font-barlow)] tabular-nums"
              />
              <span className="pr-4 text-xl font-bold text-[#6B7280]">€</span>
            </div>
          </div>

          {/* Montant sur le ticket */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Montant sur le ticket</label>
            <div className={`mt-1.5 flex items-center border-2 rounded-2xl bg-white h-12 overflow-hidden transition-colors ${ticketCents !== null && ticketCents > 0 ? 'border-success' : 'border-[#D1D1D6]'} focus-within:border-success`}>
              <span className="pl-4 text-base font-bold text-[#6B7280]">€</span>
              <input
                type="number" min="0" step="0.01" value={ticket}
                onChange={e => setTicket(e.target.value)}
                placeholder="0"
                className="flex-1 h-full px-3 bg-transparent text-lg font-bold text-brand-dark focus:outline-none font-[family-name:var(--font-nunito)] tabular-nums"
              />
              <span className="pr-4 text-base font-bold text-[#6B7280]">€</span>
            </div>
          </div>

          {/* Alerte écart */}
          {isFlagged && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
              <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-secondary font-[family-name:var(--font-nunito)]">
                Écart détecté : {Math.abs(ecart! / 100).toFixed(2)} € {ecart! < 0 ? 'manquants' : 'en surplus'} — le président sera notifié.
              </p>
            </div>
          )}

          {/* Photo du ticket */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Photo du ticket</label>
            <div className="mt-1.5 border-2 border-[#D1D1D6] rounded-2xl overflow-hidden">
              {photoPreview ? (
                <div className="flex items-center gap-3 p-3">
                  <img src={photoPreview} alt="Ticket" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-success transition-colors font-[family-name:var(--font-nunito)]">
                      <Camera className="w-4 h-4" />
                      Changer la photo
                    </button>
                    <p className="text-[10px] text-[#6B7280] mt-1 font-[family-name:var(--font-nunito)]">JPG, PNG · Max 5 Mo</p>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-7 text-[#6B7280] hover:bg-brand-bg transition-colors">
                  <Camera className="w-7 h-7" />
                  <p className="text-sm font-semibold font-[family-name:var(--font-nunito)]">Prendre ou choisir une photo</p>
                  <p className="text-[10px] font-[family-name:var(--font-nunito)]">JPG, PNG · Max 5 Mo</p>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickPhoto} />
          </div>

          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Date de l'entrée</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] font-[family-name:var(--font-nunito)]">Note (optionnelle)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} maxLength={200}
                placeholder="Ajouter une note…"
                className="mt-1.5 w-full h-10 px-3 rounded-xl border border-[#D1D1D6] text-sm bg-brand-bg focus:outline-none focus:border-success font-[family-name:var(--font-nunito)]" />
            </div>
          </div>

          {/* Bouton */}
          <button onClick={() => void submit()} disabled={declaredCents <= 0 || saving}
            className="w-full flex items-center justify-center gap-2 h-12 bg-secondary text-white text-sm font-semibold rounded-2xl hover:bg-[#d4571f] transition-colors disabled:opacity-50 font-[family-name:var(--font-nunito)]">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
