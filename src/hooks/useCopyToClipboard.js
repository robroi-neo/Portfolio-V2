import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copies text to the clipboard. `copied` is true for `resetMs` afterwards,
 * so a button can briefly show "Copied".
 */
export function useCopyToClipboard(text, resetMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return // clipboard blocked (e.g. insecure context) — stay quiet
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), resetMs)
  }, [text, resetMs])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { copied, copy }
}
