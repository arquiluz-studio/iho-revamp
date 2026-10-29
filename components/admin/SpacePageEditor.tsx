'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { getMediaByIds } from '@/app/admin/actions/media'
import { saveSpacePage } from '@/app/admin/actions/space-page'
import type { AdminMedia } from '@/lib/admin/media'
import { emptyCard, emptyStep, type Copy, type SpacePageContent } from '@/lib/content/space-page'
import { Button, Card, CardHeader, Input, Notice, Textarea } from './ui'
import { MediaThumb, UploadButton } from './MediaUpload'

const LIMITS = { cards: 8, steps: 8 }

/** Text and photos of the space layout, in the same order as the public page. */
export function SpacePageEditor({
  id,
  spaceName,
  content: initial,
  media,
  canEdit,
}: {
  id: string
  spaceName: string
  content: SpacePageContent
  media: AdminMedia[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState(initial)
  const [library, setLibrary] = useState(() => new Map(media.map(item => [item.id, item])))
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const change = (next: SpacePageContent) => {
    setContent(next)
    setDirty(true)
    setMessage(null)
  }

  const remember = async (ids: string[]) => {
    const [uploaded] = await getMediaByIds(ids)
    if (!uploaded) return null
    setLibrary(prev => new Map(prev).set(uploaded.id, uploaded))
    return uploaded.id
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveSpacePage(id, content)
      setMessage(result.ok ? { tone: 'green', text: 'Cambios guardados.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  const saveButton = canEdit ? (
    <Button disabled={!dirty || pending} onClick={save}>
      {pending ? 'Guardando…' : 'Guardar página'}
    </Button>
  ) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Página"
          description="Texto y fotos del layout, en español e inglés. Una sección vacía no se publica. *así* destaca una frase."
          actions={saveButton}
        />
        {message && (
          <div className="px-5 pt-4">
            <Notice tone={message.tone}>{message.text}</Notice>
          </div>
        )}
        <div className="space-y-8 px-5 py-5">
          <Section title="Hero" help="La foto es la portada del espacio. El nombre es el del catálogo. Los otros espacios se listan solos. El botón, si tiene texto, lleva a contacto.">
            <Pair label="Párrafo" value={content.hero.intro} max={2000} rows={4} disabled={!canEdit || pending} onChange={intro => change({ ...content, hero: { ...content.hero, intro } })} />
            <Pair label="Botón" value={content.hero.ctaLabel} max={200} disabled={!canEdit || pending} onChange={ctaLabel => change({ ...content, hero: { ...content.hero, ctaLabel } })} />
          </Section>

          <Section title="Introducción" help="Texto a la izquierda y foto a la derecha. El botón lleva a contacto.">
            <Pair label="Antetítulo" value={content.intro.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, intro: { ...content.intro, eyebrow } })} />
            <Pair label="Título" value={content.intro.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, intro: { ...content.intro, title } })} />
            <Pair label="Texto" value={content.intro.body} max={2000} rows={4} disabled={!canEdit || pending} onChange={body => change({ ...content, intro: { ...content.intro, body } })} />
            <Pair label="Botón" value={content.intro.ctaLabel} max={200} disabled={!canEdit || pending} onChange={ctaLabel => change({ ...content, intro: { ...content.intro, ctaLabel } })} />
            <Photo id={content.intro.imageId} library={library} canEdit={canEdit} pending={pending} onChange={imageId => change({ ...content, intro: { ...content.intro, imageId } })} onUpload={remember} />
          </Section>

          <Section title="Franja" help="Título grande y un párrafo, centrados, sobre fondo claro.">
            <Pair label="Título" value={content.banner.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, banner: { ...content.banner, title } })} />
            <Pair label="Texto" value={content.banner.text} max={2000} rows={4} disabled={!canEdit || pending} onChange={text => change({ ...content, banner: { ...content.banner, text } })} />
          </Section>

          <Section title="Elementos" help="Hasta 8 tarjetas. El número 01, 02… lo pone la página. Ver más abre el índice de soluciones.">
            <Pair label="Antetítulo" value={content.elements.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, elements: { ...content.elements, eyebrow } })} />
            <Pair label="Título" value={content.elements.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, elements: { ...content.elements, title } })} />
            <Pair label="Texto al lado" value={content.elements.intro} max={2000} rows={3} disabled={!canEdit || pending} onChange={intro => change({ ...content, elements: { ...content.elements, intro } })} />
            <Pair label="Ver más" value={content.elements.moreLabel} max={200} disabled={!canEdit || pending} onChange={moreLabel => change({ ...content, elements: { ...content.elements, moreLabel } })} />
            <ul className="space-y-4">
              {content.elements.items.map((item, index) => (
                <li key={index} className="rounded-md border border-zinc-200 p-4">
                  <RowHead index={index} canEdit={canEdit && !pending} onRemove={() => change({ ...content, elements: { ...content.elements, items: content.elements.items.filter((_, i) => i !== index) } })} />
                  <div className="mt-3 space-y-3">
                    <Photo
                      id={item.imageId}
                      library={library}
                      canEdit={canEdit}
                      pending={pending}
                      onChange={imageId => change({ ...content, elements: { ...content.elements, items: content.elements.items.map((row, i) => (i === index ? { ...row, imageId } : row)) } })}
                      onUpload={remember}
                    />
                    <Pair label="Título" value={item.title} max={200} disabled={!canEdit || pending} onChange={title => change({ ...content, elements: { ...content.elements, items: content.elements.items.map((row, i) => (i === index ? { ...row, title } : row)) } })} />
                    <Pair label="Texto" value={item.text} max={2000} rows={3} disabled={!canEdit || pending} onChange={text => change({ ...content, elements: { ...content.elements, items: content.elements.items.map((row, i) => (i === index ? { ...row, text } : row)) } })} />
                  </div>
                </li>
              ))}
            </ul>
            {canEdit && content.elements.items.length < LIMITS.cards && (
              <Button variant="outline" disabled={pending} onClick={() => change({ ...content, elements: { ...content.elements, items: [...content.elements.items, emptyCard()] } })}>
                Agregar tarjeta
              </Button>
            )}
          </Section>

          <Section title="Soluciones" help="La franja roja no se escribe aquí.">
            <p className="text-sm text-zinc-500">
              Se muestran las soluciones del catálogo que aplican a {spaceName}, en el orden de esa lista. Cada nombre abre su ficha.{' '}
              <a className="text-zinc-900 underline" href="/admin/global/content/solutions">Ir a soluciones</a>
            </p>
          </Section>

          <Section title="Proyectos" help="Las fotos salen de los proyectos destacados de este espacio. Hasta 4, en el orden de la lista. Ver más abre el índice de proyectos.">
            <Pair label="Antetítulo" value={content.projects.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, projects: { ...content.projects, eyebrow } })} />
            <Pair label="Título" value={content.projects.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, projects: { ...content.projects, title } })} />
            <Pair label="Texto al lado" value={content.projects.intro} max={2000} rows={3} disabled={!canEdit || pending} onChange={intro => change({ ...content, projects: { ...content.projects, intro } })} />
            <Pair label="Ver más" value={content.projects.moreLabel} max={200} disabled={!canEdit || pending} onChange={moreLabel => change({ ...content, projects: { ...content.projects, moreLabel } })} />
            <p className="text-sm text-zinc-500">
              Un proyecto entra si su espacio es {spaceName} y está marcado como destacado.{' '}
              <a className="text-zinc-900 underline" href="/admin/projects">Ir a proyectos</a>
            </p>
          </Section>

          <Section title="Cita">
            <Pair label="Cita" value={content.quote.text} max={2000} rows={3} disabled={!canEdit || pending} onChange={text => change({ ...content, quote: { ...content.quote, text } })} />
            <Pair label="Texto debajo" value={content.quote.attribution} max={2000} rows={3} disabled={!canEdit || pending} onChange={attribution => change({ ...content, quote: { ...content.quote, attribution } })} />
          </Section>

          <Section title="Proceso" help="Cada paso es una línea con su número. Hasta 8.">
            <Pair label="Antetítulo" value={content.process.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, process: { ...content.process, eyebrow } })} />
            <Pair label="Título" value={content.process.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, process: { ...content.process, title } })} />
            <Pair label="Texto al lado" value={content.process.intro} max={2000} rows={3} disabled={!canEdit || pending} onChange={intro => change({ ...content, process: { ...content.process, intro } })} />
            <ul className="space-y-3">
              {content.process.steps.map((step, index) => (
                <li key={index} className="rounded-md border border-zinc-200 p-4">
                  <RowHead index={index} canEdit={canEdit && !pending} onRemove={() => change({ ...content, process: { ...content.process, steps: content.process.steps.filter((_, i) => i !== index) } })} />
                  <div className="mt-3 space-y-3">
                    <Pair label="Título" value={step.title} max={200} disabled={!canEdit || pending} onChange={title => change({ ...content, process: { ...content.process, steps: content.process.steps.map((row, i) => (i === index ? { ...row, title } : row)) } })} />
                    <Pair label="Texto" value={step.text} max={2000} rows={3} disabled={!canEdit || pending} onChange={text => change({ ...content, process: { ...content.process, steps: content.process.steps.map((row, i) => (i === index ? { ...row, text } : row)) } })} />
                  </div>
                </li>
              ))}
            </ul>
            {canEdit && content.process.steps.length < LIMITS.steps && (
              <Button variant="outline" disabled={pending} onClick={() => change({ ...content, process: { ...content.process, steps: [...content.process.steps, emptyStep()] } })}>
                Agregar paso
              </Button>
            )}
          </Section>

          <Section title="Marcas" help="El antetítulo se edita aquí. Los logos salen de las marcas del país.">
            <Pair label="Antetítulo" value={content.brands.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, brands: { eyebrow } })} />
            <p className="text-sm text-zinc-500">
              Se muestran las marcas marcadas en el home que aparecen en proyectos de {spaceName}. El orden es el de esa lista, y cada logo abre su ficha.{' '}
              <a className="text-zinc-900 underline" href="/admin/country-brands">Ir a marcas del país</a>
            </p>
          </Section>

          <Section title="Cierre" help="El botón lleva a contacto.">
            <Pair label="Antetítulo" value={content.close.eyebrow} max={200} disabled={!canEdit || pending} onChange={eyebrow => change({ ...content, close: { ...content.close, eyebrow } })} />
            <Pair label="Título" value={content.close.title} max={200} rows={2} disabled={!canEdit || pending} onChange={title => change({ ...content, close: { ...content.close, title } })} />
            <Pair label="Texto" value={content.close.body} max={2000} rows={3} disabled={!canEdit || pending} onChange={body => change({ ...content, close: { ...content.close, body } })} />
            <Pair label="Botón" value={content.close.ctaLabel} max={200} disabled={!canEdit || pending} onChange={ctaLabel => change({ ...content, close: { ...content.close, ctaLabel } })} />
          </Section>
        </div>
        {canEdit && <div className="flex justify-end border-t border-zinc-100 px-5 py-4">{saveButton}</div>}
      </Card>
    </div>
  )
}

