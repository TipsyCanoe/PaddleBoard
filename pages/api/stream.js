// pages/api/stream.js — Server-side Twitch route (secrets stay here)

import { applyRateLimit } from '../../lib/rateLimit'

export default async function handler(req, res) {
  // Abuse guard runs before anything else: a single cast costs 4-12 upstream
  // Twitch calls against a quota shared by every user of this app, so no work
  // — and no upstream request — should happen before the limit is checked.
  if (!applyRateLimit(req, res)) return

  const {
    minViewers = 10,
    maxViewers = 500,
    language = 'en',
    excludeTags = '',
  } = req.query

  // TODO: import { fetchStreams } from '../../lib/twitch'
  // TODO: const streams = await fetchStreams({ language })
  // TODO: const excluded = excludeTags ? excludeTags.split(',') : []
  // TODO: filter by viewer_count >= minViewers && <= maxViewers
  // TODO: filter out any stream whose tags include an excluded tag
  // TODO: pick one at random from remaining
  // TODO: return { user_name, game_name, viewer_count, thumbnail_url, tags, title, user_login }

  // TODO (audit H-3): wrap the fetchStreams call in try/catch — it throws on
  // auth/upstream failure. Return a generic 502, never the raw Twitch body.
  // TODO (audit): clamp minViewers/maxViewers server-side, validate language,
  // cap minUptime, and reject non-GET with 405 before this point.

  res.setHeader('Cache-Control', 's-maxage=30')
  res.status(200).json({ message: 'TODO: return stream object' })
}
