'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { MediaItem } from '@/lib/hooks/useMedia'

interface Props {
  items: MediaItem[]
  canDelete: boolean
  onDelete: (id: string) => void
}

export function MediaGallery({ items, canDelete, onDelete }: Props) {
  const [open, setOpen] = useState<MediaItem | null>(null)

  if (!items.length) return (
    <div className="text-center py-16 text-[#6B7280] text-sm font-[family-name:var(--font-nunito)]">
      Aucune photo pour le moment. Ajoutez la première photo du club.
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map(item => (
          <div
            key={item.id}
            className="relative group aspect-square rounded-xl overflow-hidden bg-[#E8E8EA] cursor-pointer"
            onClick={() => setOpen(item)}
          >
            <img
              src={item.url}
              alt={item.caption ?? ''}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {canDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] font-[family-name:var(--font-nunito)] truncate">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img
            src={open.url}
            alt={open.caption ?? ''}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          {open.caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm px-4 font-[family-name:var(--font-nunito)]">
              {open.caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}
