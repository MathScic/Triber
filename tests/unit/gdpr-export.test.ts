import { describe, it, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { collectUserData } from '@/lib/utils/gdpr-export'
import { fakeQuery } from './fake-supabase'

// Chaque table renvoie une ligne portant son propre nom, pour vérifier que
// collectUserData route chaque table vers la bonne clé du résultat plutôt
// que de mélanger les données entre organisations/tables
function fakeSupabase() {
  const queried: string[] = []
  const client = {
    from(table: string) {
      queried.push(table)
      // 'profiles' est lu via .maybeSingle() (une ligne), les autres via await direct (un tableau)
      const row = { source: table }
      return fakeQuery({ data: table === 'profiles' ? row : [row] })
    },
  } as unknown as SupabaseClient
  return { client, queried }
}

describe('collectUserData', () => {
  it('interroge toutes les tables personnelles du schéma', async () => {
    const { client, queried } = fakeSupabase()
    await collectUserData(client, 'user-1')

    for (const table of [
      'profiles', 'organization_members', 'event_attendees', 'player_stats',
      'media', 'messages', 'match_actions', 'match_results', 'announcements',
      'contribution_templates', 'contribution_payments', 'treasury_entries', 'events',
    ]) {
      expect(queried).toContain(table)
    }
  })

  it('n\'interroge les tables satellites (catégories, compositions) que si des adhésions existent', async () => {
    const { client, queried } = fakeSupabase()
    await collectUserData(client, 'user-1')
    expect(queried).toContain('member_categories')
    expect(queried).toContain('match_lineups')
  })

  it('route chaque table vers sa propre clé de résultat', async () => {
    const { client } = fakeSupabase()
    const data = await collectUserData(client, 'user-1')

    expect(data.profil).toEqual({ source: 'profiles' })
    expect(data.messages_envoyes).toEqual([{ source: 'messages' }])
    expect(data.annonces_ecrites).toEqual([{ source: 'announcements' }])
  })
})
