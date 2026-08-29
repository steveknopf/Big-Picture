import React from 'react'
import { useDroppable } from '@dnd-kit/core'

// `id` encodes what dropping here means, parsed in App.jsx's onDragEnd:
//   'date:2026-08-10'      -> schedule for that date, no time
//   'slot:2026-08-10:14'   -> schedule for that date at 14:00
//   'unschedule'           -> clear date/time (used by the todo drawer)
export default function DroppableSlot({ id, className = '', children, onClick }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`${className} droppable ${isOver ? 'is-drop-target' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
