// pages/index.js — Main UI

import { useState } from 'react'
import BootSplash from '../components/BootSplash'
import FilterPanel from '../components/FilterPanel'
import StreamCard from '../components/StreamCard'

export default function Home() {
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    minViewers: 10,
    maxViewers: 500,
    language: 'en',
    excludeTags: ['Just Chatting'],
  })

  async function findStream() {
    setLoading(true)
    setError(null)
    // TODO: fetch('/api/stream?' + new URLSearchParams(filters))
    // TODO: const data = await res.json()
    // TODO: setStream(data)
    setLoading(false)
  }

  return (
    <div className="app">
      <BootSplash />
      <header>
        {/* TODO: PaddleBoard logo + tagline */}
      </header>
      <main>
        <FilterPanel filters={filters} onChange={setFilters} />
        <button onClick={findStream} disabled={loading}>
          {loading ? 'Paddling...' : 'Find a Stream'}
        </button>
        {error && <p className="error">{error}</p>}
        {stream && <StreamCard stream={stream} onNext={findStream} />}
      </main>
      <footer>
        {/* TODO: Salish Code / Tipsy_Canoe rotating promo slot */}
      </footer>
    </div>
  )
}
