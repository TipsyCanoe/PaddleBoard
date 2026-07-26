// components/FilterPanel.js

export default function FilterPanel({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="filter-panel">
      {/* TODO: Dual range slider → minViewers / maxViewers, default 10–500 */}
      {/* TODO: Language dropdown, default 'en' */}
      {/* TODO: Exclude tags — pill input, pre-loaded: ['Just Chatting'] */}
      {/* TODO: Chat ratio toggle (coming v0.2 — needs OAuth, show disabled state) */}
      <p>FilterPanel — TODO</p>
    </div>
  )
}
