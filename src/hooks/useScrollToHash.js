import { useEffect } from 'react'

/**
 * When the page is opened with a hash (e.g. yoursite.com/#stack), jump to that
 * section. The browser normally does this itself, but React renders the
 * sections *after* the browser looks for them, so we do it once on mount.
 */
export function useScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])
}
