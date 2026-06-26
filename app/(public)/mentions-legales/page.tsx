import Link from 'next/link'

export const metadata = { title: 'Mentions légales — Triber' }

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#F4F4F6] py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-[#1A1F16] transition-colors font-['Nunito',sans-serif]">← Retour</Link>
          <h1 className="text-3xl font-[800] text-[#1A1F16] mt-3 font-['Barlow_Condensed',sans-serif] uppercase tracking-tight">Mentions légales</h1>
          <p className="text-sm text-[#6B7280] mt-1 font-['Nunito',sans-serif]">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique.</p>
        </div>

        <Section title="Éditeur du site">
          <p><strong>Raison sociale :</strong> Mathieu Scicluna (auto-entrepreneur / en cours de constitution)</p>
          <p><strong>Adresse email :</strong> scicluna.mathieu@hotmail.fr</p>
          <p><strong>Responsable de publication :</strong> Mathieu Scicluna</p>
        </Section>

        <Section title="Hébergement">
          <p><strong>Hébergeur web :</strong> Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
          <p><strong>Base de données :</strong> Supabase Inc., 970 Toa Payoh North, #07-04, Singapour 318992</p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>L&apos;ensemble des contenus présents sur Triber (textes, graphiques, logo, code source) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
          <p className="mt-2">Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments de Triber est interdite sans accord préalable écrit de Mathieu Scicluna.</p>
        </Section>

        <Section title="Données personnelles">
          <p>Les données collectées (email, nom, données d&apos;organisation) sont traitées conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679).</p>
          <p className="mt-2">Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en contactant : <strong>scicluna.mathieu@hotmail.fr</strong></p>
          <p className="mt-2">Les données sont hébergées sur des serveurs situés dans l&apos;Union Européenne via Supabase.</p>
        </Section>

        <Section title="Cookies">
          <p>Triber utilise des cookies de session nécessaires au fonctionnement de l&apos;application (authentification). Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé.</p>
        </Section>

        <Section title="Liens hypertextes">
          <p>Triber ne peut être tenu responsable du contenu des sites tiers vers lesquels des liens peuvent pointer.</p>
        </Section>

        <Section title="Droit applicable">
          <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        </Section>

        <p className="text-xs text-[#9CA3AF] font-['Nunito',sans-serif]">Dernière mise à jour : Juin 2026 · <Link href="/cgu" className="underline hover:text-[#6B7280]">CGU</Link></p>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[#D1D1D6] p-6 space-y-2">
      <h2 className="text-base font-[800] text-[#1A1F16] font-['Barlow_Condensed',sans-serif] uppercase tracking-tight">{title}</h2>
      <div className="text-sm text-[#6B7280] leading-relaxed font-['Nunito',sans-serif] space-y-1">{children}</div>
    </section>
  )
}
