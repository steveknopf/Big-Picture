import React, { useState } from 'react'
import { addWeeks, addMonths } from 'date-fns'
import { useAppDispatch } from '../context/AppContext.jsx'
import { getMonthGrid, isSameMonth, toISODate, format, addDays } from '../utils/dateUtils.js'

// Matches the 6am-11pm range Week/Day view actually render, so anything
// scheduled here is guaranteed to show up on the calendar.
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// There's no recurrence engine — repeating just materializes this many
// standalone scheduled instances up front.
const OCCURRENCE_COUNT = { daily: 30, weekly: 12, monthly: 12 }

function hourLabel(hour) {
  return format(new Date(2000, 0, 1, hour), 'h a')
}

export default function SchedulePopup({ todo, onClose }) {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState('frequency') // 'frequency' | 'time' | 'custom'
  const [frequency, setFrequency] = useState(null)
  const [hour, setHour] = useState(9)
  const [customAnchor, setCustomAnchor] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState(() => new Set())

  function chooseFrequency(freq) {
    if (freq === 'custom') {
      setStep('custom')
    } else {
      setFrequency(freq)
      setStep('time')
    }
  }

  function applyDates(dates, time) {
    if (dates.length === 0) return
    dispatch({ type: 'SCHEDULE_TODO', id: todo.id, date: dates[0], time, duration: time ? 1 : null })
    for (let i = 1; i < dates.length; i++) {
      dispatch({ type: 'CLONE_TODO_TO_DATE', sourceId: todo.id, date: dates[i], time, duration: time ? 1 : null })
    }
  }

  function confirmRepeating() {
    const count = OCCURRENCE_COUNT[frequency]
    const dates = []
    let d = new Date()
    for (let i = 0; i < count; i++) {
      dates.push(toISODate(d))
      if (frequency === 'daily') d = addDays(d, 1)
      else if (frequency === 'weekly') d = addWeeks(d, 1)
      else if (frequency === 'monthly') d = addMonths(d, 1)
    }
    applyDates(dates, String(hour))
    onClose()
  }

  function toggleCustomDate(iso) {
    setSelectedDates((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  function confirmCustom() {
    applyDates([...selectedDates].sort(), null)
    onClose()
  }

  const monthDays = step === 'custom' ? getMonthGrid(customAnchor) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h2>Repeat "{todo.text}"</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {step === 'frequency' && (
          <div className="frequency-options">
            <button type="button" onClick={() => chooseFrequency('daily')}>
              Daily
            </button>
            <button type="button" onClick={() => chooseFrequency('weekly')}>
              Weekly
            </button>
            <button type="button" onClick={() => chooseFrequency('monthly')}>
              Monthly
            </button>
            <button type="button" className="custom-option" onClick={() => chooseFrequency('custom')}>
              Custom
            </button>
          </div>
        )}

        {step === 'time' && (
          <div className="time-step">
            <label htmlFor="repeat-time">Time</label>
            <select
              id="repeat-time"
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button type="button" className="modal-back" onClick={() => setStep('frequency')}>
                Back
              </button>
              <button type="button" className="modal-confirm" onClick={confirmRepeating}>
                Schedule
              </button>
            </div>
          </div>
        )}

        {step === 'custom' && (
          <div className="custom-step">
            <div className="custom-calendar-header">
              <button type="button" onClick={() => setCustomAnchor((d) => addMonths(d, -1))} aria-label="Previous month">
                ‹
              </button>
              <span>{format(customAnchor, 'MMMM yyyy')}</span>
              <button type="button" onClick={() => setCustomAnchor((d) => addMonths(d, 1))} aria-label="Next month">
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
                const selected = selectedDates.has(iso)
                return (
                  <button
                    key={iso}
                    type="button"
                    className={`custom-day ${isSameMonth(day, customAnchor) ? '' : 'outside'} ${
                      selected ? 'selected' : ''
                    }`}
                    onClick={() => toggleCustomDate(iso)}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-back" onClick={() => setStep('frequency')}>
                Back
              </button>
              <button
                type="button"
                className="modal-confirm"
                disabled={selectedDates.size === 0}
                onClick={confirmCustom}
              >
                Assign{selectedDates.size > 0 ? ` (${selectedDates.size})` : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
