import React from 'react'

// Three-layer construction: a dark base circle, a lit half (right if waxing,
// left if waning), and an ellipse that either eats into the lit half
// (crescent, near new moon) or extends beyond it (gibbous, near full moon).
export default function MoonIcon({ phase, zodiacSymbol, zodiacName, size = 20 }) {
  const R = size / 2
  const waxing = phase < 0.5
  const nearNew = phase < 0.25 || phase > 0.75
  const rx = R * Math.abs(Math.cos(2 * Math.PI * phase))
  const halfSweep = waxing ? 1 : 0
  const ellipseFill = nearNew ? 'moon-icon-dark' : 'moon-icon-lit'

  return (
    <div className="moon-icon" style={{ width: size, height: size }} title={zodiacName}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={R} cy={R} r={R} className="moon-icon-dark" />
        <path d={`M ${R},0 A ${R},${R} 0 0 ${halfSweep} ${R},${size} Z`} className="moon-icon-lit" />
        <ellipse cx={R} cy={R} rx={rx} ry={R} className={ellipseFill} />
      </svg>
      {zodiacSymbol && (
        <div className="moon-icon-zodiac" style={{ fontSize: size * 0.55 }}>
          {zodiacSymbol}
        </div>
      )}
    </div>
  )
}
