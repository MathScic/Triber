'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { LiveMatchManager } from './LiveMatchManager'
import { MatchStatusBadge } from './MatchStatusBadge'
import type { FullMember, LineupEntry } from './LineupEditor'

type MatchStatus = 'upcoming' | 'ongoing' | 'half_time' | 'finished' | null

interface Props {
  eventId: string; title: string; subtitle?: string; backHref: string
  opponent: string | null; isHome: boolean | null
  initialStatus: MatchStatus; initialStartedAt: string | null
  initialPausedAt: string | null; initialTotalPausedSeconds: number
  orgName: string; orgLogoUrl?: string | null; organizationId: string; eventTitle: string
  allMembers: FullMember[]; initialLineup: LineupEntry[]
}

export function LivePageWrapper({
  title, subtitle, backHref, initialStatus, eventId, opponent, isHome,
  initialStartedAt, initialPausedAt, initialTotalPausedSeconds,
  orgName, orgLogoUrl, organizationId, eventTitle, allMembers, initialLineup,
}: Props) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus)
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} backHref={backHref} action={<MatchStatusBadge status={status} />} />
      <LiveMatchManager eventId={eventId} opponent={opponent} isHome={isHome}
        initialStatus={initialStatus} initialStartedAt={initialStartedAt}
        initialPausedAt={initialPausedAt} initialTotalPausedSeconds={initialTotalPausedSeconds}
        orgName={orgName} orgLogoUrl={orgLogoUrl} organizationId={organizationId} eventTitle={eventTitle}
        allMembers={allMembers} initialLineup={initialLineup}
        onStatusChange={s => setStatus(s as MatchStatus)} />
    </>
  )
}
