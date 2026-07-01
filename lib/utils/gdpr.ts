import type { SupabaseClient } from '@supabase/supabase-js'

// RGPD — droit à la portabilité : rassemble toutes les données personnelles
// de l'utilisateur à travers le vrai schéma Triber. Chaque requête est filtrée
// sur son propre id, jamais sur l'organisation entière (les policies RLS de
// certaines tables autorisent la lecture au niveau organisation, pas au niveau
// utilisateur — le filtre explicite est donc indispensable, pas optionnel).
export async function collectUserData(supabase: SupabaseClient, userId: string) {
  const [
    profile, memberships, attendees, playerStats, media, messages,
    actionsAsPlayer, actionsAsSub, matchResults, announcements,
    templates, payments, treasury, eventsCreated,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('organization_members').select('*').eq('user_id', userId),
    supabase.from('event_attendees').select('*').eq('user_id', userId),
    supabase.from('player_stats').select('*').eq('user_id', userId),
    supabase.from('media').select('*').eq('uploader_id', userId),
    supabase.from('messages').select('*').eq('sender_id', userId),
    supabase.from('match_actions').select('*').eq('user_id', userId),
    supabase.from('match_actions').select('*').eq('player_in_id', userId),
    supabase.from('match_results').select('*').eq('entered_by', userId),
    supabase.from('announcements').select('*').eq('author_id', userId),
    supabase.from('contribution_templates').select('*').eq('created_by', userId),
    supabase.from('contribution_payments').select('*').eq('user_id', userId),
    supabase.from('treasury_entries').select('*').or(`entered_by.eq.${userId},reviewed_by.eq.${userId}`),
    supabase.from('events').select('*').eq('created_by', userId),
  ])

  // organization_member_id (pas user_id direct) → tables satellites accessibles via les adhésions
  const memberIds = (memberships.data ?? []).map((m: { id: string }) => m.id)
  const [categories, lineups] = memberIds.length
    ? await Promise.all([
        supabase.from('member_categories').select('*').in('organization_member_id', memberIds),
        supabase.from('match_lineups').select('*').in('organization_member_id', memberIds),
      ])
    : [{ data: [] }, { data: [] }]

  return {
    profil: profile.data,
    adhesions_organisations: memberships.data ?? [],
    categories_membre: categories.data ?? [],
    presences_evenements: attendees.data ?? [],
    statistiques_joueur: playerStats.data ?? [],
    medias_uploades: media.data ?? [],
    messages_envoyes: messages.data ?? [],
    actions_match_effectuees: actionsAsPlayer.data ?? [],
    actions_match_le_concernant: actionsAsSub.data ?? [],
    resultats_matchs_saisis: matchResults.data ?? [],
    annonces_ecrites: announcements.data ?? [],
    cotisations_creees: templates.data ?? [],
    paiements: payments.data ?? [],
    entrees_tresorerie: treasury.data ?? [],
    evenements_crees: eventsCreated.data ?? [],
    compositions_match: lineups.data ?? [],
  }
}

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
