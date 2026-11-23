import { buildSearchCorpus } from './corpus.js'
import { highlightRanges, queryTerms, stem, words } from './text.js'

/**
 * A stand-in for the real semantic search (Workers AI + Vectorize), so the
 * whole front end can be built and tried before the backend exists.
 *
 * It's keyword matching with a little help: words in the same RELATED group
 * count as a partial match, so "databases" still finds "MariaDB". It is NOT
 * semantic, and the footer says "keyword preview" so nobody mistakes it.
 *
 * Returns exactly the same shape as GET /api/search (design-search §15.9),
 * so swapping to the real API is a one-line config change (see client.js).
 */

// Groups of words that should find each other. Stemmed (see text.js).
const RELATED = [
  ['database', 'sql', 'mariadb', 'sqlite', 'schema', 'data', 'postgres', 'mysql', 'query'],
  ['machine', 'learn', 'ml', 'ai', 'model', 'neural', 'cnn', 'nlp', 'tensorflow', 'forest', 'reinforcement', 'dqn', 'llm', 'rag', 'ollama'],
  ['game', 'gam', 'play', 'fun', 'snake', 'pixel', 'guitar', 'music', 'hobby', 'multiplayer'],
  ['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'layout', 'design', 'interface'],
  ['backend', 'laravel', 'php', 'node', 'api', 'server', 'auth', 'pos', 'inventory'],
  ['mobile', 'flutter', 'firebase', 'app', 'phone', 'android'],
  ['contact', 'email', 'mail', 'reach', 'hire', 'message', 'github', 'linkedin', 'x'],
  ['school', 'university', 'student', 'study', 'thesis', 'degree', 'education'],
  ['resume', 'cv', 'curriculum', 'vitae', 'pdf', 'download', 'hire', 'recruiter'],
  ['job', 'intern', 'internship', 'experience', 'career', 'company', 'role'],
]
const RELATED_OF = new Map()
for (const group of RELATED) {
  for (const w of group) RELATED_OF.set(w, new Set(group.filter((g) => g !== w)))
}

const T_MIN = 0.2 // drop anything weaker than this
const GAP = 0.4 // …or this far below the best result
const T_WEAK = 0.45 // best result below this → "nothing close"

let index = null

function buildIndex() {
  const passages = buildSearchCorpus()
  const docs = passages.map((p) => ({
    passage: p,
    terms: new Set(words(`${p.title} ${p.crumb} ${p.text} ${p.keywords.join(' ')}`).map(stem)),
  }))
  // idf: rare words count for more than common ones.
  const df = new Map()
  for (const d of docs) for (const t of d.terms) df.set(t, (df.get(t) ?? 0) + 1)
  const idf = (t) => Math.log(1 + docs.length / (1 + (df.get(t) ?? 0)))
  return { docs, idf, size: passages.length }
}

function score(terms, doc, idf) {
  let got = 0
  let total = 0
  for (const t of terms) {
    const weight = idf(t)
    total += weight
    if (doc.terms.has(t)) {
      got += weight
    } else {
      const related = RELATED_OF.get(t)
      if (related && [...related].some((r) => doc.terms.has(r))) got += weight * 0.6
    }
  }
  return total ? got / total : 0
}

/** @returns {Promise<SearchResponse>} same shape as the API */
export async function mockSearch(query, { k = 5, signal } = {}) {
  index ??= buildIndex()
  const started = performance.now()

  // Pretend there's a network round trip, so loading states can be seen.
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 140 + Math.random() * 120)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

  const terms = queryTerms(query)
  const ranked = index.docs
    .map((doc) => ({ doc, score: score(terms, doc, index.idf) }))
    .sort((a, b) => b.score - a.score)

  const top = ranked[0]?.score ?? 0
  const weak = top < T_WEAK
  const seen = new Set()
  const results = []
  for (const { doc, score: s } of ranked) {
    if (s < T_MIN || s < top - GAP) break
    // One row per place on the page: a job's summary and its details share a target.
    const key = `${doc.passage.target.kind}:${doc.passage.target.id ?? doc.passage.target.url}`
    if (seen.has(key)) continue
    seen.add(key)
    const { id, type, title, crumb, text, target } = doc.passage
    results.push({ id, type, title, crumb, snippet: text, target, score: Math.round(s * 100) / 100, highlights: highlightRanges(query, text) })
    if (results.length >= (weak ? 2 : k)) break
  }

  return {
    query,
    weak,
    total: index.size,
    tookMs: Math.round(performance.now() - started),
    engine: 'keyword preview',
    results,
  }
}
