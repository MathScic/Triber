import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Img
} from '@react-email/components'

interface Props {
  orgName: string
  inviterName: string
  inviteUrl: string
  primaryColor?: string
}

export default function InviteMemberEmail({ orgName, inviterName, inviteUrl, primaryColor = '#2A9D4E' }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={{ backgroundColor: '#F4F4F6', fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: 520, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #D1D1D6' }}>
          <Section style={{ backgroundColor: primaryColor, padding: '28px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              Triber
            </Text>
          </Section>

          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#1A1F16', margin: '0 0 8px' }}>
              Vous êtes invité à rejoindre {orgName}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' }}>
              <strong>{inviterName}</strong> vous invite à rejoindre l&apos;organisation <strong>{orgName}</strong> sur Triber, la plateforme de gestion de club tout-en-un.
            </Text>

            <Button href={inviteUrl}
              style={{ backgroundColor: primaryColor, color: '#ffffff', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
              Rejoindre l&apos;organisation →
            </Button>

            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, lineHeight: 1.5 }}>
              Ce lien est valable 7 jours. Si vous n&apos;attendiez pas cette invitation, vous pouvez ignorer cet email.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#F4F4F6', margin: 0 }} />
          <Section style={{ padding: '20px 32px' }}>
            <Text style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
              Triber · Gestion de club simplifiée · <a href="https://triber.app" style={{ color: '#9CA3AF' }}>triber.app</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

InviteMemberEmail.PreviewProps = {
  orgName: 'FC Caen',
  inviterName: 'Mathieu Scicluna',
  inviteUrl: 'https://triber.app/join?token=xxx',
  primaryColor: '#2A9D4E',
}
