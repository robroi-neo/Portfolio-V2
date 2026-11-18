import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const SearchContext = createContext(null)

/** True when the key press happened while typing in some other field (not the search box). */
function isTypingElsewhere(el) {
  if (!(el instanceof HTMLElement)) return false
  if (el.id === 'site-search') return false
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
}

/**
 * Holds whether the search window is open, and listens for its shortcuts:
 *
 *   Ctrl+Space   open / close (the one shown on the page)
 *   ⌘K and /     open only — quiet fallbacks, mainly for Macs, where the OS
 *                uses Ctrl+Space to switch keyboard languages
 *
 * None of them fire while typing in another field (e.g. the contact form) or
 * while an input method (Chinese/Japanese keyboards) is composing a word —
 * Ctrl+Space toggles those input methods.
 *
 * Laravel analogy: this is like a service bound in the container — any
 * component can call useSearchWindow() to get the same open/close methods.
 */
export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)

  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.isComposing || event.repeat) return
      if (isTypingElsewhere(event.target)) return

      const ctrlSpace = event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.code === 'Space'
      const cmdK = event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === 'k'
      const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey

      if (ctrlSpace) {
        event.preventDefault()
        setOpen((o) => !o)
      } else if ((cmdK || slash) && !open) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const value = useMemo(() => ({ open, openSearch, closeSearch }), [open, openSearch, closeSearch])
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useSearchWindow() {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearchWindow must be used inside <SearchProvider>')
  return context
}
