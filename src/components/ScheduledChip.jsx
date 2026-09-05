import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useAppDispatch } from '../context/AppContext.jsx'

export default function ScheduledChip({ todo, color, className = '', showCheckbox }) {
  const dispatch = useAppDispatch()

  // A distinct id namespace from the drawer's TodoItem (`todo:`) — the same
  // todo is draggable from both places at once, and dnd-kit ids must be unique.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `chip-todo:${todo.id}`,
    data: { todoId: todo.id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`todo-chip scheduled-chip ${className} ${isDragging ? 'dragging' : ''} ${
        todo.completed ? 'completed' : ''
      }`}
      style={{
        background: color,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          className="scheduled-chip-checkbox"
          checked={todo.completed}
          onChange={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Mark "${todo.text}" complete`}
        />
      )}
      <span className="scheduled-chip-text">{todo.text}</span>
      <button
        type="button"
        className="scheduled-chip-remove"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          dispatch({ type: 'UNSCHEDULE_TODO', id: todo.id })
        }}
        aria-label={`Remove "${todo.text}" from the calendar`}
        title="Remove from calendar"
      >
        ×
      </button>
    </div>
  )
}
