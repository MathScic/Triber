export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function darken(hex: string): string {
  const c = hex.replace('#', '')
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - 20)
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - 20)
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - 20)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Convertit hex → format HSL shadcn (ex: "142 76% 36%")
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function injectTheme(primary: string, secondary: string) {
  let el = document.getElementById('triber-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'triber-theme'
    document.head.appendChild(el)
  }

  const p = primary
  const pLight = `${p}28`
  const pDark = darken(p)
  const isLight = isLightColor(p)

  el.textContent = `
    :root {
      --triber-primary: ${p};
      --triber-secondary: ${secondary};
      --triber-primary-light: ${pLight};
      --primary: ${hexToHsl(p)};
      --primary-foreground: ${isLight ? '0 0% 0%' : '0 0% 100%'};
    }

    .bg-\\[\\#2A9D4E\\] { background-color: ${p} !important; }
    .bg-\\[\\#E8F5EE\\], .bg-\\[\\#E8F5EEF\\] { background-color: ${pLight} !important; }
    .from-\\[\\#2A9D4E\\] { --tw-gradient-from: ${p} !important; }
    .hover\\:bg-\\[\\#238742\\]:hover { background-color: ${pDark} !important; }
    .hover\\:bg-\\[\\#2A9D4E\\]:hover { background-color: ${p} !important; }
    .text-\\[\\#2A9D4E\\] { color: ${p} !important; }
    .border-\\[\\#2A9D4E\\] { border-color: ${p} !important; }
    .focus\\:border-\\[\\#2A9D4E\\]:focus { border-color: ${p} !important; }
    .focus\\:ring-\\[\\#2A9D4E\\]:focus { --tw-ring-color: ${p} !important; }
    .accent-\\[\\#2A9D4E\\] { accent-color: ${p} !important; }
    .ring-\\[\\#2A9D4E\\] { --tw-ring-color: ${p} !important; }

  `
}
