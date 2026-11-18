// Small text helpers shared by the mock search and the highlighter.

const STOPWORDS = new Set(
  `a an and any anything are as at be been built build by can did do does done for from
  has have he her his how i in is it its me my of on or our over she show so some
  something than that the their them then there these they this to too us use used
  using was we were what when where which who why will with work worked working you your`.split(/\s+/),
)

/**
 * Rough English stemmer: enough that "databases" matches "database" and
 * "games" matches "game". Not a real Porter stemmer, on purpose.
 */
export function stem(word) {
  if (word.length <= 3) return word
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3)
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2)
  if (word.endsWith('es') && /(ss|x|ch|sh)es$/.test(word)) return word.slice(0, -2)
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** Lowercase words, without punctuation. Keeps things like "node.js" → "node", "js". */
export function words(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

/** The meaningful, stemmed words of a query. */
export function queryTerms(query) {
  return [...new Set(words(query).filter((w) => !STOPWORDS.has(w)).map(stem))]
}

/**
 * Character ranges in `text` whose word matches a query term after stemming,
 * e.g. query "databases" in "the database schema" → [[4, 12]].
 * Used to wrap matches in <mark>. Capped so a row never turns into a highlighter pen.
 */
export function highlightRanges(query, text, max = 2) {
  const terms = new Set(queryTerms(query))
  if (terms.size === 0) return []
  const ranges = []
  for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    if (terms.has(stem(match[0].toLowerCase()))) {
      ranges.push([match.index, match.index + match[0].length])
      if (ranges.length >= max) break
    }
  }
  return ranges
}
