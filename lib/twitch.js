// lib/twitch.js — Twitch API helpers

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const HELIX_STREAMS = 'https://api.twitch.tv/helix/streams'
const EXPIRY_SKEW_MS = 60_000 // refresh a minute early

let cachedToken = null // { value, expiresAt }
let inFlight = null    // collapses concurrent refreshes into one request

async function requestToken() {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  })

  // status only — the error body echoes request params, never log or forward it
  if (!response.ok) throw new Error(`twitch auth failed: ${response.status}`)

  const data = await response.json()
  if (!data.access_token) throw new Error('twitch auth failed: no access_token')

  return {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - EXPIRY_SKEW_MS
  }
}

export async function getAccessToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }
  if (!inFlight) {
    inFlight = requestToken()
      .then((t) => { cachedToken = t; return t })
      .finally(() => { inFlight = null })
  }
  return (await inFlight).value
}

function streamsUrl(language, cursor) {
  const params = new URLSearchParams({ language, first: '100' })
  if (cursor) params.set('after', cursor)
  return `${HELIX_STREAMS}?${params}`
}

function helix(url, token) {
  return fetch(url, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  })
}

async function helixJson(url) {
  let res = await helix(url, await getAccessToken())

  // token rejected — refresh exactly once, then give up. No recursion: this
  // calls helix() directly, so a persistent 401 cannot loop.
  if (res.status === 401) {
    res = await helix(url, await getAccessToken({ forceRefresh: true }))
  }

  if (!res.ok) throw new Error(`twitch helix failed: ${res.status}`)
  return res.json()
}

export async function fetchStreams({ language = 'en' } = {}) {
  const pageOffset = Math.floor(Math.random() * 8) + 3
  let cursor = null

  for (let i = 0; i < pageOffset; i++) {
    const json = await helixJson(streamsUrl(language, cursor))
    cursor = json.pagination?.cursor
    if (!cursor) break
  }

  const json = await helixJson(streamsUrl(language, cursor))
  return json.data ?? [] // never undefined
}
