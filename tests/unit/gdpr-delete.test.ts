import { describe, it, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { anonymizeUserData, findBlockingSoleAdminOrg } from '@/lib/utils/gdpr-delete'
import { fakeQuery, type FakeResponse } from './fake-supabase'

// Chaque table a sa propre file de réponses, consommées dans l'ordre d'appel
function fakeAdmin(responses: Record<string, FakeResponse[]>) {
  const calls: string[] = []
  return {
    client: {
      from(table: string) {
        calls.push(table)
        const queue = responses[table] ?? []
        return fakeQuery(queue.shift() ?? { data: null })
      },
    } as unknown as SupabaseClient,
    calls,
  }
}

describe('findBlockingSoleAdminOrg', () => {
  it('bloque si unique admin de son organisation', async () => {
    const { client } = fakeAdmin({
      organization_members: [{ data: { organization_id: 'org-1' } }, { count: 1 }],
      organizations: [{ data: { name: 'FC Test' } }],
    })
    expect(await findBlockingSoleAdminOrg(client, 'user-1')).toBe('FC Test')
  })

  it('autorise si un autre admin existe dans la même organisation', async () => {
    const { client } = fakeAdmin({
      organization_members: [{ data: { organization_id: 'org-1' } }, { count: 2 }],
    })
    expect(await findBlockingSoleAdminOrg(client, 'user-1')).toBeNull()
  })

  it('autorise si l\'utilisateur n\'est admin d\'aucune organisation', async () => {
    const { client } = fakeAdmin({ organization_members: [{ data: null }] })
    expect(await findBlockingSoleAdminOrg(client, 'user-1')).toBeNull()
  })
})

describe('anonymizeUserData', () => {
  it('touche toutes les tables sans cascade FK avant suppression du compte', async () => {
    const { client, calls } = fakeAdmin({})
    await anonymizeUserData(client, 'user-1')

    // Tables avec FK sans ON DELETE CASCADE — la suppression auth échouerait sinon
    for (const table of [
      'events', 'match_results', 'media', 'match_actions',
      'announcements', 'contribution_templates', 'contribution_payments',
      'treasury_entries', 'messages',
    ]) {
      expect(calls).toContain(table)
    }
  })
})
