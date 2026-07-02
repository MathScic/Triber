import { NextResponse } from 'next/server'

// Rate-limiting best-effort en mémoire, par instance serveur. Sur Vercel
// (serverless), chaque instance a sa propre mémoire : protection partielle,
// pas une garantie distribuée entre instances froides. Sur le déploiement
// Docker (process long-lived, cf. CLAUDE.md §4), la map grossirait sans
// limite sans purge — voir sweepExpired(). Pour un vrai rate-limit
// distribué, migrer vers Upstash Redis (@upstash/ratelimit).
const hits = new Map<string, { count: number; resetAt: number }>()

// Purge les entrées expirées — déclenchée occasionnellement plutôt qu'à
// chaque appel pour rester bon marché sur le chemin chaud
function sweepExpired() {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key)
  }
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  if (hits.size > 500) sweepExpired()

  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  entry.count += 1
  return entry.count > limit
}

// Réponse 429 prête à l'emploi si la limite est dépassée, sinon null
export function rateLimitResponse(key: string, limit: number, windowMs: number): NextResponse | null {
  if (!isRateLimited(key, limit, windowMs)) return null
  return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard.' }, { status: 429 })
}

// Adresse IP de l'appelant, telle que transmise par le proxy Vercel
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
