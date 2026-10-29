import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { z } from 'zod'
import { SITE_PAGE_KEYS, type SitePageKey } from '@/lib/content/static-pages'
import { fieldColumns, type Field, type ResourceConfig } from './resources'

/**
 * Form values are kept as strings (inputs), booleans and arrays; `toRow` converts them to column values.
 * The same schema validates on the client (react-hook-form) and again in the server action.
 */
export type FormValues = Record<string, unknown>

export const statSchema = z.object({
  value: z.string().regex(/^\d+(\.\d+)?$/, 'Número'),
  prefix: z.string().max(4),
  suffix: z.string().max(4),
  label_es: z.string().trim().min(1, 'Requerido').max(60),
  label_en: z.string().trim().max(60),
})
export type StatValue = z.infer<typeof statSchema>

export const specSchema = z.object({
  label_es: z.string().trim().min(1, 'Requerido').max(80),
  label_en: z.string().trim().max(80),
  value: z.string().trim().min(1, 'Requerido').max(200),
})
export type SpecValue = z.infer<typeof specSchema>

const pageKeySchema = z.enum(SITE_PAGE_KEYS as unknown as [SitePageKey, ...SitePageKey[]], 'Elige una página')
const ctaFields = {
  style: z.enum(['red', 'outline', 'black']),
  label_es: z.string().trim().min(1, 'Requerido').max(80),
  label_en: z.string().trim().max(80),
  open_in: z.enum(['self', 'blank']),
}
const URL_HREF = /^(https?:\/\/\S+|#\S+)$/

export const ctaSchema = z.discriminatedUnion('kind', [
  z.object({ ...ctaFields, kind: z.literal('page'), page: pageKeySchema, url: z.string().trim().max(500) }),
  z.object({
    ...ctaFields,
    kind: z.literal('url'),
    page: z.string(),
    url: z.string().trim().regex(URL_HREF, 'Usa https:// o #ancla').max(500),
  }),
])
export type CtaValue = z.infer<typeof ctaSchema>

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const INTEGER = /^-?\d+$/
const DECIMAL = /^-?\d+(\.\d+)?$/

const optional = (schema: z.ZodString, required: boolean) =>
  required ? schema.min(1, 'Requerido') : schema.or(z.literal(''))

function textSchema(field: Field, required: boolean): z.ZodType {
  const max = 'max' in field && field.max ? field.max : 5000
  const base = z.string().trim()
  switch (field.type) {
    case 'slug':
      return required
        ? base.regex(SLUG, 'Solo minúsculas, números y guiones')
        : base.regex(SLUG, 'Solo minúsculas, números y guiones').or(z.literal(''))
    case 'url':
      return required ? z.url('URL inválida') : z.url('URL inválida').or(z.literal(''))
    case 'email':
      return required ? z.email('Email inválido') : z.email('Email inválido').or(z.literal(''))
    default:
      return required ? base.min(1, 'Requerido').max(max) : base.max(max)
  }
}

function fieldSchema(field: Field, column: string, required: boolean): z.ZodType {
  switch (field.type) {
    case 'boolean':
      return z.boolean()
    case 'number': {
      const number = z
        .string()
        .regex(field.decimals ? DECIMAL : INTEGER, field.decimals ? 'Número' : 'Número entero')
        .refine(v => field.min === undefined || Number(v) >= field.min, `Mínimo ${field.min}`)
        .refine(v => field.max === undefined || Number(v) <= field.max, `Máximo ${field.max}`)
      return required ? number : number.or(z.literal(''))
    }
    case 'select': {
      const values = field.options.map(o => o.value) as [string, ...string[]]
      return required ? z.enum(values, 'Requerido') : z.enum(values).or(z.literal(''))
    }
    case 'datetime':
      return optional(z.string().regex(DATETIME_LOCAL, 'Fecha inválida'), required)
    case 'reference':
    case 'media':
      return optional(z.string(), required)
    case 'multi':
      return z.array(z.string())
    case 'stats':
      return z.array(statSchema).max(8)
    case 'specs':
      return z.array(specSchema).max(40)
    case 'ctas':
      return z.array(ctaSchema).max(2)
    default:
      return textSchema(field, required && column.endsWith('_en') === false)
  }
}

export function buildSchema(config: ResourceConfig) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of config.fields) {
    if (field.type === 'multi' || field.type === 'stats' || field.type === 'specs' || field.type === 'ctas') {
      shape[field.name] = fieldSchema(field, field.name, false)
      continue
    }
    for (const column of fieldColumns(field)) {
      shape[column] = fieldSchema(field, column, Boolean(field.required) && !column.endsWith('_en'))
    }
  }
  let schema = z.object(shape)
  if (config.pkInput) {
    schema = schema.extend({ [config.pk]: z.string().regex(/^[a-z]{2}$/, 'Dos letras minúsculas') })
  }
  return schema
}

