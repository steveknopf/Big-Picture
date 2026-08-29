import React from 'react'
import { format, startOfYear, addMonths } from 'date-fns'
import { getMonthGrid, isSameMonth, isSameDay, toISODate, fromISODate } from '../utils/dateUtils.js'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function YearView() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const anchor = fromISODate(state.view.anchorDate)
  const yearStart = startOfYear(anchor)
  const today = new Date()

  const scheduledDates = new Set(state.todos.filter((t) => t.date).map((t) => t.date))

  function goToMonth(monthDate) {
    dispatch({ type: 'SET_VIEW', view: { level: 'month', anchorDate: toISODate(monthDate) } })
  }

  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i))

  return (
    <div className="year-view">
      {months.map((monthDate) => {
        const days = getMonthGrid(monthDate)
        return (
          <button
            key={toISODate(monthDate)}
            type="button"
            className="mini-month"
            onClick={() => goToMonth(monthDate)}
          >
            <div className="mini-month-title">{format(monthDate, 'MMMM')}</div>
            <div className="mini-weekday-row">
              {WEEKDAYS.map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <div className="mini-month-grid">
              {days.map((day) => {
                const iso = toISODate(day)
                return (
                  <span
                    key={iso}
                    className={[
                      'mini-day',
                      isSameMonth(day, monthDate) ? '' : 'outside',
                      isSameDay(day, today) ? 'today' : '',
                      scheduledDates.has(iso) ? 'has-events' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {format(day, 'd')}
                  </span>
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}
