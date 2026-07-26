// lib/twitch.js — Twitch API helpers

let cachedToken = null

export async function getAccessToken() {
  if (cachedToken) return cachedToken
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  })
  const data = await response.json()
  cachedToken = data.access_token
  return cachedToken
}

export async function fetchStreams({ language = 'en' } = {}) {
  const token = await getAccessToken()
  const pageOffset = Math.floor(Math.random() * 8) + 3  
  let cursor = null
  for (let i = 0; i < pageOffset; i++) {
    const res = await fetch(  
      `https://api.twitch.tv/helix/streams?language=${language}&first=100${cursor ? `&after=${cursor}` : ''}`,
      {                       
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    )                         
    const json = await res.json()  
    cursor = json.pagination?.cursor  
    if (!cursor) break        
  }

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?language=${language}&first=100${cursor ? `&after=${cursor}` : ''}`,
    {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    }
  )
  const json = await res.json()
  return json.data
}
