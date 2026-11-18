import { highlightRanges } from './text.js'

/**
 * Where search results come from.
 *
 *   VITE_SEARCH_MODE=mock  (default) keyword preview that runs in the browser — no backend needed
 *   VITE_SEARCH_MODE=api   the real semantic search at GET /api/search (Workers AI + Vectorize)
 *
 * Set it in a .env.local file (already git-ignored via *.local), e.g.:
 *   VITE_SEARCH_MODE=api
 */
const MODE = import.meta.env.VITE_SEARCH_MODE === 'api' ? 'api' : 'mock'

/** Shown in the search window's footer, so the keyword preview is never passed off as semantic search. */
export const ENGINE_LABEL = MODE === 'api' ? 'Semantic search' : 'Keyword preview'

/**
 * @typedef {object} SearchResult
 * @property {string} id
 * @property {string} type      project | experience | stack | personal | profile | contact
 * @property {string} title
 * @property {string} crumb
 * @property {string} snippet
 * @property {object} target    { kind: 'project'|'anchor'|'link', id?, url? }
 * @property {number} score     0–1
 * @property {[number, number][]} highlights  character ranges in snippet
 *
 * @typedef {object} SearchResponse
 * @property {string} query
 * @property {boolean} weak     true when nothing is a close match
 * @property {number} total     passages in the index
 * @property {number} tookMs
 * @property {string} [engine]  shown in the footer
 * @property {SearchResult[]} results
 */

/** @returns {Promise<SearchResponse>} */
export async function search(query, { signal } = {}) {
  if (MODE === 'mock') {
    // Loaded on first search only, so the corpus code isn't in the first page load.
    const { mockSearch } = await import('./mockSearch.js')
    return mockSearch(query, { signal })
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
  if (!response.ok) throw new Error(`Search failed (${response.status})`)
  const data = await response.json()
  // The API may leave highlights out; work them out here if so.
  data.results = data.results.map((r) => ({ ...r, highlights: r.highlights ?? highlightRanges(query, r.snippet) }))
  return data
}
