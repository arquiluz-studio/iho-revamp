'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition, type ReactNode } from 'react'
import { Controller, useFieldArray, useForm, useFormState, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { getMediaByIds } from '@/app/admin/actions/media'
import { deleteResource, saveResource } from '@/app/admin/actions/resources'
import { buildSchema, type FormValues } from '@/lib/admin/form-schema'
import type { AdminMedia } from '@/lib/admin/media'
import { RESOURCES, fieldColumns, type Field, type MediaKind, type Option, type ResourceKey } from '@/lib/admin/resources'
import { CONTENT_PAGES } from '@/lib/content/static-pages'
import { Dropdown, MultiDropdown } from './Dropdown'
import { MediaThumb, UploadButton } from './MediaUpload'
import { Button, Card, Checkbox, FieldShell, Input, Notice, Textarea, cn } from './ui'

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

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function ResourceForm({ resource, id, countryCode, initialValues, options, media, canEdit, canDelete, basePath, aside }: Props) {
  const config = RESOURCES[resource]
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('general')
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [mediaCache, setMediaCache] = useState(media)

  const schema = useMemo(() => buildSchema(config), [config])
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialValues, mode: 'onBlur' })
  const { register, control, handleSubmit, formState, setError, setValue } = form
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

  const titleField = localized.find(f => f.type === 'text' && f.name !== 'origin_country')?.name
  /** `slug` comes from the Spanish title, `slug_en` from the English one. */
  const generateSlug = (column: string) => {
    if (!titleField) return
    const source = form.getValues(`${titleField}_${column === 'slug_en' ? 'en' : 'es'}`)
    const slug = slugify(typeof source === 'string' ? source : '')
    if (slug) form.setValue(column, slug, { shouldDirty: true, shouldValidate: true })
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
      setValue={setValue}
      onGenerate={field.type === 'slug' && titleField ? () => generateSlug(column) : undefined}
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
              <div key={field.name} className={cn((field.wide || field.type === 'textarea' || field.type === 'stats' || field.type === 'specs' || field.type === 'ctas') && 'sm:col-span-2')}>
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
  setValue,
  onGenerate,
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
  setValue: UseFormSetValue<FormValues>
  onGenerate?: () => void
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
        <div className="pt-6">
          <label className="flex items-center gap-2 text-sm text-zinc-800">
            <Checkbox id={column} disabled={disabled} {...register(column)} />
            {field.label}
          </label>
          {field.help && <p className="mt-1 text-xs text-zinc-500">{field.help}</p>}
        </div>
      )
    case 'textarea':
      return shell(<Textarea id={column} rows={field.rows ?? 4} disabled={disabled} {...register(column)} />)
    case 'select':
    case 'reference':
      return shell(
        <Controller
          control={control}
          name={column}
          render={({ field: f }) => (
            <Dropdown
              id={column}
              value={(f.value as string) ?? ''}
              options={options}
              onChange={f.onChange}
              emptyLabel={field.required ? undefined : 'Ninguno'}
              disabled={disabled}
            />
          )}
        />,
      )
    case 'number':
      return shell(<Input id={column} inputMode={field.decimals ? 'decimal' : 'numeric'} disabled={disabled} {...register(column)} />)
    case 'datetime':
      return shell(<Input id={column} type="datetime-local" disabled={disabled} {...register(column)} />)
    case 'multi':
      return shell(
        <Controller
          control={control}
          name={field.name}
          render={({ field: f }) =>
            field.checklist ? (
              <Checklist options={options} value={(f.value as string[]) ?? []} onChange={f.onChange} disabled={disabled} />
            ) : (
              <MultiDropdown id={column} options={options} value={(f.value as string[]) ?? []} onChange={f.onChange} disabled={disabled} />
            )
          }
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
    case 'ctas':
      return shell(<CtasEditor control={control} register={register} setValue={setValue} name={field.name} disabled={disabled} />)
    case 'slug':
      return shell(
        <div className="flex gap-2">
          <Input id={column} disabled={disabled} {...register(column)} />
          {onGenerate && (
            <Button type="button" variant="ghost" disabled={disabled} onClick={onGenerate}>
              Generar del título
            </Button>
          )}
        </div>,
      )
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
  const current = value ? media[value] : null
  const noun = video ? 'video' : 'imagen'
  return (
    <div className="flex items-center gap-3">
      <MediaThumb media={current ?? (value ? undefined : null)} className="h-20 w-28 shrink-0" />
      <div className="flex flex-col items-start gap-1.5">
        <UploadButton
          kind={kind}
          countryCode={countryCode}
          projectId={projectId}
          video={video}
          disabled={disabled}
          label={value ? `Reemplazar ${noun}` : `Subir ${noun}`}
          onUploaded={async ids => {
            const [uploaded] = await getMediaByIds(ids)
            if (!uploaded) return
            onMedia(uploaded)
            onChange(uploaded.id)
          }}
        />
        {value && (
          <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onChange('')}>
            Quitar
          </Button>
        )}
      </div>
    </div>
  )
}

