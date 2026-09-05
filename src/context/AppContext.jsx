import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { addYears, addMonths, addWeeks, addDays } from 'date-fns'
import { toISODate, fromISODate } from '../utils/dateUtils.js'

const STORAGE_KEY = 'cvp_state_v1'

// Signature palette — auto-assigned to new todo lists in order, so
// Steve never has to think about color picking, just naming.
export const PALETTE = [
  '#8b5cf6', // violet
  '#22d3ee', // cyan
  '#fb7185', // coral
  '#fbbf24', // amber
  '#a3e635', // lime
  '#f472b6', // pink
  '#60a5fa', // sky
  '#2dd4bf', // teal
]

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function defaultState() {
  return {
    todoLists: [{ id: 'inbox', name: 'To Do', color: PALETTE[0] }],
    todos: [],
    activeListId: 'inbox',
    view: { level: 'month', anchorDate: toISODate(new Date()) },
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Guard against a corrupted/older shape rather than crashing the app.
      if (parsed && Array.isArray(parsed.todoLists) && Array.isArray(parsed.todos)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Could not load saved planner data, starting fresh.', err)
  }
  return defaultState()
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_LIST': {
      const name = action.name.trim()
      if (!name) return state
      const color = PALETTE[state.todoLists.length % PALETTE.length]
      const list = { id: uid(), name, color }
      return { ...state, todoLists: [...state.todoLists, list], activeListId: list.id }
    }

    case 'RENAME_LIST':
      return {
        ...state,
        todoLists: state.todoLists.map((l) =>
          l.id === action.id ? { ...l, name: action.name.trim() || l.name } : l
        ),
      }

    case 'DELETE_LIST': {
      if (state.todoLists.length <= 1) return state // always keep at least one list
      const remaining = state.todoLists.filter((l) => l.id !== action.id)
      return {
        ...state,
        todoLists: remaining,
        todos: state.todos.filter((t) => t.listId !== action.id),
        activeListId: state.activeListId === action.id ? remaining[0].id : state.activeListId,
      }
    }

    case 'SELECT_LIST':
      return { ...state, activeListId: action.listId }

    case 'SET_LIST_COLOR':
      return {
        ...state,
        todoLists: state.todoLists.map((l) => (l.id === action.id ? { ...l, color: action.color } : l)),
      }

    case 'ADD_TODO': {
      const text = action.text.trim()
      if (!text) return state
      const todo = {
        id: uid(),
        listId: action.listId,
        text,
        completed: false,
        date: null,
        time: null,
        duration: null,
      }
      return { ...state, todos: [...state.todos, todo] }
    }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t)),
      }

    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) }

    case 'SCHEDULE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
            ? {
                ...t,
                date: action.date,
                time: action.time ?? null,
                duration: action.time ? action.duration || 1 : null,
              }
            : t
        ),
      }

    // Fans a single todo out across many dates in one shot (used by the
    // repeat/custom popup) so it's also one undo step, not one per date.
    case 'SCHEDULE_TODO_TO_DATES': {
      const source = state.todos.find((t) => t.id === action.id)
      if (!source || action.entries.length === 0) return state
      const [first, ...rest] = action.entries
      const updated = state.todos.map((t) =>
        t.id === action.id
          ? { ...t, date: first.date, time: first.time ?? null, duration: first.time ? first.duration || 1 : null }
          : t
      )
      const clones = rest.map((entry) => ({
        id: uid(),
        listId: source.listId,
        text: source.text,
        completed: false,
        date: entry.date,
        time: entry.time ?? null,
        duration: entry.time ? entry.duration || 1 : null,
      }))
      return { ...state, todos: [...updated, ...clones] }
    }

    case 'UNSCHEDULE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, date: null, time: null, duration: null } : t
        ),
      }

    // Clears every todo scheduled on one date at once (Day view's "Clear day"),
    // so it's a single undo step instead of one per item.
    case 'UNSCHEDULE_DATE':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.date === action.date ? { ...t, date: null, time: null, duration: null } : t
        ),
      }

    case 'SET_VIEW':
      return { ...state, view: { ...state.view, ...action.view } }

    case 'NAVIGATE': {
      const current = fromISODate(state.view.anchorDate)
      let next = current
      if (action.direction === 'today') {
        next = new Date()
      } else {
        const dir = action.direction === 'next' ? 1 : -1
        if (state.view.level === 'year') next = addYears(current, dir)
        else if (state.view.level === 'month') next = addMonths(current, dir)
        else if (state.view.level === 'week') next = addWeeks(current, dir)
        else if (state.view.level === 'day') next = addDays(current, dir)
      }
      return { ...state, view: { ...state.view, anchorDate: toISODate(next) } }
    }

    // Restores a prior snapshot of the data (used by undo). View/navigation
    // state is left alone — undo shouldn't yank you to a different screen.
    case '__RESTORE__':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

// Only actions that change your data are undoable — navigating around the
// calendar or switching the active list tab isn't a "mistake" to undo.
const UNDOABLE_ACTIONS = new Set([
  'ADD_LIST',
  'RENAME_LIST',
  'DELETE_LIST',
  'SET_LIST_COLOR',
  'ADD_TODO',
  'TOGGLE_TODO',
  'DELETE_TODO',
  'SCHEDULE_TODO',
  'SCHEDULE_TODO_TO_DATES',
  'UNSCHEDULE_TODO',
  'UNSCHEDULE_DATE',
])

const HISTORY_LIMIT = 20

function snapshotOf(state) {
  return { todoLists: state.todoLists, todos: state.todos, activeListId: state.activeListId }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  // Ephemeral, session-only undo history — deliberately not part of `state`
  // so it never gets written to localStorage or persists across a reload.
  const [past, setPast] = useState([])

  function dispatchWithHistory(action) {
    if (action.type === 'UNDO') {
      if (past.length === 0) return
      const last = past[past.length - 1]
      setPast(past.slice(0, -1))
      dispatch({ type: '__RESTORE__', payload: last })
      return
    }
    if (UNDOABLE_ACTIONS.has(action.type)) {
      setPast([...past, snapshotOf(state)].slice(-HISTORY_LIMIT))
    }
    dispatch(action)
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('Could not save planner data.', err)
    }
  }, [state])

  return (
    <AppStateContext.Provider value={{ ...state, canUndo: past.length > 0 }}>
      <AppDispatchContext.Provider value={dispatchWithHistory}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside <AppProvider>')
  return ctx
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used inside <AppProvider>')
  return ctx
}
