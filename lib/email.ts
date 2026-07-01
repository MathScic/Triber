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

export async function sendCashReminderEmail(to: string, opts: {
  memberName: string
  templateTitle: string
  amountCents: number
  orgName: string
}) {
  const resend = getResend()
  const amountStr = (opts.amountCents / 100).toFixed(2).replace('.', ',') + ' €'
  return resend.emails.send({
    from: FROM,
    to,
    subject: `💰 Espèces à récupérer — ${opts.memberName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="color:#1A1F16;margin-bottom:8px">Rappel paiement en espèces</h2>
<p style="color:#6B7280;font-size:14px;margin-bottom:24px">${opts.orgName}</p>
<div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:16px;margin-bottom:24px">
  <p style="margin:0;font-size:16px;font-weight:bold;color:#92400E">
    ${opts.memberName} — ${amountStr}
  </p>
  <p style="margin:8px 0 0;font-size:14px;color:#92400E">
    Cotisation : ${opts.templateTitle}
  </p>
</div>
<p style="color:#374151;font-size:14px">
  Ce membre a indiqué régler sa cotisation <strong>en espèces</strong>.<br/>
  Pensez à récupérer cet argent lors du prochain RDV physique.
</p>
<p style="color:#9CA3AF;font-size:12px;margin-top:32px">— Triber · Rappel automatique</p>
</div>`,
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
