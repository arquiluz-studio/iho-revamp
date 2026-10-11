'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './ui'

export type DropdownOption = { value: string; label: string }

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden>
      <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M5 10.5l3.5 3.5L15 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden>
      <circle cx="9" cy="9" r="5.25" />
      <path d="M13 13l3.5 3.5" strokeLinecap="round" />
    </svg>
  )
}

const SEARCH_THRESHOLD = 8
const PANEL_MAX_HEIGHT = 288

const SIZES = {
  sm: 'min-h-8 rounded-md px-2.5 text-xs',
  md: 'min-h-9 rounded-lg px-3 text-sm',
} as const

const TRIGGER =
  'flex w-full items-center gap-2 border border-zinc-300 bg-white text-left text-zinc-900 shadow-xs transition-colors hover:border-zinc-400 focus-visible:border-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900'

type Position = { left: number; width: number; top?: number; bottom?: number }

/** Floating panel anchored to a trigger; rendered in a portal so scrolling tables and cards never clip it. */
function usePopover(triggerRef: RefObject<HTMLElement | null>, panelRef: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom
    const width = Math.max(rect.width, 192)
    const left = Math.min(rect.left, window.innerWidth - width - 8)
    setPosition(
      below < PANEL_MAX_HEIGHT + 16 && rect.top > below
        ? { left, width, bottom: window.innerHeight - rect.top + 4 }
        : { left, width, top: rect.bottom + 4 },
    )
  }, [triggerRef])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    const onScroll = (event: Event) => {
      if (!panelRef.current?.contains(event.target as Node)) place()
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', place)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', place)
    }
  }, [open, place, triggerRef, panelRef])

  return { open, setOpen, position, place }
}

function Panel({
  panelRef,
  position,
  searchable,
  query,
  onQuery,
  onKeyDown,
  children,
}: {
  panelRef: RefObject<HTMLDivElement | null>
  position: Position | null
  searchable: boolean
  query: string
  onQuery: (query: string) => void
  onKeyDown: (event: KeyboardEvent) => void
  children: ReactNode
}) {
  if (!position) return null
  return createPortal(
    <div
      ref={panelRef}
      style={{ left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
      className="fixed z-[60] flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-900/10"
      onKeyDown={onKeyDown}
    >
      {searchable && (
        <div className="flex items-center gap-2 border-b border-zinc-100 px-2.5">
          <SearchIcon className="size-4 shrink-0 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={e => onQuery(e.target.value)}
            placeholder="Buscar…"
            className="h-9 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
      )}
      <ul role="listbox" className="overflow-y-auto p-1" style={{ maxHeight: PANEL_MAX_HEIGHT }}>
        {children}
      </ul>
    </div>,
    document.body,
  )
}

function OptionRow({
  label,
  selected,
  active,
  muted,
  onPick,
  onHover,
}: {
  label: string
  selected: boolean
  active: boolean
  muted?: boolean
  onPick: () => void
  onHover: () => void
}) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])
  return (
    <li ref={ref} role="option" aria-selected={selected}>
      <button
        type="button"
        tabIndex={-1}
        onClick={onPick}
        onMouseEnter={onHover}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
          active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700',
          selected && 'font-medium text-zinc-900',
          muted && !selected && 'text-zinc-400',
        )}
      >
        <span className="flex-1 truncate">{label}</span>
        {selected && <CheckIcon className="size-4 shrink-0 text-zinc-900" />}
      </button>
    </li>
  )
}

function useListNavigation(count: number, open: boolean, onPick: (index: number) => void, close: () => void) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!open) return
    setActive(index => Math.min(index, Math.max(count - 1, 0)))
  }, [count, open])
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') setActive(i => Math.min(i + 1, count - 1))
    else if (event.key === 'ArrowUp') setActive(i => Math.max(i - 1, 0))
    else if (event.key === 'Enter' && count > 0) onPick(active)
    else if (event.key === 'Escape') close()
    else if (event.key === 'Tab') return close()
    else return
    event.preventDefault()
  }
  return { active, setActive, onKeyDown }
}

const matches = (option: DropdownOption, query: string) => option.label.toLowerCase().includes(query.trim().toLowerCase())

