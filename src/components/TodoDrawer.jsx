import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import TodoItem from './TodoItem.jsx'
import SchedulePopup from './SchedulePopup.jsx'

export default function TodoDrawer() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newTodoText, setNewTodoText] = useState('')
  const [scheduleTodoId, setScheduleTodoId] = useState(null)
  const scheduleTodo = state.todos.find((t) => t.id === scheduleTodoId)

  // Dropping a scheduled todo back onto the drawer clears its date/time.
  const { setNodeRef, isOver } = useDroppable({ id: 'unschedule' })

  const activeList = state.todoLists.find((l) => l.id === state.activeListId) || state.todoLists[0]
  const listTodos = state.todos.filter((t) => t.listId === activeList.id)

  function submitNewList(e) {
    e.preventDefault()
    if (!newListName.trim()) return
    dispatch({ type: 'ADD_LIST', name: newListName })
    setNewListName('')
    setAddingList(false)
  }

  function submitNewTodo(e) {
    e.preventDefault()
    if (!newTodoText.trim()) return
    dispatch({ type: 'ADD_TODO', listId: activeList.id, text: newTodoText })
    setNewTodoText('')
  }

  return (
    <div ref={setNodeRef} className={`todo-drawer ${isOver ? 'drop-ready' : ''}`}>
      <div className="list-tabs">
        {state.todoLists.map((list) => (
          <div
            key={list.id}
            className={`list-tab ${list.id === activeList.id ? 'active' : ''}`}
            style={{ '--list-color': list.color }}
          >
            <input
              type="color"
              className="list-color-input"
              value={list.color}
              onChange={(e) => dispatch({ type: 'SET_LIST_COLOR', id: list.id, color: e.target.value })}
              aria-label={`Choose color for ${list.name}`}
            />
            <button
              type="button"
              className="list-tab-name"
              onClick={() => dispatch({ type: 'SELECT_LIST', listId: list.id })}
            >
              {list.name}
            </button>
          </div>
        ))}

        {addingList ? (
          <form className="new-list-form" onSubmit={submitNewList}>
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => {
                if (!newListName.trim()) setAddingList(false)
              }}
              placeholder="New list name"
            />
            <button type="submit" className="new-list-confirm" aria-label="Create list">
              ✓
            </button>
          </form>
        ) : (
          <button type="button" className="list-tab add-list" onClick={() => setAddingList(true)}>
            + List
          </button>
        )}
      </div>

      <form className="new-todo-form" onSubmit={submitNewTodo}>
        <input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder={`Add to ${activeList.name}…`}
        />
        <button type="submit">Add</button>
      </form>

      <div className="todo-items">
        {listTodos.length === 0 ? (
          <p className="empty-hint">
            Nothing in {activeList.name} yet. Add a to-do above, then drag it onto the calendar to
            schedule it.
          </p>
        ) : (
          listTodos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              color={activeList.color}
              onToggle={(id) => dispatch({ type: 'TOGGLE_TODO', id })}
              onDelete={(id) => dispatch({ type: 'DELETE_TODO', id })}
              onUnschedule={(id) => dispatch({ type: 'UNSCHEDULE_TODO', id })}
              onOpenSchedule={(id) => setScheduleTodoId(id)}
            />
          ))
        )}
      </div>

      {scheduleTodo && <SchedulePopup todo={scheduleTodo} onClose={() => setScheduleTodoId(null)} />}
    </div>
  )
}
