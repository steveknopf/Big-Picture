import { useCallback, useState } from 'react'

// Drag the bottom edge of a scheduled todo's block to change how many hours
// it spans. Uses pointer capture directly (not dnd-kit) so it stays a
// separate gesture from picking the todo up and rescheduling it.
export function useResizableDuration(todo, rowHeight, dispatch) {
  const [previewDuration, setPreviewDuration] = useState(null)

  const onResizeStart = useCallback(
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      const handle = e.currentTarget
      handle.setPointerCapture(e.pointerId)
      const startY = e.clientY
      const baseDuration = todo.duration || 1

      function nextDuration(moveEvent) {
        const deltaHours = Math.round((moveEvent.clientY - startY) / rowHeight)
        return Math.max(1, baseDuration + deltaHours)
      }

      function onMove(moveEvent) {
        setPreviewDuration(nextDuration(moveEvent))
      }

      function onUp(upEvent) {
        const finalDuration = nextDuration(upEvent)
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        setPreviewDuration(null)
        if (finalDuration !== baseDuration) {
          dispatch({
            type: 'SCHEDULE_TODO',
            id: todo.id,
            date: todo.date,
            time: todo.time,
            duration: finalDuration,
          })
        }
      }

      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
    },
    [todo, rowHeight, dispatch]
  )

  return { displayDuration: previewDuration ?? (todo.duration || 1), onResizeStart }
}
