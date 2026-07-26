// lib/rateLimit.js — in-memory per-IP rate limiting (no database)
//
// Why this exists: one cast costs 4-12 Twitch API calls, and Twitch's app-token
// bucket is 800 points/min *per client ID, globally* — not per user. Roughly 66
// unthrottled requests/min exhausts the quota for every visitor at once, so a
// single script can take the whole app down. This bounds that.
//
// LIMITATION — read before relying on this: state lives in module scope, which
// on Vercel means per-lambda-instance. With N warm instances the effective
// global limit is N * LIMIT. It raises the cost of an attack; it is not a hard
// global cap. A true global limit needs shared state (Redis/Upstash), which is
// deliberately out of scope while the project stays database-free.

const WINDOW_MS = 60_000
const LIMIT = 10 // casts per window per IP
const MAX_TRACKED_IPS = 10_000 // hard ceiling so the map can't grow unbounded
const SWEEP_INTERVAL_MS = 60_000

const hits = new Map() // ip -> number[] of request timestamps, oldest first
let lastSweep = Date.now()

function sweep(now, windowMs) {
  for (const [ip, times] of hits) {
    const live = times.filter((t) => now - t < windowMs)
    if (live.length === 0) hits.delete(ip)
    else hits.set(ip, live)
  }
  lastSweep = now
}

// Vercel sets x-real-ip / x-forwarded-for at the edge and overwrites whatever
// the client sent. Behind any other proxy (or none) these headers are
// client-supplied and trivially spoofable — if this ever runs outside Vercel,
// trust only the socket address.
export function clientIp(req) {
  const real = req.headers?.['x-real-ip']
  if (real) return String(real).trim()

  const fwd = req.headers?.['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()

  return req.socket?.remoteAddress ?? 'unknown'
}

export function rateLimit(req, { limit = LIMIT, windowMs = WINDOW_MS } = {}) {
  const now = Date.now()
  if (now - lastSweep > SWEEP_INTERVAL_MS) sweep(now, windowMs)

  const ip = clientIp(req)
  // sliding window: keep only timestamps still inside the window
  const times = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)

  if (times.length >= limit) {
    hits.set(ip, times)
    const retryAfterMs = windowMs - (now - times[0])
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000))
    }
  }

  // Admitting an unseen IP when the map is full would let a distributed flood
  // grow memory without bound. Sweep, and if still full, fail CLOSED — the
  // thing being protected is the shared Twitch quota, and a map at 10k live
  // IPs/min already means an attack rather than organic traffic.
  if (!hits.has(ip) && hits.size >= MAX_TRACKED_IPS) {
    sweep(now, windowMs)
    if (hits.size >= MAX_TRACKED_IPS) {
      return { allowed: false, limit, remaining: 0, retryAfterSec: 60 }
    }
  }

  times.push(now)
  hits.set(ip, times)
  return { allowed: true, limit, remaining: limit - times.length, retryAfterSec: 0 }
}

// Applies the limit and writes the response itself when blocked.
// Returns true if the caller should continue handling the request.
export function applyRateLimit(req, res, opts) {
  const result = rateLimit(req, opts)

  res.setHeader('X-RateLimit-Limit', String(result.limit))
  res.setHeader('X-RateLimit-Remaining', String(result.remaining))

  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfterSec))
    // Never let a CDN cache a 429 — a cached rejection would be served to
    // every other visitor sharing that edge node.
    res.setHeader('Cache-Control', 'no-store')
    res.status(429).json({ error: 'Rate limit exceeded — wait a moment and recast.' })
    return false
  }

  return true
}

// Test-only: module scope persists across requests by design.
export function __resetRateLimit() {
  hits.clear()
  lastSweep = Date.now()
}
