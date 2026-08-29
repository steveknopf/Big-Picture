import React, { createContext, useContext, useEffect, useReducer } from 'react'
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

    case 'UNSCHEDULE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, date: null, time: null, duration: null } : t
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

    default:
      return state
  }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('Could not save planner data.', err)
    }
  }, [state])

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
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
