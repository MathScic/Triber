'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ContributionTarif = { id?: string; category: string; amount_cents: number }

export type ContributionTemplate = {
  id: string
  title: string
  description: string | null
  deadline: string | null
  warning_message: string | null
  is_buvette: boolean
  is_active: boolean
  created_at: string
  tarifs: ContributionTarif[]
  payments_count: number
  paid_count: number
  total_expected_cents: number
  total_paid_cents: number
}

export function useContributions() {
  const [templates, setTemplates] = useState<ContributionTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const init = useCallback(async () => {
    setLoading(true)
    const s = createClient()
    const { data: { user } } = await s.auth.getUser()
    if (!user) { setLoading(false); return null }
    const { data: mem } = await s
      .from('organization_members').select('organization_id, role')
      .eq('user_id', user.id).maybeSingle()
    if (!mem) { setLoading(false); return null }
    setOrgId(mem.organization_id as string)
    setRole(mem.role as string)
    return mem as { organization_id: string; role: string }
  }, [])

  const fetchTemplates = useCallback(async (oid: string) => {
    const s = createClient()
    const { data } = await s
      .from('contribution_templates')
      .select('*, contribution_tarifs(id,category,amount_cents), contribution_payments(id,status,amount_cents)')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
    if (data) {
      setTemplates(data.map((t: Record<string, unknown>) => {
        const pmts = (t.contribution_payments as { status: string; amount_cents: number }[] | null) ?? []
        return {
          ...(t as object),
          tarifs: (t.contribution_tarifs as ContributionTarif[] | null) ?? [],
          payments_count: pmts.length,
          paid_count: pmts.filter(p => p.status === 'paid').length,
          total_expected_cents: pmts.reduce((s, p) => s + p.amount_cents, 0),
          total_paid_cents: pmts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_cents, 0),
        } as ContributionTemplate
      }))
    }
    setLoading(false)
  }, [])

  const createTemplate = useCallback(async (
    oid: string,
    payload: {
      title: string; description?: string; deadline?: string | null
      warning_message?: string | null; is_buvette?: boolean
      tarifs: ContributionTarif[]
    }
  ): Promise<string | null> => {
    const s = createClient()
    const { tarifs, ...rest } = payload
    const { data: tmpl, error } = await s
      .from('contribution_templates')
      .insert({ ...rest, organization_id: oid })
      .select().single()
    if (error || !tmpl) return null
    if (tarifs.length > 0) {
      await s.from('contribution_tarifs').insert(
        tarifs.map(t => ({ template_id: (tmpl as { id: string }).id, category: t.category, amount_cents: t.amount_cents }))
      )
    }
    await fetchTemplates(oid)
    return (tmpl as { id: string }).id
  }, [fetchTemplates])

  const toggleActive = useCallback(async (templateId: string, active: boolean, oid: string) => {
    await createClient().from('contribution_templates').update({ is_active: active }).eq('id', templateId)
    await fetchTemplates(oid)
  }, [fetchTemplates])

  const updateTemplate = useCallback(async (
    templateId: string, oid: string,
    payload: { title: string; description?: string; deadline?: string | null; warning_message?: string | null; tarifs: ContributionTarif[] }
  ) => {
    const s = createClient()
    const { tarifs, ...rest } = payload
    await s.from('contribution_templates').update(rest).eq('id', templateId)
    await s.from('contribution_tarifs').delete().eq('template_id', templateId)
    if (tarifs.length > 0) {
      await s.from('contribution_tarifs').insert(
        tarifs.map(t => ({ template_id: templateId, category: t.category, amount_cents: t.amount_cents }))
      )
    }
    await fetchTemplates(oid)
  }, [fetchTemplates])

  const deleteTemplate = useCallback(async (templateId: string, oid: string) => {
    const s = createClient()
    await s.from('contribution_payments').delete().eq('template_id', templateId)
    await s.from('contribution_tarifs').delete().eq('template_id', templateId)
    await s.from('contribution_templates').delete().eq('id', templateId)
    await fetchTemplates(oid)
  }, [fetchTemplates])

  return { templates, loading, orgId, role, init, fetchTemplates, createTemplate, toggleActive, updateTemplate, deleteTemplate }
}
