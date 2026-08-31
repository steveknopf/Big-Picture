import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cvp_location_v1'

function loadCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Sunrise/sunset needs a lat/lon. Ask the browser once, then cache it —
// there's no account or server here, so this is the only place it can live.
export function useLocation() {
  const [coords, setCoords] = useState(loadCached)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Location is not supported on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lon: position.coords.longitude }
        setCoords(next)
        setError(null)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // localStorage unavailable — coords still work for this session
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    if (!coords) requestLocation()
  }, [coords, requestLocation])

  return { coords, error, requestLocation }
}
