import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Échange le code PKCE Supabase contre une session, puis redirige vers `next`
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (!code) return NextResponse.redirect(`${origin}/login`)

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login`)

  // Enregistre le nom saisi lors de l'inscription dans la table profiles
  const fullName = (data.user?.user_metadata?.full_name as string) ?? null
  if (fullName && data.user?.id) {
    await supabase.from('profiles').upsert(
      { id: data.user.id, full_name: fullName, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
  }

  return NextResponse.redirect(`${origin}${next}`)
}
