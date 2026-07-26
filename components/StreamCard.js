// components/StreamCard.js

export default function StreamCard({ stream, onNext }) {
  if (!stream) return null

  const twitchUrl = `https://twitch.tv/${stream.user_login}`
  const thumb = stream.thumbnail_url
    ?.replace('{width}', '320')
    .replace('{height}', '180')

  return (
    <div className="stream-card">
      {/* TODO: <img src={thumb} alt={stream.user_name} /> */}
      {/* TODO: Streamer name — large heading */}
      {/* TODO: Game/category label */}
      {/* TODO: Viewer count badge */}
      {/* TODO: Tag pills — stream.tags.map(...) */}
      {/* TODO: Stream title — truncate at ~60 chars */}
      <div className="actions">
        <button onClick={() => window.open(twitchUrl, '_blank')}>
          Go to Stream ↗
        </button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
