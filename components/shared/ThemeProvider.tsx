'use client'

import { useEffect, useState } from 'react'
import { useBranding } from '@/lib/hooks/useBranding'
import { injectTheme } from '@/lib/utils/theme'
import { BrandingContext } from '@/lib/contexts/BrandingContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { getBranding } = useBranding()
  const [primaryColor, setPrimaryColor] = useState('#1E5C38')

  useEffect(() => {
    getBranding().then(b => {
      if (!b) return
      setPrimaryColor(b.primary_color)
      injectTheme(b.primary_color, b.secondary_color)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BrandingContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </BrandingContext.Provider>
  )
}
