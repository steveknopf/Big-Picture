import React from 'react'
import { toISODate, format, fromISODate } from '../utils/dateUtils.js'
import { useAppState } from '../context/AppContext.jsx'
import DroppableSlot from './DroppableSlot.jsx'
import TimedBlock from './TimedBlock.jsx'
import ScheduledChip from './ScheduledChip.jsx'
import { getZodiacSign, getSunTimes, formatSunTime } from '../utils/astro.js'
import { useLocation } from '../hooks/useLocation.js'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

// Keep in sync with .day-hour-row's min-height in index.css.
const ROW_HEIGHT = 52

function hourLabel(hour) {
  return format(new Date(2000, 0, 1, hour), 'h a')
}

export default function DayView({ skyOverlay }) {
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

  return (
    <div className="day-view">
      {skyOverlay && (
        <div className="sky-bar">
          <span className="sky-zodiac">
            {zodiac.symbol} {zodiac.name}
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

      <DroppableSlot id={`date:${iso}`} className="day-allday-cell">
        <div className="time-label">all day</div>
        <div className="day-allday-items">
          {todosFor(null).map((t) => (
            <ScheduledChip key={t.id} todo={t} color={listColor[t.listId]} />
          ))}
        </div>
      </DroppableSlot>

      <div className="day-scroll">
        {HOURS.map((hour) => (
          <div className="day-hour-row" key={hour}>
            <div className="time-label">{hourLabel(hour)}</div>
            <DroppableSlot id={`slot:${iso}:${hour}`} className="day-hour-cell">
              {todosFor(hour).map((t) => (
                <TimedBlock key={t.id} todo={t} color={listColor[t.listId]} rowHeight={ROW_HEIGHT} gap={3} />
              ))}
            </DroppableSlot>
          </div>
        ))}
      </div>
    </div>
  )
}
