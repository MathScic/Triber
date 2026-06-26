import {
  Html, Head, Body, Container, Section, Text, Button, Hr
} from '@react-email/components'

interface Props {
  userName: string
  confirmUrl: string
}

export default function WelcomeEmail({ userName, confirmUrl }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={{ backgroundColor: '#F4F4F6', fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: 520, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #D1D1D6' }}>
          <Section style={{ backgroundColor: '#2A9D4E', padding: '28px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              Triber
            </Text>
          </Section>

          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: '#1A1F16', margin: '0 0 8px' }}>
              Bienvenue sur Triber, {userName} !
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 8px' }}>
              Votre compte a bien été créé. Pour l&apos;activer et commencer à gérer votre organisation, confirmez votre adresse email en cliquant ci-dessous.
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' }}>
              ✅ Ce lien est valable <strong>24 heures</strong>.
            </Text>

            <Button href={confirmUrl}
              style={{ backgroundColor: '#2A9D4E', color: '#ffffff', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
              Confirmer mon adresse email →
            </Button>

            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, lineHeight: 1.5 }}>
              Si vous n&apos;avez pas créé de compte Triber, ignorez cet email.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#F4F4F6', margin: 0 }} />
          <Section style={{ padding: '20px 32px' }}>
            <Text style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>
              Triber · Gestion de club simplifiée · <a href="https://triber.app" style={{ color: '#9CA3AF' }}>triber.app</a>
              {' · '}
              <a href="https://triber.app/mentions-legales" style={{ color: '#9CA3AF' }}>Mentions légales</a>
              {' · '}
              <a href="https://triber.app/cgu" style={{ color: '#9CA3AF' }}>CGU</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

WelcomeEmail.PreviewProps = {
  userName: 'Mathieu',
  confirmUrl: 'https://triber.app/auth/confirm?token=xxx',
}
