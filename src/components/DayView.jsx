import React from 'react'
import { toISODate, format, fromISODate } from '../utils/dateUtils.js'
import { useAppState } from '../context/AppContext.jsx'
import DroppableSlot from './DroppableSlot.jsx'
import TimedBlock from './TimedBlock.jsx'
import ScheduledChip from './ScheduledChip.jsx'
import { getZodiacSign, getSunTimes, formatSunTime, getMoonInfo } from '../utils/astro.js'
import { useLocation } from '../hooks/useLocation.js'
import SunIcon from './SunIcon.jsx'
import MoonIcon from './MoonIcon.jsx'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

// Keep in sync with .day-hour-row's min-height in index.css.
const ROW_HEIGHT = 52

function hourLabel(hour) {
  return format(new Date(2000, 0, 1, hour), 'h a')
}

export default function DayView({ skyOverlay, moonOverlay }) {
  const state = useAppState()
  const anchor = fromISODate(state.view.anchorDate)
  const iso = toISODate(anchor)
  const listColor = Object.fromEntries(state.todoLists.map((l) => [l.id, l.color]))
  const { coords, error, requestLocation } = useLocation()

  function todosFor(hour) {
    return state.todos.filter((t) => {
      if (t.date !== iso) return false
      if (hour === null) return !t.time
      return t.time && parseInt(t.time, 10) === hour
    })
  }

  const zodiac = getZodiacSign(anchor)
  const sunTimes = coords ? getSunTimes(anchor, coords.lat, coords.lon) : null
  const moon = getMoonInfo(anchor, coords?.lat, coords?.lon)

  return (
    <div className="day-view">
      {skyOverlay && (
        <div className="sky-bar">
          <span className="sky-zodiac">
            <SunIcon zodiacSymbol={zodiac.symbol} zodiacName={zodiac.name} size={22} />
            {zodiac.name}
          </span>
          {sunTimes ? (
            <span className="sky-times">
              Sunrise {formatSunTime(sunTimes.sunrise)} · Sunset {formatSunTime(sunTimes.sunset)}
            </span>
          ) : (
            <button type="button" className="sky-enable" onClick={requestLocation}>
              Enable location for sunrise/sunset{error ? ` (${error})` : ''}
            </button>
          )}
        </div>
      )}

      {moonOverlay && (
        <div className="sky-bar">
          <span className="sky-zodiac">
            <MoonIcon phase={moon.phase} zodiacSymbol={moon.zodiac.symbol} zodiacName={moon.zodiac.name} size={22} />
            {moon.zodiac.name}
          </span>
          {coords ? (
            <span className="sky-times">
              Moonrise {formatSunTime(moon.rise)} · Moonset {formatSunTime(moon.set)}
            </span>
          ) : (
            <button type="button" className="sky-enable" onClick={requestLocation}>
              Enable location for moonrise/moonset{error ? ` (${error})` : ''}
            </button>
          )}
        </div>
      )}

      <DroppableSlot id={`date:${iso}`} className="day-allday-cell">
        <div className="time-label">all day</div>
        <div className="day-allday-items">
          {todosFor(null).map((t) => (
            <ScheduledChip key={t.id} todo={t} color={listColor[t.listId]} showCheckbox />
          ))}
        </div>
      </DroppableSlot>

      <div className="day-scroll">
        {HOURS.map((hour) => (
          <div className="day-hour-row" key={hour}>
            <div className="time-label">{hourLabel(hour)}</div>
            <DroppableSlot id={`slot:${iso}:${hour}`} className="day-hour-cell">
              {(() => {
                const cellTodos = todosFor(hour)
                return cellTodos.map((t, i) => (
                  <TimedBlock
                    key={t.id}
                    todo={t}
                    color={listColor[t.listId]}
                    rowHeight={ROW_HEIGHT}
                    gap={3}
                    index={i}
                    count={cellTodos.length}
                    showCheckbox
                  />
                ))
              })()}
            </DroppableSlot>
          </div>
        ))}
      </div>
    </div>
  )
}
