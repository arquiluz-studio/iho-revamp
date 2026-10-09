import 'server-only'
import { headers } from 'next/headers'

/** Verifies a Cloudflare Turnstile token. Without TURNSTILE_SECRET_KEY (local dev) the check is skipped. */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim()
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  if (!res.ok) return false
  const data = (await res.json()) as { success?: boolean }
  return Boolean(data.success)
}

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

/**
 * Best-effort per-instance rate limit (serverless instances don't share memory). Turnstile is the real gate;
 * this only slows down bursts from a single client.
 */
export async function isRateLimited(bucket: string): Promise<boolean> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_PER_WINDOW
}
