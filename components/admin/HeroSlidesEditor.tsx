'use client'

import { useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useFormState, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { getMediaByIds } from '@/app/admin/actions/media'
import type { FormValues } from '@/lib/admin/form-schema'
import type { AdminMedia } from '@/lib/admin/media'
import { CtasEditor } from './CtasEditor'
import { MediaThumb, UploadButton } from './MediaUpload'
import { Button, Input, Textarea, cn } from './ui'

const MAX_SLIDES = 20

const EMPTY_SLIDE = {
  kind: 'image',
  media_id: '',
  duration_seconds: '6',
  eyebrow_es: '',
  eyebrow_en: '',
  title_es: '',
  title_en: '',
  subtitle_es: '',
  subtitle_en: '',
  ctas: [],
}

export function HeroSlidesEditor({
  control,
  register,
  setValue,
  name,
  disabled,
  media,
  onMedia,
  countryCode,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  name: string
  disabled: boolean
  media: Record<string, AdminMedia>
  onMedia: (media: AdminMedia) => void
  countryCode: string | null
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: name as never })
  const { errors } = useFormState({ control })
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const initialIds = useRef<Set<string> | null>(null)
  if (initialIds.current === null) initialIds.current = new Set(fields.map(field => field.id))
  const message = (index: number, key: string) => fieldMessage(errors as Record<string, unknown>, name, index, key)

  return (
    <div className="space-y-3">
      {fields.map((item, index) => (
        <SlideCard
          key={item.id}
          control={control}
          register={register}
          setValue={setValue}
          name={name}
          index={index}
          total={fields.length}
          startOpen={!initialIds.current?.has(item.id)}
          disabled={disabled}
          media={media}
          onMedia={onMedia}
          countryCode={countryCode}
          dragging={dragIndex === index}
          canDrop={dragIndex !== null}
          invalid={slideInvalid(errors as Record<string, unknown>, name, index)}
          message={key => message(index, key)}
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => setDragIndex(null)}
          onDrop={() => {
            if (dragIndex !== null) move(dragIndex, index)
            setDragIndex(null)
          }}
          onReorder={target => {
            if (target !== index) move(index, target)
          }}
          onRemove={() => remove(index)}
        />
      ))}
      <p className="text-xs text-zinc-500">
        Contrae una diapositiva para arrastrarla más fácil, o escribe su número de orden. Una foto avanza a los segundos que indiques. Un video avanza cuando termina.
      </p>
      {!disabled && fields.length < MAX_SLIDES && (
        <Button variant="outline" size="sm" onClick={() => append({ ...EMPTY_SLIDE, ctas: [] } as never)}>
          Agregar diapositiva
        </Button>
      )}
    </div>
  )
}

