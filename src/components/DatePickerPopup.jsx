import React, { useState } from 'react'
import { addMonths } from 'date-fns'
import { getMonthGrid, isSameMonth, isSameDay, toISODate, format } from '../utils/dateUtils.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DatePickerPopup({ anchor, onPick, onClose }) {
  const [viewMonth, setViewMonth] = useState(anchor)
  const monthDays = getMonthGrid(viewMonth)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h2>Jump to date</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="custom-calendar-header">
          <button type="button" onClick={() => setViewMonth((d) => addMonths(d, -1))} aria-label="Previous month">
            ‹
          </button>
          <span>{format(viewMonth, 'MMMM yyyy')}</span>
          <button type="button" onClick={() => setViewMonth((d) => addMonths(d, 1))} aria-label="Next month">
            ›
          </button>
        </div>
        <div className="custom-weekday-row">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="custom-calendar-grid">
          {monthDays.map((day) => {
            const iso = toISODate(day)
            return (
              <button
                key={iso}
                type="button"
                className={`custom-day ${isSameMonth(day, viewMonth) ? '' : 'outside'} ${
                  isSameDay(day, anchor) ? 'selected' : ''
                }`}
                onClick={() => {
                  onPick(iso)
                  onClose()
                }}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
