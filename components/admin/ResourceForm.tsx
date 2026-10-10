'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition, type ReactNode } from 'react'
import { Controller, useFieldArray, useForm, type Control, type UseFormRegister } from 'react-hook-form'
import { deleteResource, saveResource } from '@/app/admin/actions/resources'
import { buildSchema, type FormValues } from '@/lib/admin/form-schema'
import type { AdminMedia } from '@/lib/admin/media'
import { RESOURCES, fieldColumns, type Field, type MediaKind, type Option, type ResourceKey } from '@/lib/admin/resources'
import { MediaPicker, MediaThumb } from './MediaPicker'
import { Button, Card, Checkbox, FieldShell, Input, Notice, Select, Textarea, cn } from './ui'

type Props = {
  resource: ResourceKey
  id: string | null
  countryCode: string | null
  initialValues: FormValues
  options: Record<string, Option[]>
  media: Record<string, AdminMedia>
  canEdit: boolean
  canDelete?: boolean
  /** Base path of the list (e.g. /admin/events or /admin/global/brands). */
  basePath: string
  aside?: ReactNode
}

type Tab = 'general' | 'es' | 'en'

export function ResourceForm({ resource, id, countryCode, initialValues, options, media, canEdit, canDelete, basePath, aside }: Props) {
  const config = RESOURCES[resource]
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('general')
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [mediaCache, setMediaCache] = useState(media)

  const schema = useMemo(() => buildSchema(config), [config])
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialValues, mode: 'onBlur' })
  const { register, control, handleSubmit, formState, setError } = form
  const errors = formState.errors as Record<string, { message?: string } | undefined>

  const general = config.fields.filter(f => !('i18n' in f && f.i18n))
  const localized = config.fields.filter(f => 'i18n' in f && f.i18n)
  const tabErrors = (lang: 'es' | 'en') => localized.some(f => errors[`${f.name}_${lang}`])
  const generalErrors = general.some(f => fieldColumns(f).some(c => errors[c]) || errors[f.name])

  const onSubmit = handleSubmit(values =>
    startTransition(async () => {
      setMessage(null)
      const result = await saveResource(resource, id, countryCode, values)
      if (!result.ok) {
        setMessage({ tone: 'red', text: result.error })
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) setError(name, { message: messages[0] })
        }
        return
      }
      setMessage({ tone: 'green', text: 'Guardado.' })
      if (!id && !config.singleton) router.replace(`${basePath}/${encodeURIComponent(result.id)}`)
      else router.refresh()
    }),
  )

  const onDelete = () => {
    if (!id || !confirm(`¿Eliminar este ${config.singular}? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const result = await deleteResource(resource, id, countryCode)
      if (!result.ok) setMessage({ tone: 'red', text: result.error })
      else router.replace(basePath)
    })
  }

  const renderField = (field: Field, column: string) => (
    <FieldInput
      key={column}
      field={field}
      column={column}
      register={register}
      control={control}
      error={errors[column]?.message ?? errors[field.name]?.message}
      options={options[field.name] ?? ('options' in field ? field.options : [])}
      media={mediaCache}
      onMedia={m => setMediaCache(prev => ({ ...prev, [m.id]: m }))}
      countryCode={config.scope === 'country' ? countryCode : null}
      disabled={!canEdit || (config.pkInput === true && column === config.pk && Boolean(id))}
      projectId={resource === 'projects' ? id : null}
    />
  )

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-4">
        {localized.length > 0 && (
          <div className="flex gap-1 border-b border-zinc-200">
            {(
              [
                ['general', 'General', generalErrors],
                ['es', 'Español', tabErrors('es')],
                ['en', 'English', tabErrors('en')],
              ] as const
            ).map(([key, label, hasError]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  '-mb-px border-b-2 px-3 py-2 text-sm',
                  tab === key ? 'border-zinc-900 font-medium text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800',
                )}
              >
                {label}
                {hasError && <span className="ml-1 text-red-600">•</span>}
              </button>
            ))}
          </div>
        )}
        <Card className="p-5">
          <div className={cn('grid gap-4 sm:grid-cols-2', tab !== 'general' && 'hidden')}>
            {general.map(field => (
              <div key={field.name} className={cn((field.wide || field.type === 'textarea' || field.type === 'stats' || field.type === 'specs') && 'sm:col-span-2')}>
                {fieldColumns(field).length ? fieldColumns(field).map(c => renderField(field, c)) : renderField(field, field.name)}
              </div>
            ))}
          </div>
          {(['es', 'en'] as const).map(lang => (
            <div key={lang} className={cn('grid gap-4', tab !== lang && 'hidden')}>
              {lang === 'en' && <p className="text-xs text-zinc-500">Si un campo en inglés queda vacío, el sitio en inglés muestra el texto en español.</p>}
              {localized.map(field => renderField(field, `${field.name}_${lang}`))}
            </div>
          ))}
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="space-y-3 p-4 lg:sticky lg:top-8">
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {!canEdit && <Notice tone="amber">Solo lectura con tu rol actual.</Notice>}
          <Button type="submit" className="w-full" disabled={!canEdit || pending}>
            {pending ? 'Guardando…' : id || config.singleton ? 'Guardar cambios' : `Crear ${config.singular}`}
          </Button>
          {id && canDelete && canEdit && (
            <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50" disabled={pending} onClick={onDelete}>
              Eliminar
            </Button>
          )}
          {aside}
        </Card>
      </div>
    </form>
  )
}

function FieldInput({
  field,
  column,
  register,
  control,
  error,
  options,
  media,
  onMedia,
  countryCode,
  disabled,
  projectId,
}: {
  field: Field
  column: string
  register: UseFormRegister<FormValues>
  control: Control<FormValues>
  error?: string
  options: Option[]
  media: Record<string, AdminMedia>
  onMedia: (media: AdminMedia) => void
  countryCode: string | null
  disabled: boolean
  projectId: string | null
}) {
  const lang = column.endsWith('_en') ? ' (EN)' : column.endsWith('_es') ? ' (ES)' : ''
  const label = (
    <>
      {field.label}
      {lang && <span className="text-zinc-400">{lang}</span>}
      {field.required && !column.endsWith('_en') && <span className="text-red-600"> *</span>}
    </>
  )
  const shell = (children: ReactNode) => (
    <FieldShell label={label} htmlFor={column} help={field.help} error={error}>
      {children}
    </FieldShell>
  )

  switch (field.type) {
    case 'boolean':
      return (
        <label className="flex items-center gap-2 pt-6 text-sm text-zinc-800">
          <Checkbox id={column} disabled={disabled} {...register(column)} />
          {field.label}
        </label>
      )
    case 'textarea':
      return shell(<Textarea id={column} rows={field.rows ?? 4} disabled={disabled} {...register(column)} />)
    case 'select':
    case 'reference':
      return shell(
        <Select id={column} disabled={disabled} {...register(column)}>
          {!field.required && <option value="">—</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>,
      )
    case 'number':
      return shell(<Input id={column} inputMode="numeric" disabled={disabled} {...register(column)} />)
    case 'datetime':
      return shell(<Input id={column} type="datetime-local" disabled={disabled} {...register(column)} />)
    case 'multi':
      return shell(
        <Controller
          control={control}
          name={field.name}
          render={({ field: f }) => (
            <MultiSelect options={options} value={(f.value as string[]) ?? []} onChange={f.onChange} disabled={disabled} />
          )}
        />,
      )
    case 'media':
      return shell(
        <Controller
          control={control}
          name={column}
          render={({ field: f }) => (
            <MediaField
              value={(f.value as string) || ''}
              onChange={f.onChange}
              media={media}
              onMedia={onMedia}
              kind={field.kind}
              video={field.video}
              countryCode={countryCode}
              disabled={disabled}
              projectId={projectId}
            />
          )}
        />,
      )
    case 'stats':
      return shell(<StatsEditor control={control} register={register} name={field.name} disabled={disabled} />)
    case 'specs':
      return shell(<SpecsEditor control={control} register={register} name={field.name} disabled={disabled} />)
    default:
      return shell(
        <Input
          id={column}
          type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
          disabled={disabled}
          {...register(column)}
        />,
      )
  }
}

function MediaField({
  value,
  onChange,
  media,
  onMedia,
  kind,
  video,
  countryCode,
  disabled,
  projectId,
}: {
  value: string
  onChange: (value: string) => void
  media: Record<string, AdminMedia>
  onMedia: (media: AdminMedia) => void
  kind: MediaKind
  video?: boolean
  countryCode: string | null
  disabled: boolean
  projectId: string | null
}) {
  const [open, setOpen] = useState(false)
  const current = value ? media[value] : null
  return (
    <div className="flex items-center gap-3">
      <MediaThumb media={current ?? (value ? undefined : null)} className="h-20 w-28 shrink-0" />
      <div className="flex flex-col gap-1.5">
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          {value ? 'Cambiar' : 'Elegir'}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onChange('')}>
            Quitar
          </Button>
        )}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        countryCode={countryCode}
        kind={kind}
        video={video}
        projectId={projectId}
        onSelect={selected => {
          onMedia(selected)
          onChange(selected.id)
          setOpen(false)
        }}
      />
    </div>
  )
}

export function MultiSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const selected = new Set(value)
  const labelOf = new Map(options.map(o => [o.value, o.label]))
  const filtered = options.filter(o => !selected.has(o.value) && o.label.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="rounded-md border border-zinc-300 bg-white p-2">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.length === 0 && <span className="text-xs text-zinc-400">Ninguna seleccionada</span>}
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs text-white">
            {labelOf.get(v) ?? v}
            {!disabled && (
              <button type="button" aria-label="Quitar" onClick={() => onChange(value.filter(x => x !== v))}>
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <>
          <Input placeholder="Buscar para agregar…" value={query} onChange={e => setQuery(e.target.value)} className="h-8" />
          {query && (
            <ul className="mt-1 max-h-48 overflow-y-auto">
              {filtered.slice(0, 30).map(o => (
                <li key={o.value}>
                  <button
                    type="button"
                    className="w-full rounded px-2 py-1 text-left text-sm hover:bg-zinc-100"
                    onClick={() => {
                      onChange([...value, o.value])
                      setQuery('')
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-2 py-1 text-xs text-zinc-400">Sin resultados</li>}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function StatsEditor({
  control,
  register,
  name,
  disabled,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  name: string
  disabled: boolean
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: name as never })
  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="grid grid-cols-[60px_80px_60px_1fr_1fr_auto] items-center gap-2">
          <Input placeholder="+" disabled={disabled} {...register(`${name}.${index}.prefix`)} />
          <Input placeholder="35" disabled={disabled} {...register(`${name}.${index}.value`)} />
          <Input placeholder="M" disabled={disabled} {...register(`${name}.${index}.suffix`)} />
          <Textarea rows={2} placeholder="Etiqueta ES" disabled={disabled} {...register(`${name}.${index}.label_es`)} />
          <Textarea rows={2} placeholder="Label EN" disabled={disabled} {...register(`${name}.${index}.label_en`)} />
          <div className="flex flex-col">
            <Button variant="ghost" size="sm" disabled={disabled || index === 0} onClick={() => move(index, index - 1)} aria-label="Subir">
              ↑
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled} onClick={() => remove(index)} aria-label="Quitar">
              ✕
            </Button>
          </div>
        </div>
      ))}
      <p className="text-xs text-zinc-500">Prefijo · valor · sufijo · etiqueta (salto de línea permitido).</p>
      {!disabled && fields.length < 8 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => append({ prefix: '', value: '0', suffix: '', label_es: '', label_en: '' } as never)}
        >
          Agregar estadística
        </Button>
      )}
    </div>
  )
}

function SpecsEditor({
  control,
  register,
  name,
  disabled,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  name: string
  disabled: boolean
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: name as never })
  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2">
          <Input placeholder="Etiqueta ES" disabled={disabled} {...register(`${name}.${index}.label_es`)} />
          <Input placeholder="Label EN" disabled={disabled} {...register(`${name}.${index}.label_en`)} />
          <Input placeholder="Valor (ej. 2700–4000 K)" disabled={disabled} {...register(`${name}.${index}.value`)} />
          <div className="flex">
            <Button variant="ghost" size="sm" disabled={disabled || index === 0} onClick={() => move(index, index - 1)} aria-label="Subir">
              ↑
            </Button>
            <Button variant="ghost" size="sm" disabled={disabled} onClick={() => remove(index)} aria-label="Quitar">
              ✕
            </Button>
          </div>
        </div>
      ))}
      {!disabled && fields.length < 40 && (
        <Button variant="outline" size="sm" onClick={() => append({ label_es: '', label_en: '', value: '' } as never)}>
          Agregar especificación
        </Button>
      )}
    </div>
  )
}
