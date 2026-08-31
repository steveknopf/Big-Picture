import React from 'react'

const RAY_COUNT = 8

export default function SunIcon({ zodiacSymbol, zodiacName, size = 20, fill = false }) {
  const viewSize = fill ? 100 : size
  const R = viewSize / 2
  const rayInner = R * 0.72
  const rayOuter = R * 0.96
  const discR = R * 0.62

  const rays = []
  for (let i = 0; i < RAY_COUNT; i++) {
    const angle = (i / RAY_COUNT) * Math.PI * 2
    rays.push(
      <line
        key={i}
        x1={R + rayInner * Math.cos(angle)}
        y1={R + rayInner * Math.sin(angle)}
        x2={R + rayOuter * Math.cos(angle)}
        y2={R + rayOuter * Math.sin(angle)}
        className="sun-icon-ray"
        strokeWidth={viewSize * 0.06}
      />
    )
  }

  return (
    <div className={`sun-icon ${fill ? 'sun-icon-fill' : ''}`} style={fill ? undefined : { width: size, height: size }} title={zodiacName}>
      <svg
        width={fill ? '100%' : size}
        height={fill ? '100%' : size}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {rays}
        <circle cx={R} cy={R} r={discR} className="sun-icon-disc" />
      </svg>
      {zodiacSymbol && (
        <div className="sun-icon-zodiac" style={fill ? undefined : { fontSize: size * 0.5 }}>
          {zodiacSymbol}
        </div>
      )}
    </div>
  )
}
