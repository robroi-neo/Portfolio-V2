import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { withViewTransition } from '../lib/viewTransition.js'

const STORAGE_KEY = 'theme'
// Browser UI color (mobile address bar) — matches --bg in each theme.
const THEME_COLORS = { light: '#f7f7f5', dark: '#111110' }

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null // storage blocked (private mode etc.)
  }
}

/**
 * Light/dark theme. The first paint is handled by the inline script in
 * index.html (so there's no flash); this hook reads that result, toggles it,
 * and remembers the choice. Until the user picks, it follows the system setting.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  // Follow the OS setting live, but only while the user hasn't chosen one.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange(event) {
      if (readStoredTheme()) return
      const next = event.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  /**
   * Switch theme. Pass the element that was clicked (the toggle button) and
   * the new theme spreads out from it in a growing circle; without one it
   * spreads from the top-right corner.
   */
  const toggle = useCallback(
    (origin) => {
      const next = theme === 'dark' ? 'light' : 'dark'
      const root = document.documentElement

      // Where the circle starts, and how big it must get to cover the screen.
      const w = window.innerWidth
      const h = window.innerHeight
      const rect = origin?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : w
      const y = rect ? rect.top + rect.height / 2 : 0
      const farthest = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
      root.style.setProperty('--theme-x', `${x}px`)
      root.style.setProperty('--theme-y', `${y}px`)
      root.style.setProperty('--theme-r-end', `${farthest}px`)

      // The class scopes the reveal animation in base.css to theme switches only.
      // Nothing on the page moves (it's a reveal), so it runs even with reduced motion on.
      root.classList.add('theme-transition')
      withViewTransition(
        () => {
          flushSync(() => setTheme(next))
          applyTheme(next)
        },
        { allowReducedMotion: true },
      ).finally(() => root.classList.remove('theme-transition'))
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // storage blocked — the choice just won't be remembered
      }
    },
    [theme],
  )

  return { theme, toggle }
}
