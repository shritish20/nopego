/**
 * In-process rate limiter (production-grade in-memory, no external service required).
 * Works in Next.js standalone/server mode.
 * Swap the store for Redis when scaling to multiple instances.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Prune stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  limit: number
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export function rateLimit(
  identifier: string,
  { limit, windowSeconds }: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const existing = store.get(identifier)

  if (!existing || now > existing.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, reset: now + windowMs }
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, reset: existing.resetAt }
  }

  existing.count++
  return { success: true, remaining: limit - existing.count, reset: existing.resetAt }
}

/** Pre-configured limiters for common routes */
export const limiters = {
  /** Login: 10 attempts per 15 minutes */
  login: (ip: string) => rateLimit(`login:${ip}`, { limit: 10, windowSeconds: 900 }),
  /** Register: 5 attempts per 15 minutes */
  register: (ip: string) => rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 }),
  /** Chat: 20 messages per minute */
  chat: (ip: string) => rateLimit(`chat:${ip}`, { limit: 20, windowSeconds: 60 }),
  /** Pincode check: 30 per minute */
  pincode: (ip: string) => rateLimit(`pincode:${ip}`, { limit: 30, windowSeconds: 60 }),
  /** Review submit: 5 per hour */
  review: (userId: string) => rateLimit(`review:${userId}`, { limit: 5, windowSeconds: 3600 }),
}

/**
 * Extracts the real client IP from a Next.js request.
 * Works behind proxies (Vercel, Nginx, Cloudflare, etc).
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}
