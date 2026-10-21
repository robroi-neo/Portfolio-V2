import { useEffect, useRef, useState } from 'react'

/**
 * Tells you when an element scrolls into view.
 * Returns [ref, inView] — put `ref` on the element.
 *
 * @param {object} options
 * @param {number} options.threshold how much of the element must be visible (0–1)
 * @param {boolean} options.once stay `true` after the first time (default), instead of toggling
 */
export function useInView({ threshold = 0.5, once = true } = {}) {
  const ref = useRef(null)
  // Very old browsers without IntersectionObserver: just count as visible.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return [ref, inView]
}