export function Dropdown({
  id,
  value,
  options,
  onChange,
  emptyLabel,
  placeholder = 'Selecciona…',
  disabled,
  size = 'md',
  className,
}: {
  id?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  /** Adds a first option with an empty value (e.g. "Ninguno"). */
  emptyLabel?: string
  placeholder?: string
  disabled?: boolean
  size?: keyof typeof SIZES
  className?: string
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { open, setOpen, position } = usePopover(triggerRef, panelRef)
  const [query, setQuery] = useState('')
  const all = emptyLabel !== undefined ? [{ value: '', label: emptyLabel }, ...options] : options
  const searchable = options.length > SEARCH_THRESHOLD
  const visible = query ? all.filter(o => matches(o, query)) : all
  const current = all.find(o => o.value === value)

  const close = () => {
    setOpen(false)
    setQuery('')
    triggerRef.current?.focus()
  }
  const pick = (index: number) => {
    const option = visible[index]
    if (!option) return
    close()
    if (option.value !== value) onChange(option.value)
  }
  const nav = useListNavigation(visible.length, open, pick, close)
  const toggle = () => {
    if (open) return close()
    nav.setActive(Math.max(all.findIndex(o => o.value === value), 0))
    setOpen(true)
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={event => {
          if (open) return nav.onKeyDown(event)
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            toggle()
          }
        }}
        className={cn(
          TRIGGER,
          SIZES[size],
          open && 'border-zinc-900 ring-1 ring-zinc-900',
          'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 disabled:hover:border-zinc-300',
          className,
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', (!current || current.value === '') && 'text-zinc-400')}>
          {current?.label ?? placeholder}
        </span>
        <ChevronIcon className={cn('size-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <Panel panelRef={panelRef} position={position} searchable={searchable} query={query} onQuery={setQuery} onKeyDown={nav.onKeyDown}>
          {visible.map((option, index) => (
            <OptionRow
              key={option.value}
              label={option.label}
              selected={option.value === value}
              active={index === nav.active}
              muted={option.value === ''}
              onPick={() => pick(index)}
              onHover={() => nav.setActive(index)}
            />
          ))}
          {visible.length === 0 && <li className="px-2 py-1.5 text-xs text-zinc-400">Sin resultados</li>}
        </Panel>
      )}
    </>
  )
}

export function MultiDropdown({
  id,
  value,
  options,
  onChange,
  placeholder = 'Ninguno seleccionado',
  disabled,
}: {
  id?: string
  value: string[]
  options: DropdownOption[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { open, setOpen, position, place } = usePopover(triggerRef, panelRef)
  const [query, setQuery] = useState('')
  const selected = new Set(value)

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place, value.length])
  const labelOf = new Map(options.map(o => [o.value, o.label]))
  const searchable = options.length > SEARCH_THRESHOLD
  const visible = query ? options.filter(o => matches(o, query)) : options

  const close = () => {
    setOpen(false)
    setQuery('')
    triggerRef.current?.focus()
  }
  const toggleValue = (v: string) => onChange(selected.has(v) ? value.filter(x => x !== v) : [...value, v])
  const nav = useListNavigation(visible.length, open, index => visible[index] && toggleValue(visible[index].value), close)
  const toggle = () => {
    if (disabled) return
    if (open) return close()
    nav.setActive(0)
    setOpen(true)
  }

  return (
    <>
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        onClick={toggle}
        onKeyDown={event => {
          if (open) return nav.onKeyDown(event)
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault()
            toggle()
          }
        }}
        className={cn(
          TRIGGER,
          SIZES.md,
          'cursor-pointer py-1.5',
          open && 'border-zinc-900 ring-1 ring-zinc-900',
          disabled && 'cursor-not-allowed bg-zinc-50 hover:border-zinc-300',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {value.length === 0 && <span className="text-zinc-400">{placeholder}</span>}
          {value.map(v => (
            <span key={v} className="inline-flex max-w-full items-center gap-1 rounded-md bg-zinc-100 py-0.5 pl-2 pr-1 text-xs font-medium text-zinc-800">
              <span className="truncate">{labelOf.get(v) ?? v}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Quitar ${labelOf.get(v) ?? v}`}
                  className="rounded px-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                  onClick={event => {
                    event.stopPropagation()
                    onChange(value.filter(x => x !== v))
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        <ChevronIcon className={cn('size-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </div>
      {open && (
        <Panel panelRef={panelRef} position={position} searchable={searchable} query={query} onQuery={setQuery} onKeyDown={nav.onKeyDown}>
          {visible.map((option, index) => (
            <OptionRow
              key={option.value}
              label={option.label}
              selected={selected.has(option.value)}
              active={index === nav.active}
              onPick={() => toggleValue(option.value)}
              onHover={() => nav.setActive(index)}
            />
          ))}
          {visible.length === 0 && <li className="px-2 py-1.5 text-xs text-zinc-400">Sin resultados</li>}
        </Panel>
      )}
    </>
  )
}
