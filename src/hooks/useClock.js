import { useEffect, useState } from 'react'

/**
 * Returns the current time as a Date that re-renders every second.
 * Format it for a specific timezone where you display it (see TopBar).
 */
export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}
