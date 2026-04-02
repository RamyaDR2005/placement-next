/**
 * Simple in-memory sliding-window rate limiter.
 * Works correctly for a single-process Node.js server (bare metal / PM2 cluster
 * with sticky sessions). For multi-instance deployments upgrade to Redis.
 */

interface Window {
    count: number
    resetAt: number
}

const store = new Map<string, Window>()

// Prune expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now()
    for (const [key, window] of store.entries()) {
        if (window.resetAt <= now) store.delete(key)
    }
}, 5 * 60 * 1000)

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetAt: number
}

/**
 * Check and increment the rate-limit counter for a given key.
 *
 * @param key     - Unique identifier (e.g. IP + route)
 * @param limit   - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    const existing = store.get(key)

    if (!existing || existing.resetAt <= now) {
        // New or expired window — start fresh
        const resetAt = now + windowMs
        store.set(key, { count: 1, resetAt })
        return { success: true, remaining: limit - 1, resetAt }
    }

    if (existing.count >= limit) {
        return { success: false, remaining: 0, resetAt: existing.resetAt }
    }

    existing.count += 1
    return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}

/**
 * Extract the real client IP from a Next.js request, honouring the
 * X-Forwarded-For header set by Nginx.
 */
export function getClientIp(request: Request): string {
    const xff = request.headers.get("x-forwarded-for")
    if (xff) return xff.split(",")[0].trim()
    const realIp = request.headers.get("x-real-ip")
    if (realIp) return realIp.trim()
    return "unknown"
}
