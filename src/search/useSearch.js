import { useEffect, useState } from 'react'
import { search } from './client.js'

const DEBOUNCE_MS = 250
const MIN_CHARS = 2

// Answers already fetched this visit, by lowercased query.
const cache = new Map()

/**
 * Runs a search as the visitor types: waits 250ms after the last keystroke,
 * cancels the request before it if it's still running, and remembers answers
 * so going back to an earlier query is instant.
 *
 * status:
 *   'empty'    fewer than 2 characters typed → show suggestions
 *   'loading'  waiting for results (the previous results stay, dimmed)
 *   'results'  data.results has close matches
 *   'weak'     nothing close; data.results holds at most 2 nearest passages
 *   'error'    the search request failed
 */
export function useSearch(query) {
  const [state, setState] = useState({ status: 'empty', data: null })
  const [attempt, setAttempt] = useState(0) // bumped by retry() to run the same query again
  const q = query.trim().replace(/\s+/g, ' ')
  const key = q.toLowerCase()
  const tooShort = q.length < MIN_CHARS
  const cached = tooShort ? undefined : cache.get(key)

  useEffect(() => {
    if (tooShort || cached) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, status: 'loading' }))
      try {
        const data = await search(q, { signal: controller.signal })
        const next = { status: data.weak ? 'weak' : 'results', data }
        cache.set(key, next)
        setState(next)
      } catch (error) {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }))
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q, key, tooShort, cached, attempt])

  // Derived during render (no extra effect): short queries show suggestions,
  // remembered queries show their saved answer straight away.
  const retry = () => setAttempt((n) => n + 1)
  if (tooShort) return { status: 'empty', data: null, retry }
  if (cached) return { ...cached, retry }
  // A new query that hasn't fired yet: show it as loading.
  if (state.status === 'empty') return { status: 'loading', data: null, retry }
  return { ...state, retry }
}