function Section({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-zinc-100 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {help && <p className="mt-0.5 text-xs text-zinc-500">{help}</p>}
      </div>
      {children}
    </section>
  )
}

function Pair({ label, value, max, rows, disabled, onChange }: { label: string; value: Copy; max: number; rows?: number; disabled: boolean; onChange: (value: Copy) => void }) {
  const field = (lang: 'es' | 'en') =>
    rows ? (
      <Textarea rows={rows} maxLength={max} disabled={disabled} value={value[lang]} onChange={event => onChange({ ...value, [lang]: event.target.value })} />
    ) : (
      <Input maxLength={max} disabled={disabled} value={value[lang]} onChange={event => onChange({ ...value, [lang]: event.target.value })} />
    )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
        {label} · Español
        {field('es')}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
        {label} · English
        {field('en')}
      </label>
    </div>
  )
}

function RowHead({ index, canEdit, onRemove }: { index: number; canEdit: boolean; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{String(index + 1).padStart(2, '0')}</p>
      {canEdit && (
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Quitar
        </Button>
      )}
    </div>
  )
}

function Photo({
  id,
  library,
  canEdit,
  pending,
  onChange,
  onUpload,
}: {
  id: string | null
  library: Map<string, AdminMedia>
  canEdit: boolean
  pending: boolean
  onChange: (id: string | null) => void
  onUpload: (ids: string[]) => Promise<string | null>
}) {
  const current = id ? library.get(id) : null
  return (
    <div className="flex flex-col items-start gap-2">
      <MediaThumb media={current ?? (id ? undefined : null)} className="h-20 w-32" />
      {canEdit && (
        <UploadButton
          kind="generic"
          countryCode={null}
          disabled={pending}
          label={id ? 'Reemplazar imagen' : 'Subir imagen'}
          onUploaded={async ids => {
            const uploaded = await onUpload(ids)
            if (uploaded) onChange(uploaded)
          }}
        />
      )}
      {canEdit && id && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => onChange(null)}>
          Quitar imagen
        </Button>
      )}
    </div>
  )
}
