// pages/api/stream.js — Server-side Twitch route (secrets stay here)

export default async function handler(req, res) {
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

  res.setHeader('Cache-Control', 's-maxage=30')
  res.status(200).json({ message: 'TODO: return stream object' })
}
