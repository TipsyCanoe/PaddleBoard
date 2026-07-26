# 🏄 PaddleBoard

> *Find streamers the algorithm buried.*

Anti-algorithm Twitch discovery. Set your filters, land on a random mid-tier stream, redirect to their channel. No embeds. No front-page gatekeeping.

## Stack
- Next.js · Vercel
- Twitch Helix API (client credentials — no user login needed)
- Stateless — no database, no accounts

## Setup
```bash
npm install
cp .env.local.example .env.local   # fill in Twitch credentials
npm run dev
```

Get Twitch credentials at [dev.twitch.tv](https://dev.twitch.tv)

## Structure
```
pages/
  index.js          # Main UI
  api/stream.js     # Twitch fetch route (server-side)
lib/
  twitch.js         # Auth + stream helpers
components/
  BootSplash.js     # Intro animation + self-promo
  FilterPanel.js    # Viewer range, language, exclude tags
  StreamCard.js     # Match display + redirect buttons
public/sounds/
  boot.mp3          # Boot chime (add your own)
styles/
  globals.css       # Retro CRT aesthetic
```

## Filters (v0.1)
- Viewer range slider (default 10–500)
- Language selector
- Exclude tags (Just Chatting off by default)

## Coming v0.2
- Chat activity ratio filter (chatters/viewers — needs OAuth)
- Mid-tier sampling v2 (weighted random vs page-offset hack)

---
Salish Code LLC · Built by [Tipsy_Canoe](https://twitch.tv/Tipsy_Canoe)
