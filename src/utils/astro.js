import { getTimes } from 'suncalc'
import { format } from 'date-fns'

// Tropical zodiac date ranges. Each sign spans the tail of one month and the
// head of the next, so membership only ever needs those two checks.
const ZODIAC = [
  { name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20] },
  { name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22] },
  { name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22] },
  { name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21] },
]

export function getZodiacSign(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  for (const sign of ZODIAC) {
    const [startMonth, startDay] = sign.start
    const [endMonth, endDay] = sign.end
    if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
      return sign
    }
  }
  return ZODIAC[0]
}

export function getSunTimes(date, lat, lon) {
  const times = getTimes(date, lat, lon)
  return { sunrise: times.sunrise, sunset: times.sunset }
}

export function formatSunTime(d) {
  if (!d || isNaN(d.getTime())) return '—'
  return format(d, 'h:mm a')
}
