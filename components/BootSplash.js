// components/BootSplash.js
// Boot animation + skippable self-promo slot
// Plays once per session only

import { useState, useEffect } from 'react'

export default function BootSplash() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('splash_seen')) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('splash_seen', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="boot-splash">
      {/* TODO: Water droplet falls from top of screen */}
      {/* TODO: Splash impact → ripple out → logo assembles from center */}
      {/* TODO: new Audio('/sounds/boot.mp3').play() on mount */}
      {/* TODO: Skip button appears after 1500ms */}
      {/* TODO: Auto-dismiss after 4000ms */}

      {/* Self-promo ad slot — always skippable */}
      {/* TODO: Rotate between Salish Code + Tipsy_Canoe cards */}
      {/* TODO: Display for 3 seconds, then show main UI */}

      <button className="skip-btn" onClick={dismiss}>Skip</button>
    </div>
  )
}
