import Link from 'next/link'
import { forwardRef, type ComponentProps, type ReactNode } from 'react'

/** Minimal shadcn/ui-style primitives for the admin (admin-only stylesheet, public site untouched). */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
  outline: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50',
  ghost: 'text-zinc-700 hover:bg-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
}
const BUTTON_SIZES: Record<ButtonSize, string> = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-sm' }

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  )
}

export const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }>(
  function Button({ variant, size, className, type = 'button', ...props }, ref) {
    return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
  },
)

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

const FIELD = 'w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500'

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(FIELD, 'h-9', className)} {...props} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(FIELD, 'py-2 leading-relaxed', className)} {...props} />
})

export const Checkbox = forwardRef<HTMLInputElement, Omit<ComponentProps<'input'>, 'type'>>(function Checkbox({ className, ...props }, ref) {
  return <input ref={ref} type="checkbox" className={cn('size-4 rounded border-zinc-300 accent-zinc-900', className)} {...props} />
})

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-sm font-medium text-zinc-800', className)} {...props} />
}

export function FieldShell({
  label,
  htmlFor,
  help,
  error,
  className,
  children,
}: {
  label: ReactNode
  htmlFor?: string
  help?: ReactNode
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : help ? <p className="text-xs text-zinc-500">{help}</p> : null}
    </div>
  )
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-lg border border-zinc-200 bg-white shadow-xs', className)} {...props} />
}

export function CardHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

const BADGE_TONES = {
  neutral: 'bg-zinc-100 text-zinc-700',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
} as const
export type BadgeTone = keyof typeof BADGE_TONES

export function Badge({ tone = 'neutral', className, ...props }: ComponentProps<'span'> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent', BADGE_TONES[tone], className)}
      {...props}
    />
  )
}

export const STATUS_TONES: Record<string, BadgeTone> = {
  draft: 'amber',
  published: 'green',
  archived: 'neutral',
  pending: 'amber',
  confirmed: 'green',
  waitlist: 'blue',
  cancelled: 'neutral',
  attended: 'green',
  new: 'blue',
  contacted: 'amber',
  qualified: 'green',
  closed: 'neutral',
  ready: 'green',
  failed: 'red',
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500">{children}</div>
}

export function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'red' | 'green' | 'amber'; children: ReactNode }) {
  const tones = {
    neutral: 'border-zinc-200 bg-zinc-50 text-zinc-700',
    red: 'border-red-200 bg-red-50 text-red-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  }
  return <div className={cn('rounded-md border px-3 py-2 text-sm', tones[tone])}>{children}</div>
}
