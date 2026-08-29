import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addDays,
} from 'date-fns'

// All dates are stored as 'yyyy-MM-dd' strings so they're safe to
// JSON.stringify into localStorage and compare with simple equality.
export function toISODate(date) {
  return format(date, 'yyyy-MM-dd')
}

export function fromISODate(str) {
  return parseISO(str)
}

// 6-week grid (42 days) so every month view is a consistent shape,
// including the trailing/leading days from neighboring months.
export function getMonthGrid(anchorDate) {
  const monthStart = startOfMonth(anchorDate)
  const monthEnd = endOfMonth(anchorDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function getWeekDays(anchorDate) {
  const start = startOfWeek(anchorDate, { weekStartsOn: 0 })
  const end = endOfWeek(anchorDate, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export { isSameDay, isSameMonth, addDays, format }
