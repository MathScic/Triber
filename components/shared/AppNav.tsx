'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBrandingContext } from '@/lib/contexts/BrandingContext'
import { SidebarDesktop } from './SidebarDesktop'
import { SidebarMobile } from './SidebarMobile'

type OrgInfo = { name: string; logo_url: string | null }
type Role = 'admin' | 'member_active' | 'member'

export function AppNav() {
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<Role>('member')
  const { primaryColor, sidebarBg } = useBrandingContext()

  useEffect(() => {
    const s = createClient()
    s.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      s.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
        .then(({ data: p }) => setUserName((p?.full_name as string) ?? user.email ?? null))
      s.from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: mem }) => {
          if (!mem) return
          setRole((mem.role as Role) ?? 'member')
          s.from('organizations')
            .select('name, logo_url')
            .eq('id', mem.organization_id)
            .maybeSingle()
            .then(({ data: o }) => { if (o) setOrg(o as OrgInfo) })
        })
    })
  }, [])

  return (
    <>
      <SidebarDesktop
        orgName={org?.name ?? null}
        orgLogo={org?.logo_url ?? null}
        userName={userName}
        role={role}
        primaryColor={primaryColor}
        sidebarBg={sidebarBg}
      />
      <SidebarMobile primaryColor={primaryColor} sidebarBg={sidebarBg} userName={userName} role={role} />
    </>
  )
}
