'use client'

import { createContext, useContext } from 'react'

interface BrandingCtx {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

export const BrandingContext = createContext<BrandingCtx>({
  primaryColor: '#1E5C38',
  setPrimaryColor: () => {},
})

export const useBrandingContext = () => useContext(BrandingContext)
