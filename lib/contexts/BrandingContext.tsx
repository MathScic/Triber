'use client'

import { createContext, useContext } from 'react'

interface BrandingCtx {
  primaryColor: string
  sidebarBg: string
  setPrimaryColor: (color: string) => void
}

export const BrandingContext = createContext<BrandingCtx>({
  primaryColor: '#2A9D4E',
  sidebarBg: 'rgb(13,50,25)',
  setPrimaryColor: () => {},
})

export const useBrandingContext = () => useContext(BrandingContext)
