'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button
      onClick={() => void logout()}
      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-[family-name:var(--font-nunito)]"
    >
      <LogOut className="w-4 h-4" />
      Déconnexion
    </button>
  )
}
