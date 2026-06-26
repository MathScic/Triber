'use client'

import { useEffect, useState } from 'react'
import { useBranding } from '@/lib/hooks/useBranding'
import { injectTheme } from '@/lib/utils/theme'
import { BrandingContext } from '@/lib/contexts/BrandingContext'

function darkenHex(hex: string, factor = 0.32): string {
  const c = (hex ?? '#2A9D4E').replace('#', '')
  const r = Math.round(parseInt(c.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(c.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(c.slice(4, 6), 16) * factor)
  return `rgb(${r},${g},${b})`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { getBranding } = useBranding()
  const [primaryColor, setPrimaryColor] = useState('#2A9D4E')

  useEffect(() => {
    getBranding().then(b => {
      if (!b) return
      setPrimaryColor(b.primary_color)
      injectTheme(b.primary_color, b.secondary_color)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BrandingContext.Provider value={{
      primaryColor,
      sidebarBg: darkenHex(primaryColor),
      setPrimaryColor,
    }}>
      {children}
    </BrandingContext.Provider>
  )
}
