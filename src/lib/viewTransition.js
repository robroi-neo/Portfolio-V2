/**
 * Runs `update` (a synchronous DOM change) inside a View Transition, so the
 * browser animates from the old page to the new one. Elements that share a
 * `view-transition-name` before and after the update morph into each other.
 *
 * Falls back to a plain update when the browser doesn't support it or (unless
 * `allowReducedMotion` is set) the user prefers reduced motion. Pass
 * `allowReducedMotion` only for gentle fades with no movement, which are fine
 * for those users. Resolves when the animation has finished.
 */
export function withViewTransition(update, { allowReducedMotion = false } = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || (reduceMotion && !allowReducedMotion)) {
    update()
    return Promise.resolve()
  }
  return document.startViewTransition(update).finished
}
