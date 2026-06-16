// Détecte si une couleur hex est claire (luminosité > 128)
export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

export function injectTheme(primary: string, secondary: string) {
  let el = document.getElementById('triber-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'triber-theme'
    document.head.appendChild(el)
  }
  el.textContent = `
    .btn-primary {
      background-color: ${primary} !important;
      color: white !important;
      border-color: ${primary} !important;
    }
    .btn-primary:hover {
      background-color: ${primary}cc !important;
    }
    .text-brand { color: ${primary} !important; }
    .bg-brand { background-color: ${primary} !important; }
    .border-brand { border-color: ${primary} !important; }
  `
  console.log('✅ Theme injecté:', primary, secondary)
}