function SlideCard({
  control,
  register,
  setValue,
  name,
  index,
  total,
  startOpen,
  disabled,
  media,
  onMedia,
  countryCode,
  dragging,
  canDrop,
  invalid,
  message,
  onDragStart,
  onDragEnd,
  onDrop,
  onReorder,
  onRemove,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  name: string
  index: number
  total: number
  startOpen: boolean
  disabled: boolean
  media: Record<string, AdminMedia>
  onMedia: (media: AdminMedia) => void
  countryCode: string | null
  dragging: boolean
  canDrop: boolean
  invalid: boolean
  message: (key: string) => string | undefined
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
  onReorder: (target: number) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(startOpen)
  const [orderText, setOrderText] = useState<string | null>(null)
  const row = useWatch({ control, name: `${name}.${index}` as never }) as unknown
  const current = (row && typeof row === 'object' ? row : {}) as { kind?: string; media_id?: string; title_es?: string }
  const kind = current.kind === 'video' ? 'video' : 'image'
  const mediaId = current.media_id ?? ''
  const title = (current.title_es ?? '').replace(/\*/g, '').replace(/\s+/g, ' ').trim()

  useEffect(() => {
    if (invalid) setOpen(true)
  }, [invalid])

  const setKind = (next: 'image' | 'video') => {
    if (next === kind) return
    setValue(`${name}.${index}.kind` as never, next as never, { shouldDirty: true, shouldValidate: true })
    setValue(`${name}.${index}.media_id` as never, '' as never, { shouldDirty: true, shouldValidate: true })
    if (next === 'image') setValue(`${name}.${index}.duration_seconds` as never, '6' as never, { shouldDirty: true })
  }

  const commitOrder = () => {
    const typed = orderText
    setOrderText(null)
    if (typed === null || !/^\d+$/.test(typed)) return
    const target = Math.min(Math.max(Number(typed), 1), total) - 1
    onReorder(target)
  }

  return (
    <div
      onDragOver={event => {
        if (!disabled && canDrop) event.preventDefault()
      }}
      onDrop={event => {
        event.preventDefault()
        onDrop()
      }}
      className={cn('rounded-md border border-zinc-300 bg-zinc-50', dragging && 'opacity-50', invalid && 'border-red-300')}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          draggable={!disabled}
          disabled={disabled}
          aria-label="Arrastrar para reordenar"
          onDragStart={event => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', String(index))
            onDragStart()
          }}
          onDragEnd={onDragEnd}
          className={cn('cursor-grab px-1 text-lg leading-none text-zinc-400 active:cursor-grabbing', disabled && 'cursor-not-allowed')}
        >
          ⋮⋮
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Contraer diapositiva' : 'Expandir diapositiva'}
          onClick={() => setOpen(value => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden className="text-xs text-zinc-400">{open ? '▾' : '▸'}</span>
          <span className="shrink-0 text-sm font-medium text-zinc-800">Diapositiva {index + 1}</span>
          <span className="shrink-0 text-xs text-zinc-500">{kind === 'video' ? 'Video' : 'Foto'}</span>
          {title && <span className="truncate text-xs text-zinc-500">{title}</span>}
          {invalid && <span className="shrink-0 text-xs text-red-600">Revisa</span>}
        </button>
        <label className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs text-zinc-500">Orden</span>
          <Input
            type="number"
            min={1}
            max={total}
            inputMode="numeric"
            disabled={disabled || total < 2}
            aria-label={`Orden de la diapositiva ${index + 1}`}
            value={orderText ?? String(index + 1)}
            onChange={event => setOrderText(event.target.value)}
            onBlur={commitOrder}
            onKeyDown={event => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              event.currentTarget.blur()
            }}
            className="h-8 w-14 px-1 text-center"
          />
        </label>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove} aria-label="Quitar diapositiva">
          Quitar
        </Button>
      </div>

      <div className={cn('space-y-4 border-t border-zinc-200 p-4', !open && 'hidden')}>
      <div className="flex flex-wrap gap-2">
        <Button variant={kind === 'image' ? 'primary' : 'outline'} size="sm" disabled={disabled} onClick={() => setKind('image')}>
          Foto
        </Button>
        <Button variant={kind === 'video' ? 'primary' : 'outline'} size="sm" disabled={disabled} onClick={() => setKind('video')}>
          Video
        </Button>
      </div>

      <Controller
        control={control}
        name={`${name}.${index}.media_id` as never}
        render={({ field }) => (
          <SlideMedia
            value={(field.value as string) || ''}
            onChange={field.onChange}
            media={mediaId ? media[mediaId] : null}
            onMedia={onMedia}
            video={kind === 'video'}
            countryCode={countryCode}
            disabled={disabled}
            error={message('media_id')}
          />
        )}
      />

      {kind === 'image' && (
        <label className="block max-w-[160px] space-y-1">
          <span className="text-xs text-zinc-500">Segundos en pantalla</span>
          <Input type="number" min={3} max={30} disabled={disabled} {...register(`${name}.${index}.duration_seconds`)} />
          {message('duration_seconds') && <span className="block text-xs text-red-600">{message('duration_seconds')}</span>}
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <SlideText register={register} name={`${name}.${index}.eyebrow_es`} label="Antetítulo (ES)" error={message('eyebrow_es')} disabled={disabled} />
        <SlideText register={register} name={`${name}.${index}.eyebrow_en`} label="Antetítulo (EN)" error={message('eyebrow_en')} disabled={disabled} />
        <SlideText register={register} name={`${name}.${index}.title_es`} label="Título (ES)" error={message('title_es')} disabled={disabled} rows={3} help="Salto de línea = nueva línea. *texto* = resaltado en rojo." />
        <SlideText register={register} name={`${name}.${index}.title_en`} label="Título (EN)" error={message('title_en')} disabled={disabled} rows={3} />
        <SlideText register={register} name={`${name}.${index}.subtitle_es`} label="Subtítulo (ES)" error={message('subtitle_es')} disabled={disabled} rows={3} />
        <SlideText register={register} name={`${name}.${index}.subtitle_en`} label="Subtítulo (EN)" error={message('subtitle_en')} disabled={disabled} rows={3} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">Botones</p>
        <CtasEditor control={control} register={register} setValue={setValue} name={`${name}.${index}.ctas`} disabled={disabled} />
      </div>
      </div>
    </div>
  )
}

function SlideMedia({
  value,
  onChange,
  media,
  onMedia,
  video,
  countryCode,
  disabled,
  error,
}: {
  value: string
  onChange: (value: string) => void
  media: AdminMedia | null
  onMedia: (media: AdminMedia) => void
  video: boolean
  countryCode: string | null
  disabled: boolean
  error?: string
}) {
  const noun = video ? 'video' : 'foto'
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <MediaThumb media={media} className="h-20 w-28 shrink-0" />
        <div className="flex flex-col items-start gap-1.5">
          <UploadButton
            kind="hero"
            countryCode={countryCode}
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
              Quitar archivo
            </Button>
          )}
        </div>
      </div>
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </div>
  )
}

function SlideText({
  register,
  name,
  label,
  error,
  disabled,
  rows = 2,
  help,
}: {
  register: UseFormRegister<FormValues>
  name: string
  label: string
  error?: string
  disabled: boolean
  rows?: number
  help?: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <Textarea rows={rows} disabled={disabled} {...register(name)} />
      {help && <span className="block text-xs text-zinc-500">{help}</span>}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function slideInvalid(errors: Record<string, unknown>, name: string, index: number) {
  const field = errors[name]
  if (!Array.isArray(field)) return false
  const item = field[index]
  return Boolean(item && typeof item === 'object')
}

function fieldMessage(errors: Record<string, unknown>, name: string, index: number, key: string) {
  const field = errors[name]
  if (!Array.isArray(field)) return undefined
  const item = field[index]
  if (!item || typeof item !== 'object') return undefined
  const nested = (item as Record<string, { message?: string } | undefined>)[key]
  return nested?.message
}
