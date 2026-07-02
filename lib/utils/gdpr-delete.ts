import type { SupabaseClient } from '@supabase/supabase-js'

// RGPD — droit à l'oubli : anonymise les références à l'utilisateur dans les
// tables sans cascade automatique (FK sans ON DELETE), à appeler AVANT
// auth.admin.deleteUser() sinon la contrainte de clé étrangère bloque la
// suppression. Les autres tables (profiles, organization_members,
// event_attendees, player_stats, member_categories, match_lineups,
// contribution_payments.user_id) ont déjà un ON DELETE CASCADE/SET NULL en base.
export async function anonymizeUserData(admin: SupabaseClient, userId: string) {
  await Promise.all([
    admin.from('events').update({ created_by: null }).eq('created_by', userId),
    admin.from('match_results').update({ entered_by: null }).eq('entered_by', userId),
    admin.from('media').update({ uploader_id: null }).eq('uploader_id', userId),
    admin.from('match_actions').update({ user_id: null }).eq('user_id', userId),
    admin.from('match_actions').update({ player_in_id: null }).eq('player_in_id', userId),
    admin.from('announcements').update({ author_id: null }).eq('author_id', userId),
    admin.from('contribution_templates').update({ created_by: null }).eq('created_by', userId),
    admin.from('contribution_payments').update({ paid_by: null }).eq('paid_by', userId),
    admin.from('treasury_entries').update({ entered_by: null }).eq('entered_by', userId),
    admin.from('treasury_entries').update({ reviewed_by: null }).eq('reviewed_by', userId),
    // Contenu personnel sans valeur collective une fois l'auteur supprimé
    admin.from('messages').delete().eq('sender_id', userId),
  ])
}

// RGPD — garde-fou : un utilisateur ne peut pas supprimer son compte s'il est
// l'unique admin de son organisation (elle se retrouverait sans gestionnaire).
// Un compte n'administre qu'une seule organisation (règle MVP, CLAUDE.md §13)
// — pas besoin de boucler sur plusieurs organisations.
// Retourne le nom de l'organisation bloquante, ou null si la suppression peut
// se poursuivre.
export async function findBlockingSoleAdminOrg(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data: adminOf } = await admin
    .from('organization_members').select('organization_id').eq('user_id', userId).eq('role', 'admin').maybeSingle()
  if (!adminOf) return null

  const { count } = await admin
    .from('organization_members').select('*', { count: 'exact', head: true })
    .eq('organization_id', adminOf.organization_id).eq('role', 'admin')
  if ((count ?? 0) > 1) return null

  const { data: org } = await admin.from('organizations').select('name').eq('id', adminOf.organization_id).single()
  return (org as { name?: string } | null)?.name ?? 'votre club'
}
