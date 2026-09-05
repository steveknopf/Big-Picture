import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { format, fromISODate } from '../utils/dateUtils.js'

function hourLabel(hour) {
  return format(new Date(2000, 0, 1, hour), 'h a')
}

function scheduleLabel(todo) {
  if (!todo.date) return null
  const dateLabel = format(fromISODate(todo.date), 'MMM d')
  if (!todo.time) return dateLabel
  const startHour = parseInt(todo.time, 10)
  const duration = todo.duration || 1
  if (duration <= 1) return `${dateLabel} · ${hourLabel(startHour)}`
  return `${dateLabel} · ${hourLabel(startHour)} – ${hourLabel(startHour + duration)}`
}

export default function TodoItem({ todo, color, onToggle, onDelete, onUnschedule, onOpenSchedule }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `todo:${todo.id}`,
    data: { todoId: todo.id },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const schedule = scheduleLabel(todo)

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: color }}
      className={`todo-item ${isDragging ? 'dragging' : ''} ${todo.completed ? 'completed' : ''}`}
      {...listeners}
      {...attributes}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Mark "${todo.text}" complete`}
      />
      <div className="todo-main" onClick={() => onOpenSchedule(todo.id)}>
        <span className="todo-text">{todo.text}</span>
        {schedule && (
          <span className="todo-schedule">
            <span className="todo-schedule-text">{schedule}</span>
            <button
              type="button"
              className="todo-unschedule"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onUnschedule(todo.id)
              }}
              aria-label={`Remove "${todo.text}" from the calendar`}
              title="Remove from calendar"
            >
              ×
            </button>
          </span>
        )}
      </div>
      <button
        type="button"
        className="todo-delete"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
      >
        ×
      </button>
    </div>
  )
}
