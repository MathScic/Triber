import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Wrapper debug : log la réponse complète de Resend et expose l'erreur si présente
async function sendEmail(payload: Parameters<typeof resend.emails.send>[0]): Promise<string | null> {
  const result = await resend.emails.send(payload)
  console.log('RESEND RESPONSE:', JSON.stringify(result, null, 2))
  if (result.error) {
    console.error('RESEND ERROR:', result.error)
    return JSON.stringify(result.error)
  }
  return null
}

async function sendOnboardingEmail(to: string, orgName: string) {
  return sendEmail({
    from: 'Triber <noreply@triber-app.fr>',
    to,
    subject: `Invitation à rejoindre ${orgName} sur Triber`,
    html: `<p>Bonjour,</p>
      <p>Vous avez été invité(e) à rejoindre <strong>${orgName}</strong> sur Triber.</p>
      <p>Pour nous rejoindre :</p>
      <ol>
        <li>Téléchargez l'app Triber</li>
        <li>Créez votre compte avec cette adresse email</li>
        <li>Une fois connecté(e), allez dans <strong>Profil &gt; Mon code</strong></li>
        <li>Communiquez ce code à votre administrateur</li>
      </ol>
      <p>À bientôt sur Triber !</p>`,
  })
}

async function sendCodeEmail(to: string, orgName: string, inviteCode: string) {
  return sendEmail({
    from: 'Triber <noreply@triber-app.fr>',
    to,
    subject: `Invitation à rejoindre ${orgName} sur Triber`,
    html: `<p>Bonjour,</p>
      <p>Vous avez été invité(e) à rejoindre <strong>${orgName}</strong> sur Triber.</p>
      <p>Votre code d'accès : <strong style="font-size:22px;letter-spacing:4px">${inviteCode}</strong></p>
      <p>Communiquez ce code à votre administrateur dans l'app Triber.</p>
      <p>À bientôt sur Triber !</p>`,
  })
}

export async function POST(request: Request) {
  const body = await request.json() as { contact?: string; orgName?: string; orgId?: string }
  const { contact, orgName, orgId } = body

  if (!contact?.trim() || !orgName || !orgId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (!contact.includes('@')) {
    return NextResponse.json({ success: true, contact, method: 'sms' })
  }

  const admin = getAdmin()

  const { data: list } = await admin.auth.admin.listUsers()
  const found = list?.users.find(u => u.email?.toLowerCase() === contact.trim().toLowerCase())

  let resendError: string | null = null

  if (!found) {
    resendError = await sendOnboardingEmail(contact, orgName)
  } else {
    const { data: profile } = await admin.from('profiles').select('invite_code').eq('id', found.id).maybeSingle()
    const inviteCode = profile?.invite_code as string | undefined
    resendError = inviteCode
      ? await sendCodeEmail(contact, orgName, inviteCode)
      : await sendOnboardingEmail(contact, orgName)
  }

  if (resendError) {
    return NextResponse.json({ success: false, error: `Resend: ${resendError}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, contact, method: 'email' })
}
