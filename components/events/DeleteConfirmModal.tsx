'use client'

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  eventTitle: string
}

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel, eventTitle }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-[#1A1F16] text-base">
          Supprimer cet événement ?
        </h3>
        <p className="text-sm text-[#7A8070]">
          <span className="font-semibold text-[#1A1F16]">&ldquo;{eventTitle}&rdquo;</span>
          {' '}sera définitivement supprimé.
          <br />Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-[#DDD8CE] text-sm font-semibold text-[#1A1F16] hover:bg-[#F0EBE1] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-[#E8622A] text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
