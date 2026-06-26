export function BallIcon({ active }: { active: boolean }) {
  const c = active ? '#ffffff' : '#6B7280'
  const shade = active ? 'rgba(0,0,0,0.28)' : '#D1D1D6'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={c} stroke={shade} strokeWidth="1.5"/>
      <polygon points="12,5.5 16.5,8.5 15,14 9,14 7.5,8.5" fill={shade}/>
      <line x1="12" y1="2" x2="12" y2="5.5" stroke={shade} strokeWidth="1.2"/>
      <line x1="20.5" y1="8" x2="16.5" y2="8.5" stroke={shade} strokeWidth="1.2"/>
      <line x1="18.5" y1="18.5" x2="15" y2="14" stroke={shade} strokeWidth="1.2"/>
      <line x1="5.5" y1="18.5" x2="9" y2="14" stroke={shade} strokeWidth="1.2"/>
      <line x1="3.5" y1="8" x2="7.5" y2="8.5" stroke={shade} strokeWidth="1.2"/>
    </svg>
  )
}

export function BallSvg({ color }: { color: string }) {
  const s = 'rgba(255,255,255,0.78)'
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" fill={color}/>
      <polygon points="12,5.5 16.5,8.5 15,14 9,14 7.5,8.5" fill={s}/>
      <line x1="12" y1="2" x2="12" y2="5.5" stroke={s} strokeWidth="1.2"/>
      <line x1="20.5" y1="8" x2="16.5" y2="8.5" stroke={s} strokeWidth="1.2"/>
      <line x1="18.5" y1="18.5" x2="15" y2="14" stroke={s} strokeWidth="1.2"/>
      <line x1="5.5" y1="18.5" x2="9" y2="14" stroke={s} strokeWidth="1.2"/>
      <line x1="3.5" y1="8" x2="7.5" y2="8.5" stroke={s} strokeWidth="1.2"/>
    </svg>
  )
}

export function CardRect({ color, active }: { color: 'yellow' | 'red'; active?: boolean }) {
  if (active !== undefined) {
    const bg = color === 'yellow' ? (active ? '#FBBF24' : '#FDE68A') : (active ? '#DC2626' : '#FCA5A5')
    return <span className="inline-block w-4 h-5 rounded-[3px] flex-shrink-0" style={{ backgroundColor: bg }} />
  }
  return <span className={`inline-block w-2.5 h-4 rounded-[2px] flex-shrink-0 ${color === 'yellow' ? 'bg-yellow-400' : 'bg-red-600'}`} />
}
