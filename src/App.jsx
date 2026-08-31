import React, { useState } from 'react'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import Header from './components/Header.jsx'
import TodoDrawer from './components/TodoDrawer.jsx'
import YearView from './components/YearView.jsx'
import MonthView from './components/MonthView.jsx'
import WeekView from './components/WeekView.jsx'
import DayView from './components/DayView.jsx'
import { useAppState, useAppDispatch } from './context/AppContext.jsx'

export default function App() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [skyOverlay, setSkyOverlay] = useState(false)
  const [moonOverlay, setMoonOverlay] = useState(false)

  // Small movement threshold before a drag "starts" so taps (checking a box,
  // opening the drawer) don't get eaten by the drag gesture. Touch gets a
  // short delay instead of a distance, which feels natural on a phone.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const todoId = active.data.current?.todoId
    if (!todoId) return

    const dropId = over.id
    if (dropId === 'unschedule') {
      dispatch({ type: 'UNSCHEDULE_TODO', id: todoId })
    } else if (typeof dropId === 'string' && dropId.startsWith('date:')) {
      const date = dropId.slice('date:'.length)
      dispatch({ type: 'SCHEDULE_TODO', id: todoId, date, time: null })
    } else if (typeof dropId === 'string' && dropId.startsWith('slot:')) {
      const [, date, time] = dropId.split(':')
      dispatch({ type: 'SCHEDULE_TODO', id: todoId, date, time })
    }
  }

  function renderView() {
    switch (state.view.level) {
      case 'year':
        return <YearView />
      case 'week':
        return <WeekView skyOverlay={skyOverlay} moonOverlay={moonOverlay} />
      case 'day':
        return <DayView skyOverlay={skyOverlay} moonOverlay={moonOverlay} />
      case 'month':
      default:
        return <MonthView skyOverlay={skyOverlay} moonOverlay={moonOverlay} />
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app">
        <Header
          drawerOpen={drawerOpen}
          onToggleDrawer={() => setDrawerOpen((v) => !v)}
          skyOverlay={skyOverlay}
          onToggleSky={() => setSkyOverlay((v) => !v)}
          moonOverlay={moonOverlay}
          onToggleMoon={() => setMoonOverlay((v) => !v)}
        />
        <div className="app-body">
          <main className="calendar-view">{renderView()}</main>
          {drawerOpen && <TodoDrawer />}
        </div>
      </div>
    </DndContext>
  )
}
