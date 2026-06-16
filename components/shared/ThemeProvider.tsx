'use client'

import { useEffect } from 'react'
import { useBranding } from '@/lib/hooks/useBranding'
import { injectTheme } from '@/lib/utils/theme'

interface Props {
  children: React.ReactNode
}

// Charge les couleurs de l'organisation au montage et les applique via injectTheme
export function ThemeProvider({ children }: Props) {
  const { getBranding } = useBranding()

  useEffect(() => {
    console.log('ThemeProvider monté — chargement du branding...')
    getBranding().then(branding => {
      if (!branding) { console.log('ThemeProvider — branding null, couleurs par défaut'); return }
      console.log('ThemeProvider - couleurs:', branding.primary_color, branding.secondary_color)
      injectTheme(branding.primary_color, branding.secondary_color)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