/** Converts validated form values to a row for insert/update (bridges are returned separately). */
export function toRow(config: ResourceConfig, values: FormValues, fallbackTimezone: string) {
  const row: Record<string, unknown> = {}
  const bridges: Record<string, string[]> = {}
  const timezone =
    (config.timezoneField && typeof values[config.timezoneField] === 'string' && (values[config.timezoneField] as string)) ||
    fallbackTimezone

  for (const field of config.fields) {
    if (field.type === 'multi') {
      bridges[field.name] = (values[field.name] as string[]) ?? []
      continue
    }
    if (field.type === 'stats') {
      row[field.name] = ((values[field.name] as StatValue[]) ?? []).map(s => ({ ...s, value: Number(s.value) }))
      continue
    }
    if (field.type === 'specs') {
      row[field.name] = ((values[field.name] as SpecValue[]) ?? []).map(s => ({ ...s, label_en: s.label_en || null }))
      continue
    }
    if (field.type === 'ctas') {
      row[field.name] = ((values[field.name] as CtaValue[]) ?? []).map(cta => ({
        style: cta.style,
        label_es: cta.label_es,
        label_en: cta.label_en || null,
        open_in: cta.open_in,
        kind: cta.kind,
        ...(cta.kind === 'page' ? { page: cta.page } : { url: cta.url }),
      }))
      continue
    }
    for (const column of fieldColumns(field)) {
      const value = values[column]
      if (field.type === 'boolean') row[column] = Boolean(value)
      else if (value === '' || value === undefined || value === null) row[column] = null
      else if (field.type === 'number') row[column] = Number(value)
      else if (field.type === 'datetime') row[column] = fromZonedTime(String(value), timezone).toISOString()
      else row[column] = value
    }
  }
  if (config.pkInput && values[config.pk]) row[config.pk] = values[config.pk]
  return { row, bridges }
}

/** Converts a database row (plus bridge ids) to form values. */
export function toFormValues(
  config: ResourceConfig,
  row: Record<string, unknown>,
  bridges: Record<string, string[]>,
  fallbackTimezone: string,
): FormValues {
  const values: FormValues = {}
  const timezone = (config.timezoneField && (row[config.timezoneField] as string)) || fallbackTimezone
  for (const field of config.fields) {
    if (field.type === 'multi') {
      values[field.name] = bridges[field.name] ?? []
      continue
    }
    if (field.type === 'stats') {
      const stats = Array.isArray(row[field.name]) ? (row[field.name] as Record<string, unknown>[]) : []
      values[field.name] = stats.map(s => ({
        value: String(s.value ?? ''),
        prefix: String(s.prefix ?? ''),
        suffix: String(s.suffix ?? ''),
        label_es: String(s.label_es ?? ''),
        label_en: String(s.label_en ?? ''),
      }))
      continue
    }
    if (field.type === 'specs') {
      const specs = Array.isArray(row[field.name]) ? (row[field.name] as Record<string, unknown>[]) : []
      values[field.name] = specs.map(s => ({ label_es: String(s.label_es ?? ''), label_en: String(s.label_en ?? ''), value: String(s.value ?? '') }))
      continue
    }
    if (field.type === 'ctas') {
      const ctas = Array.isArray(row[field.name]) ? (row[field.name] as Record<string, unknown>[]) : []
      values[field.name] = ctas.map(cta => ({
        style: cta.style === 'outline' || cta.style === 'black' ? cta.style : 'red',
        label_es: String(cta.label_es ?? ''),
        label_en: String(cta.label_en ?? ''),
        kind: cta.kind === 'url' ? 'url' : 'page',
        page: typeof cta.page === 'string' && cta.page ? cta.page : 'contact',
        url: String(cta.url ?? ''),
        open_in: cta.open_in === 'blank' ? 'blank' : 'self',
      }))
      continue
    }
    for (const column of fieldColumns(field)) {
      const value = row[column]
      if (field.type === 'boolean') values[column] = Boolean(value)
      else if (value === null || value === undefined) values[column] = ''
      else if (field.type === 'datetime') values[column] = formatInTimeZone(String(value), timezone, "yyyy-MM-dd'T'HH:mm")
      else values[column] = String(value)
    }
  }
  if (config.pkInput) values[config.pk] = String(row[config.pk] ?? '')
  return values
}
