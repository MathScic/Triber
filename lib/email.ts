import { Resend } from 'resend'
import { render } from '@react-email/components'
import InviteMemberEmail from '@/emails/invite-member'
import WelcomeEmail from '@/emails/welcome'
import PaymentReminderEmail from '@/emails/payment-reminder'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY manquante')
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'Triber <noreply@triber-app.fr>'

export async function sendInviteEmail(to: string, opts: {
  orgName: string
  inviterName: string
  inviteUrl: string
  primaryColor?: string
}) {
  const resend = getResend()
  const html = await render(InviteMemberEmail(opts))
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Invitation à rejoindre ${opts.orgName} sur Triber`,
    html,
  })
}

export async function sendPaymentReminderEmail(to: string, opts: {
  memberName: string
  orgName: string
  templateTitle: string
  paidCents: number
  expectedCents: number
  primaryColor?: string
}) {
  const resend = getResend()
  const html = await render(PaymentReminderEmail(opts))
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Rappel cotisation — ${opts.templateTitle}`,
    html,
  })
}

export async function sendWelcomeEmail(to: string, opts: {
  userName: string
  confirmUrl: string
}) {
  const resend = getResend()
  const html = await render(WelcomeEmail(opts))
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Confirmez votre adresse email — Triber',
    html,
  })
}
