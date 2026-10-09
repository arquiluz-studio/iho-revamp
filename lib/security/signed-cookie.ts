import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string {
  const value = process.env.IHO_COOKIE_SECRET
  if (!value) throw new Error('IHO_COOKIE_SECRET is not set')
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

/** `payload.signature`, where payload is base64url JSON that includes an `exp` (unix seconds). */
export function createSignedValue(data: Record<string, unknown>, maxAgeSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function readSignedValue<T extends Record<string, unknown>>(value: string | undefined | null): (T & { exp: number }) | null {
  if (!value) return null
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as T & { exp: number }
    return typeof data.exp === 'number' && data.exp > Date.now() / 1000 ? data : null
  } catch {
    return null
  }
}