function Checklist({
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
  const selected = new Set(value)
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-zinc-300 bg-white px-3 py-2.5">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-2 text-sm text-zinc-800">
          <Checkbox
            checked={selected.has(o.value)}
            disabled={disabled}
            onChange={e => onChange(e.target.checked ? [...value, o.value] : value.filter(v => v !== o.value))}
          />
          {o.label}
        </label>
      ))}
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

const CTA_STYLES: Option[] = [
  { value: 'red', label: 'Rojo' },
  { value: 'outline', label: 'Contorno blanco' },
  { value: 'black', label: 'Negro' },
]
const CTA_KINDS: Option[] = [
  { value: 'page', label: 'Página del sitio' },
  { value: 'url', label: 'URL' },
]
const CTA_WINDOWS: Option[] = [
  { value: 'self', label: 'La misma ventana' },
  { value: 'blank', label: 'Una nueva ventana' },
]
const CTA_PAGES: Option[] = CONTENT_PAGES.map(page => ({ value: page.key, label: page.label }))

function ctaMessage(errors: Record<string, unknown>, name: string, index: number, key: string) {
  const field = errors[name]
  if (!Array.isArray(field)) return undefined
  const item = field[index]
  if (!item || typeof item !== 'object') return undefined
  const nested = (item as Record<string, { message?: string } | undefined>)[key]
  return nested?.message
}

function CtasEditor({
  control,
  register,
  setValue,
  name,
  disabled,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  name: string
  disabled: boolean
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: name as never })
  const { errors } = useFormState({ control })
  return (
    <div className="space-y-3">
      {fields.map((item, index) => (
        <CtaCard
          key={item.id}
          control={control}
          register={register}
          setValue={setValue}
          name={name}
          index={index}
          disabled={disabled}
          errors={errors as Record<string, unknown>}
          canMoveUp={index > 0}
          onMoveUp={() => move(index, index - 1)}
          onRemove={() => remove(index)}
        />
      ))}
      <p className="text-xs text-zinc-500">Una página del sitio se abre en el país que se está viendo. Una URL puede ser https://… o #ancla.</p>
      {!disabled && fields.length < 2 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => append({ style: 'red', label_es: '', label_en: '', kind: 'page', page: 'contact', url: '', open_in: 'self' } as never)}
        >
          Agregar botón
        </Button>
      )}
    </div>
  )
}

function CtaCard({
  control,
  register,
  setValue,
  name,
  index,
  disabled,
  errors,
  canMoveUp,
  onMoveUp,
  onRemove,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  name: string
  index: number
  disabled: boolean
  errors: Record<string, unknown>
  canMoveUp: boolean
  onMoveUp: () => void
  onRemove: () => void
}) {
  const row = useWatch({ control, name: `${name}.${index}` as never }) as unknown
  const current = (row && typeof row === 'object' ? row : {}) as { kind?: string; page?: string }
  const kind = current.kind === 'url' ? 'url' : 'page'
  const page = current.page ?? ''
  const message = (key: string) => ctaMessage(errors, name, index, key)
  return (
    <div className="space-y-3 rounded-md border border-zinc-300 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-800">Botón {index + 1}</p>
        <div className="flex">
          <Button variant="ghost" size="sm" disabled={disabled || !canMoveUp} onClick={onMoveUp} aria-label="Subir">
            ↑
          </Button>
          <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove} aria-label="Quitar">
            ✕
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CtaSelect control={control} name={`${name}.${index}.style`} label="Estilo" options={CTA_STYLES} disabled={disabled} />
        <CtaSelect control={control} name={`${name}.${index}.open_in`} label="Abrir en" options={CTA_WINDOWS} disabled={disabled} />
        <CtaText register={register} name={`${name}.${index}.label_es`} label="Texto en español" error={message('label_es')} disabled={disabled} />
        <CtaText register={register} name={`${name}.${index}.label_en`} label="Texto en inglés" error={message('label_en')} disabled={disabled} />
        <CtaSelect
          control={control}
          name={`${name}.${index}.kind`}
          label="Destino"
          options={CTA_KINDS}
          disabled={disabled}
          onChange={value => {
            if (value === 'page' && !page) setValue(`${name}.${index}.page` as never, 'contact' as never)
          }}
        />
        {kind === 'url' ? (
          <CtaText register={register} name={`${name}.${index}.url`} label="URL" error={message('url')} disabled={disabled} placeholder="https://… o #contacto" />
        ) : (
          <CtaSelect control={control} name={`${name}.${index}.page`} label="Página" options={CTA_PAGES} disabled={disabled} error={message('page')} />
        )}
      </div>
    </div>
  )
}

function CtaText({
  register,
  name,
  label,
  error,
  disabled,
  placeholder,
}: {
  register: UseFormRegister<FormValues>
  name: string
  label: string
  error?: string
  disabled: boolean
  placeholder?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <Input placeholder={placeholder} disabled={disabled} {...register(name)} />
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function CtaSelect({
  control,
  name,
  label,
  options,
  disabled,
  error,
  onChange,
}: {
  control: Control<FormValues>
  name: string
  label: string
  options: Option[]
  disabled: boolean
  error?: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Dropdown
            value={(field.value as string) ?? ''}
            options={options}
            disabled={disabled}
            onChange={value => {
              field.onChange(value)
              onChange?.(value)
            }}
          />
        )}
      />
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </div>
  )
}
