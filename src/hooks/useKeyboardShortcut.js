import { useEffect } from 'react'

/** True when the keypress happened somewhere the user is typing. */
function isTypingTarget(el) {
  return el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

/**
 * Runs `handler` when a single key is pressed anywhere on the page.
 * Ignored while typing in a field, when Ctrl/Cmd/Alt is held (so browser
 * shortcuts like Ctrl+C still work), and for held-down key repeats.
 *
 * @param {string} key  e.g. 'c'
 * @param {() => void} handler  wrap in useCallback so the listener isn't re-added every render
 */
export function useKeyboardShortcut(key, handler) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isTypingTarget(event.target)) return
      handler()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler])
}
