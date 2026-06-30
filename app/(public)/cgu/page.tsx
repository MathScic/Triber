import Link from 'next/link'

export const metadata = { title: "Conditions Générales d'Utilisation — Triber" }

export default function CguPage() {
  return (
    <main className="min-h-screen bg-brand-bg py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-brand-dark transition-colors font-['Nunito',sans-serif]">← Retour</Link>
          <h1 className="text-3xl font-[800] text-brand-dark mt-3 font-['Barlow_Condensed',sans-serif] uppercase tracking-tight">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-sm text-[#6B7280] mt-1 font-['Nunito',sans-serif]">Version 1.0 — Juin 2026</p>
        </div>

        <Section title="1. Objet">
          <p>Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Triber</strong>, service de gestion de clubs sportifs et d&apos;associations, édité par Mathieu Scicluna.</p>
          <p className="mt-2">En créant un compte, l&apos;utilisateur accepte sans réserve les présentes CGU.</p>
        </Section>

        <Section title="2. Accès au service">
          <p>Triber est accessible via internet à l&apos;adresse <strong>triber.app</strong> et via l&apos;application mobile. L&apos;accès nécessite la création d&apos;un compte avec une adresse email valide et vérifiée.</p>
          <p className="mt-2"><strong>Règle d&apos;unicité :</strong> une adresse email ne peut être associée qu&apos;à un seul compte. Chaque compte ne peut gérer qu&apos;une seule organisation (MVP).</p>
        </Section>

        <Section title="3. Plans et tarification">
          <p>Triber propose deux plans :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><strong>Plan Gratuit :</strong> 0€/mois — limité à 20 membres, sans commission</li>
            <li><strong>Plan Club :</strong> 11,99€/mois — membres illimités + commission de 1,5% sur les cotisations encaissées</li>
          </ul>
          <p className="mt-2 font-semibold text-secondary">Commission 1,5% : en souscrivant au Plan Club, l&apos;administrateur accepte explicitement que Triber perçoive une commission de 1,5% sur chaque cotisation encaissée via la plateforme, en sus de l&apos;abonnement mensuel de 11,99€. Ce montant est prélevé automatiquement par Stripe au moment du paiement.</p>
          <p className="mt-2">Cette acceptation est confirmée par une case à cocher obligatoire lors de la souscription. Sans validation de cette case, la souscription est impossible.</p>
        </Section>

        <Section title="4. Obligations de l'utilisateur">
          <ul className="space-y-1 list-disc list-inside">
            <li>Fournir des informations exactes lors de l&apos;inscription</li>
            <li>Maintenir la confidentialité de ses identifiants</li>
            <li>Ne pas utiliser le service à des fins illégales</li>
            <li>Respecter les droits des autres membres</li>
          </ul>
        </Section>

        <Section title="5. Données personnelles">
          <p>Triber collecte et traite les données personnelles nécessaires au fonctionnement du service (email, nom, données d&apos;organisation) conformément au RGPD. L&apos;utilisateur dispose d&apos;un droit d&apos;accès, de rectification et de suppression.</p>
          <p className="mt-2">Contact : <strong>scicluna.mathieu@hotmail.fr</strong></p>
        </Section>

        <Section title="6. Propriété intellectuelle">
          <p>Le code, les designs et le contenu de Triber restent la propriété exclusive de Mathieu Scicluna. Les données saisies par les utilisateurs (membres, résultats, photos) restent leur propriété et peuvent être exportées à tout moment.</p>
        </Section>

        <Section title="7. Résiliation">
          <p>L&apos;utilisateur peut résilier son compte à tout moment depuis les paramètres. En cas de résiliation du Plan Club, le service reste actif jusqu&apos;à la fin de la période facturée.</p>
          <p className="mt-2">Triber se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</p>
        </Section>

        <Section title="8. Limitation de responsabilité">
          <p>Triber ne peut être tenu responsable des interruptions de service liées à des maintenances ou incidents techniques. Le service est fourni &quot;en l&apos;état&quot; pendant la phase bêta.</p>
        </Section>

        <Section title="9. Droit applicable">
          <p>Les présentes CGU sont soumises au droit français. Tout litige relève de la compétence exclusive des tribunaux français. En cas de litige non résolu à l&apos;amiable, les parties peuvent recourir à la médiation.</p>
        </Section>

        <p className="text-xs text-[#9CA3AF] font-['Nunito',sans-serif]">
          Dernière mise à jour : Juin 2026 · <Link href="/mentions-legales" className="underline hover:text-[#6B7280]">Mentions légales</Link>
        </p>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[#D1D1D6] p-6 space-y-2">
      <h2 className="text-base font-[800] text-brand-dark font-['Barlow_Condensed',sans-serif] uppercase tracking-tight">{title}</h2>
      <div className="text-sm text-[#6B7280] leading-relaxed font-['Nunito',sans-serif] space-y-1">{children}</div>
    </section>
  )
}
