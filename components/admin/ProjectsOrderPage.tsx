import { compareProjectOrder, PROJECT_LINES, type ProjectLineSlug } from '@/lib/admin/project-order'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProjectsOrderEditor } from './ProjectsOrderEditor'

export async function ProjectsOrderPage({ countryCode, countryName, canEdit }: { countryCode: string; countryName: string; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const [{ data: projects }, { data: links }, { data: lines }] = await Promise.all([
    supabase.from('projects').select('id, title_es, year, status, sort, is_featured').eq('country_code', countryCode),
    supabase.from('project_business_lines').select('project_id, is_featured, business_line:business_lines!inner(slug), project:projects!inner(country_code)').eq('project.country_code', countryCode),
    supabase.from('business_lines').select('slug').in('slug', PROJECT_LINES.map(line => line.slug)),
  ])
  const known = new Set((lines ?? []).map(line => line.slug))
  const byProject = new Map<string, Partial<Record<ProjectLineSlug, boolean>>>()
  for (const link of links ?? []) {
    const slug = link.business_line?.slug
    if (!slug || !known.has(slug)) continue
    const current = byProject.get(link.project_id) ?? {}
    current[slug as ProjectLineSlug] = link.is_featured
    byProject.set(link.project_id, current)
  }

  const rows = (projects ?? [])
    .map(project => {
      const assigned = byProject.get(project.id) ?? {}
      return {
        id: project.id,
        title: project.title_es,
        year: project.year,
        status: project.status,
        sort: project.sort,
        home: project.is_featured,
        lines: {
          mobiliario: assigned.mobiliario ?? null,
          architectural: assigned.architectural ?? null,
          lighting: assigned.lighting ?? null,
        },
      }
    })
    .sort(compareProjectOrder)

  return (
    <ProjectsOrderEditor
      countryCode={countryCode}
      description={`Proyectos de ${countryName}. El orden de esta lista es el del sitio.`}
      initialRows={rows}
      canEdit={canEdit}
    />
  )
}
