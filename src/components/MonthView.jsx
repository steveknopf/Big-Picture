import React from 'react'
import { getMonthGrid, isSameDay, isSameMonth, toISODate, format, fromISODate } from '../utils/dateUtils.js'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import DroppableSlot from './DroppableSlot.jsx'
import ScheduledChip from './ScheduledChip.jsx'
import { getZodiacSign, getMoonInfo } from '../utils/astro.js'
import MoonIcon from './MoonIcon.jsx'
import SunIcon from './SunIcon.jsx'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthView({ skyOverlay, moonOverlay }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const anchor = fromISODate(state.view.anchorDate)
  const days = getMonthGrid(anchor)
  const today = new Date()

  function goToDay(day) {
    dispatch({ type: 'SET_VIEW', view: { level: 'day', anchorDate: toISODate(day) } })
  }

  const todosByDate = {}
  for (const t of state.todos) {
    if (!t.date) continue
    ;(todosByDate[t.date] ||= []).push(t)
  }
  const listColor = Object.fromEntries(state.todoLists.map((l) => [l.id, l.color]))

  return (
    <div className="month-view">
      <div className="weekday-row">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday-label">
            {w}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const iso = toISODate(day)
          const dayTodos = todosByDate[iso] || []
          const visible = dayTodos.slice(0, 3)
          const overflow = dayTodos.length - visible.length

          return (
            <DroppableSlot
              key={iso}
              id={`date:${iso}`}
              className={[
                'month-cell',
                isSameMonth(day, anchor) ? '' : 'outside',
                isSameDay(day, today) ? 'today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {(skyOverlay || moonOverlay) &&
                (() => {
                  const both = skyOverlay && moonOverlay
                  const sun = skyOverlay ? getZodiacSign(day) : null
                  const moon = moonOverlay ? getMoonInfo(day) : null
                  return (
                    <div className="month-cell-astro">
                      {sun && (
                        <div className={`month-astro-sun ${both ? 'split' : ''}`}>
                          <div className="month-astro-inner">
                            <SunIcon zodiacSymbol={sun.symbol} zodiacName={sun.name} fill />
                          </div>
                        </div>
                      )}
                      {moon && (
                        <div className={`month-astro-moon ${both ? 'split' : ''}`}>
                          <div className="month-astro-inner">
                            <MoonIcon
                              phase={moon.phase}
                              zodiacSymbol={moon.zodiac.symbol}
                              zodiacName={moon.zodiac.name}
                              fill
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              <div className="month-cell-header">
                <button type="button" className="day-number" onClick={() => goToDay(day)}>
                  {format(day, 'd')}
                </button>
              </div>
              <div className="day-todos">
                {visible.map((t) => (
                  <ScheduledChip key={t.id} todo={t} color={listColor[t.listId]} />
                ))}
                {overflow > 0 && <div className="todo-chip more">+{overflow} more</div>}
              </div>
            </DroppableSlot>
          )
        })}
      </div>
    </div>
  )
}
