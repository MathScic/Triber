import { Html, Head, Body, Container, Section, Text, Button, Hr } from '@react-email/components'

interface Props {
  memberName: string
  orgName: string
  templateTitle: string
  paidCents: number
  expectedCents: number
  primaryColor?: string
}

export default function PaymentReminderEmail({ memberName, orgName, templateTitle, paidCents, expectedCents, primaryColor = '#2A9D4E' }: Props) {
  const remaining = expectedCents - paidCents
  const isPending = paidCents === 0
  return (
    <Html lang="fr">
      <Head />
      <Body style={{ backgroundColor: '#F4F4F6', fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: 520, margin: '0 auto', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #D1D1D6' }}>
          <Section style={{ backgroundColor: primaryColor, padding: '28px 32px' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              {orgName}
            </Text>
          </Section>
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#1A1F16', margin: '0 0 8px' }}>
              Rappel de cotisation — {memberName}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px' }}>
              {isPending
                ? `Votre cotisation <strong>${templateTitle}</strong> de <strong>${(expectedCents / 100).toFixed(0)} €</strong> n'a pas encore été réglée.`
                : `Votre cotisation <strong>${templateTitle}</strong> est partiellement réglée. Il reste <strong>${(remaining / 100).toFixed(0)} €</strong> à payer (${(paidCents / 100).toFixed(0)} € versés sur ${(expectedCents / 100).toFixed(0)} € attendus).`
              }
            </Text>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <Text style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                {isPending
                  ? `💳 Montant dû : ${(expectedCents / 100).toFixed(0)} €`
                  : `💳 Reste à régler : ${(remaining / 100).toFixed(0)} € (payé : ${(paidCents / 100).toFixed(0)} €)`
                }
              </Text>
            </div>

            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, lineHeight: 1.5 }}>
              Pour tout renseignement, contactez directement votre organisation.
            </Text>
          </Section>
          <Hr style={{ borderColor: '#F4F4F6', margin: 0 }} />
          <Section style={{ padding: '20px 32px' }}>
            <Text style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
              {orgName} · Géré via <a href="https://triber.app" style={{ color: '#9CA3AF' }}>Triber</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

PaymentReminderEmail.PreviewProps = {
  memberName: 'Jean Dupont',
  orgName: 'FC Caen',
  templateTitle: 'Cotisation 2025-2026',
  paidCents: 5000,
  expectedCents: 8000,
  primaryColor: '#2A9D4E',
}
