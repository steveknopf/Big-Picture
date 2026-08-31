import React from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { fromISODate, toISODate } from '../utils/dateUtils.js'

const LEVELS = ['year', 'month', 'week', 'day']

export default function Header({
  drawerOpen,
  onToggleDrawer,
  skyOverlay,
  onToggleSky,
  moonOverlay,
  onToggleMoon,
}) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { level, anchorDate } = state.view
  const anchor = fromISODate(anchorDate)

  function setLevel(nextLevel) {
    dispatch({ type: 'SET_VIEW', view: { level: nextLevel, anchorDate: toISODate(anchor) } })
  }

  function zoomIn() {
    const idx = LEVELS.indexOf(level)
    if (idx < LEVELS.length - 1) setLevel(LEVELS[idx + 1])
  }

  function zoomOut() {
    const idx = LEVELS.indexOf(level)
    if (idx > 0) setLevel(LEVELS[idx - 1])
  }

  function navigate(direction) {
    dispatch({ type: 'NAVIGATE', direction })
  }

  function label() {
    if (level === 'year') return format(anchor, 'yyyy')
    if (level === 'month') return format(anchor, 'MMMM yyyy')
    if (level === 'week') {
      const start = startOfWeek(anchor, { weekStartsOn: 0 })
      const end = endOfWeek(anchor, { weekStartsOn: 0 })
      const sameMonth = format(start, 'MMM') === format(end, 'MMM')
      return sameMonth
        ? `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
        : `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
    }
    return format(anchor, 'EEEE, MMM d, yyyy')
  }

  return (
    <header className="app-header">
      <div className="app-header-row">
        <button
          type="button"
          className="icon-btn"
          onClick={zoomOut}
          disabled={level === 'year'}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>

        <div className="header-center">
          <button type="button" className="nav-btn" onClick={() => navigate('prev')} aria-label="Previous">
            ‹
          </button>
          <h1 className="header-label">{label()}</h1>
          <button type="button" className="nav-btn" onClick={() => navigate('next')} aria-label="Next">
            ›
          </button>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={zoomIn}
          disabled={level === 'day'}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
      </div>

      <div className="app-header-row secondary">
        <div className="level-pips">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`level-pip ${l === level ? 'active' : ''}`}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="header-actions">
          <button type="button" className="text-btn" onClick={() => navigate('today')}>
            Today
          </button>
          <button
            type="button"
            className={`text-btn sky-toggle ${skyOverlay ? 'active' : ''}`}
            onClick={onToggleSky}
            aria-label="Toggle sunrise, sunset, and zodiac overlay"
          >
            Sky {skyOverlay ? '☀' : '☾'}
          </button>
          <button
            type="button"
            className={`text-btn moon-toggle ${moonOverlay ? 'active' : ''}`}
            onClick={onToggleMoon}
            aria-label="Toggle moon phase, zodiac, and rise/set overlay"
          >
            Moon 🌙
          </button>
          <button
            type="button"
            className={`text-btn drawer-toggle ${drawerOpen ? 'active' : ''}`}
            onClick={onToggleDrawer}
          >
            {drawerOpen ? 'Hide to-dos ▲' : 'To-dos ▼'}
          </button>
        </div>
      </div>
    </header>
  )
}
