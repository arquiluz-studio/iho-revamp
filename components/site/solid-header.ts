import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

/** The fixed header starts cream with a dark logo when nothing dark sits behind it. */
export function solidHeader(header: ReactNode) {
  if (!isValidElement<{ solid?: boolean }>(header)) return header
  return cloneElement(header as ReactElement<{ solid?: boolean }>, { solid: true })
}
