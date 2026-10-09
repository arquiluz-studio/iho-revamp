import type { Database } from '@/lib/supabase/database.types'

export type LeadStatus = Database['public']['Enums']['lead_status']

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  closed: 'Cerrado',
}

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  contact_form: 'Formulario de contacto',
  project_download: 'Descarga de proyecto',
  event: 'Evento',
  product_quote: 'Cotización de producto',
}

export const LEAD_SELECT =
  'id, created_at, status, source, first_name, last_name, email, phone, company, message, locale, consent_marketing, business_lines(name_es), sectors(name_es)'
