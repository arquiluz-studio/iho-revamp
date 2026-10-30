'use client'

import { Controller, useFieldArray, useFormState, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import type { FormValues } from '@/lib/admin/form-schema'
import type { Option } from '@/lib/admin/resources'
import { SITE_PAGE_KEYS, sitePage } from '@/lib/content/static-pages'
import { Dropdown } from './Dropdown'
import { Button, Input } from './ui'

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
const CTA_PAGES: Option[] = SITE_PAGE_KEYS.flatMap(key => {
  const page = sitePage(key)
  return page ? [{ value: page.key, label: page.label }] : []
})

function ctaMessage(errors: Record<string, unknown>, name: string, index: number, key: string) {
  const field = errors[name]
  if (!Array.isArray(field)) return undefined
  const item = field[index]
  if (!item || typeof item !== 'object') return undefined
  const nested = (item as Record<string, { message?: string } | undefined>)[key]
  return nested?.message
}

export function CtasEditor({
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
