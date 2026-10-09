import 'server-only'
import { headers } from 'next/headers'

/** Origin of the current admin request (used for auth redirect URLs). */
export async function adminOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const protocol = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}
