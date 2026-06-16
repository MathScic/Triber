import { describe, it, expect, beforeEach } from 'vitest'
import { injectTheme } from '@/lib/utils/theme'

beforeEach(() => {
  // Réinitialise le DOM entre chaque test
  document.head.innerHTML = ''
})

describe('injectTheme', () => {
  it('crée un style tag avec l\'id triber-theme', () => {
    injectTheme('#2A9D4E', '#E8622A')
    const el = document.getElementById('triber-theme')
    expect(el).not.toBeNull()
    expect(el?.tagName.toLowerCase()).toBe('style')
  })

  it('le style contient la couleur primaire', () => {
    injectTheme('#2A9D4E', '#E8622A')
    const el = document.getElementById('triber-theme')
    expect(el?.textContent).toContain('#2A9D4E')
  })

  it('réutilise le même style tag si appelé deux fois', () => {
    injectTheme('#2A9D4E', '#E8622A')
    injectTheme('#FF0000', '#00FF00')
    const els = document.querySelectorAll('#triber-theme')
    expect(els.length).toBe(1)
    expect(els[0].textContent).toContain('#FF0000')
  })

  it('le style contient la classe btn-primary', () => {
    injectTheme('#2A9D4E', '#E8622A')
    const el = document.getElementById('triber-theme')
    expect(el?.textContent).toContain('.btn-primary')
  })
})
