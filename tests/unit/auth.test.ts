import { describe, it, expect } from 'vitest'
import { isLightColor } from '@/lib/utils/theme'

describe('isLightColor', () => {
  it('blanc (#FFFFFF) est une couleur claire', () => {
    expect(isLightColor('#FFFFFF')).toBe(true)
  })

  it('noir (#000000) est une couleur sombre', () => {
    expect(isLightColor('#000000')).toBe(false)
  })

  it('vert Triber (#2A9D4E) est une couleur sombre', () => {
    expect(isLightColor('#2A9D4E')).toBe(false)
  })

  it('orange Triber (#E8622A) est perçu comme clair par la formule YIQ', () => {
    // Luminosité YIQ = 131 > 128 → claire (texte sombre recommandé)
    expect(isLightColor('#E8622A')).toBe(true)
  })

  it('jaune clair est une couleur claire', () => {
    expect(isLightColor('#FFFF00')).toBe(true)
  })
})
