// Double de test partagé reproduisant l'interface chaînable de supabase-js
// (select/eq/or/in/update/insert/delete renvoient le builder lui-même,
// résolu via .then/.single/.maybeSingle) — utilisé par les tests RGPD
// (gdpr-export, gdpr-delete) qui simulent des requêtes Supabase sans base réelle
export type FakeResponse = { data?: unknown; error?: unknown; count?: number }

export function fakeQuery(response: FakeResponse) {
  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'or', 'in', 'update', 'insert', 'delete']) {
    builder[method] = () => builder
  }
  builder.single = () => Promise.resolve(response)
  builder.maybeSingle = () => Promise.resolve(response)
  builder.then = (resolve: (v: FakeResponse) => void) => Promise.resolve(response).then(resolve)
  return builder
}
