import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently "in view", so the dock can highlight it.
 *
 * How it decides: imagine a line 40% down the screen. The active section is the
 * last one whose top edge has scrolled above that line. At the very bottom of
 * the page we force the last section, because a short Contact section might
 * never reach the line.
 *
 * Laravel analogy: think of useEffect as a listener you register when the
 * component "boots" and remove (the return function) when it's torn down.
 *
 * @param {string[]} ids section ids in page order — must be a stable array
 */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    let frame = 0

    function measure() {
      frame = 0
      const doc = document.documentElement
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2

      if (atBottom) {
        setActiveId(ids[ids.length - 1])
        return
      }

      const line = window.innerHeight * 0.4
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActiveId(current)
    }

    // Scroll fires many times per frame; only measure once per frame.
    function scheduleMeasure() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    scheduleMeasure() // set the right section on first load (e.g. opened at /#stack)
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      cancelAnimationFrame(frame)
    }
  }, [ids])

  return activeId
}
