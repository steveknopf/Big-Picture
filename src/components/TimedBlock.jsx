import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useAppDispatch } from '../context/AppContext.jsx'
import { useResizableDuration } from '../hooks/useResizableDuration.js'

export default function TimedBlock({ todo, color, rowHeight, small, gap }) {
  const dispatch = useAppDispatch()
  const { displayDuration, onResizeStart } = useResizableDuration(todo, rowHeight, dispatch)

  // A distinct id namespace from the drawer's TodoItem (`todo:`) — the same
  // todo is draggable from both places at once, and dnd-kit ids must be unique.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `cal-todo:${todo.id}`,
    data: { todoId: todo.id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`todo-chip timed-block ${small ? 'small' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        background: color,
        height: `${displayDuration * rowHeight - gap}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      <button
        type="button"
        className="timed-block-unschedule"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => dispatch({ type: 'UNSCHEDULE_TODO', id: todo.id })}
        aria-label={`Remove "${todo.text}" from the calendar`}
        title="Remove from calendar"
      >
        ×
      </button>
      {todo.text}
      <div className="timed-block-handle" onPointerDown={onResizeStart} />
    </div>
  )
}
