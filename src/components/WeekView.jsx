import React from 'react'
import { getWeekDays, toISODate, isSameDay, format, fromISODate } from '../utils/dateUtils.js'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import DroppableSlot from './DroppableSlot.jsx'
import TimedBlock from './TimedBlock.jsx'
import ScheduledChip from './ScheduledChip.jsx'

// 6am - 11pm covers a normal waking day without an endless scroll.
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

// Keep in sync with .week-hour-row's min-height in index.css — timed blocks
// are positioned in pixels against this so a 3-hour todo visually spans 3 rows.
const ROW_HEIGHT = 40

function hourLabel(hour) {
  return format(new Date(2000, 0, 1, hour), 'h a')
}

export default function WeekView() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const anchor = fromISODate(state.view.anchorDate)
  const days = getWeekDays(anchor)
  const today = new Date()
  const listColor = Object.fromEntries(state.todoLists.map((l) => [l.id, l.color]))

  function goToDay(day) {
    dispatch({ type: 'SET_VIEW', view: { level: 'day', anchorDate: toISODate(day) } })
  }

  function todosFor(iso, hour) {
    return state.todos.filter((t) => {
      if (t.date !== iso) return false
      if (hour === null) return !t.time
      return t.time && parseInt(t.time, 10) === hour
    })
  }

  return (
    <div className="week-view">
      <div className="week-grid-header">
        <div className="time-gutter" />
        {days.map((day) => {
          const iso = toISODate(day)
          return (
            <button
              key={iso}
              type="button"
              className={`week-day-header ${isSameDay(day, today) ? 'today' : ''}`}
              onClick={() => goToDay(day)}
            >
              <div className="week-day-name">{format(day, 'EEE')}</div>
              <div className="week-day-num">{format(day, 'd')}</div>
            </button>
          )
        })}
      </div>

      <div className="week-allday-row">
        <div className="time-gutter small-label">all day</div>
        {days.map((day) => {
          const iso = toISODate(day)
          return (
            <DroppableSlot key={iso} id={`date:${iso}`} className="week-allday-cell">
              {todosFor(iso, null).map((t) => (
                <ScheduledChip key={t.id} todo={t} color={listColor[t.listId]} className="small" />
              ))}
            </DroppableSlot>
          )
        })}
      </div>

      <div className="week-scroll">
        {HOURS.map((hour) => (
          <div className="week-hour-row" key={hour}>
            <div className="time-gutter small-label">{hourLabel(hour)}</div>
            {days.map((day) => {
              const iso = toISODate(day)
              return (
                <DroppableSlot key={iso} id={`slot:${iso}:${hour}`} className="week-hour-cell">
                  {todosFor(iso, hour).map((t) => (
                    <TimedBlock
                      key={t.id}
                      todo={t}
                      color={listColor[t.listId]}
                      rowHeight={ROW_HEIGHT}
                      gap={2}
                      small
                    />
                  ))}
                </DroppableSlot>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
