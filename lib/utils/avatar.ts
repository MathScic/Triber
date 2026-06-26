const AVATAR_COLORS = [
  { bg: '#DBEAFE', text: '#1D4ED8' }, { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#D1FAE5', text: '#065F46' }, { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#EDE9FE', text: '#5B21B6' }, { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#CFFAFE', text: '#0E7490' }, { bg: '#FFF7ED', text: '#9A3412' },
]

export function avatarColor(name: string) {
  const h = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function initials(name: string) {
  const p = name.trim().split(' ').filter(Boolean)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}
