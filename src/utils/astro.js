import { getTimes, getMoonIllumination, getMoonTimes } from 'suncalc'
import { format } from 'date-fns'

// Tropical zodiac, in natural order starting at Aries (ecliptic longitude 0°)
// so the same table serves both the calendar-date lookup (sun) and the
// ecliptic-longitude lookup (moon).
const ZODIAC = [
  { name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22] },
  { name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22] },
  { name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21] },
  { name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20] },
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

const RAD = Math.PI / 180
const DAYS_UNIX_TO_J2000 = 10957.5 // JD(2000-01-01T12:00 UTC) - JD(1970-01-01T00:00 UTC)

// Low-precision lunar ecliptic longitude (truncated Meeus/ELP2000 series,
// ~10 largest periodic terms) — accurate to a fraction of a degree, which is
// far more than the 30°-wide zodiac buckets need. Good enough for a casual
// astrology overlay; not meant for anything requiring real ephemeris precision.
function getMoonEclipticLongitude(date) {
  const T = (date.getTime() / 86400000 - DAYS_UNIX_TO_J2000) / 36525
  const deg = (x) => ((x % 360) + 360) % 360

  const Lp = deg(218.3164477 + 481267.88123421 * T)
  const D = deg(297.8501921 + 445267.1114034 * T) * RAD
  const M = deg(357.5291092 + 35999.0502909 * T) * RAD
  const Mp = deg(134.9633964 + 477198.8675055 * T) * RAD
  const F = deg(93.272095 + 483202.0175233 * T) * RAD

  const dL =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * Math.sin(2 * D - M) -
    0.040923 * Math.sin(M - Mp) -
    0.03472 * Math.sin(D) -
    0.030383 * Math.sin(M + Mp)

  return deg(Lp + dL)
}

export function getMoonZodiacSign(date) {
  const longitude = getMoonEclipticLongitude(date)
  return ZODIAC[Math.floor(longitude / 30)]
}

export function getMoonInfo(date, lat, lon) {
  const illumination = getMoonIllumination(date)
  const times = lat != null && lon != null ? getMoonTimes(date, lat, lon) : {}
  return {
    phase: illumination.phase,
    zodiac: getMoonZodiacSign(date),
    rise: times.rise ?? null,
    set: times.set ?? null,
  }
}
