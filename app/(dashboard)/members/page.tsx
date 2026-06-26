'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { useMembers, type MemberRole } from '@/lib/hooks/useMembers'
import { MemberTable } from '@/components/members/MemberTable'
import { InviteForm } from '@/components/members/InviteForm'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })

export default function MembersPage() {
  return <Suspense><MembersPageContent /></Suspense>
}

function MembersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const { members, getMembers, updateMemberRole, removeMember, loading } = useMembers(orgId ?? '')

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      s.from('organization_members').select('organization_id, role, organizations(name)').eq('user_id', user.id).maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) { router.push('/onboarding'); return }
          setOrgId(mem.organization_id as string)
          setIsAdmin(mem.role === 'admin')
          const raw = (mem as unknown as { organizations?: { name?: string } | { name?: string }[] }).organizations
          const name = Array.isArray(raw) ? raw[0]?.name : raw?.name
          setOrgName(name ?? '')
        })
    })
  }, [router])

  useEffect(() => {
    if (orgId) getMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  useEffect(() => {
    if (searchParams.get('invite') === '1' && isAdmin) setShowInvite(true)
  }, [searchParams, isAdmin])

  return (
    <main className={`${nunito.variable} ${barlow.variable} min-h-screen bg-[#F4F4F6] px-6 py-8`}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* En-tête page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-[800] text-[#1A1F16] uppercase tracking-tight font-[family-name:var(--font-barlow)]">
              Membres
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5 font-[family-name:var(--font-nunito)]">
              Gestion des adhérents du club
            </p>
          </div>
        </div>

        {loading && !members.length && (
          <div className="bg-white rounded-2xl border border-[#D1D1D6] h-64 animate-pulse" />
        )}

        {(!loading || members.length > 0) && orgId && (
          <MemberTable
            members={members}
            isAdmin={isAdmin}
            onRoleChange={(uid, role) => void updateMemberRole(uid, role as MemberRole)}
            onRemove={uid => void removeMember(uid)}
            onInvite={() => setShowInvite(true)}
          />
        )}
      </div>

      {/* Modal invitation */}
      {showInvite && orgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <InviteForm organizationId={orgId} orgName={orgName} onClose={() => { setShowInvite(false); void getMembers() }} />
          </div>
        </div>
      )}
    </main>
  )
}
