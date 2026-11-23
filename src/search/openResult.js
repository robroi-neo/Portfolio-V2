/**
 * What happens when a search result is opened. Called after the search
 * window has closed, so focus and scrolling land on the page, not the popup.
 */
export function openResult(target) {
  if (target.kind === 'project') {
    // ProjectFan owns the project popup; it listens for this and opens it.
    window.dispatchEvent(new CustomEvent('portfolio:open-project', { detail: { id: target.id } }))
    return
  }

  if (target.kind === 'download') {
    const a = document.createElement('a')
    a.href = target.url
    a.download = target.filename ?? ''
    document.body.append(a)
    a.click()
    a.remove()
    return
  }

  if (target.kind === 'link') {
    window.open(target.url, '_blank', 'noopener,noreferrer')
    return
  }

  const el = document.getElementById(target.id)
  if (!el) return
  // Whole sections line up at the top; smaller blocks (one job) sit mid-screen.
  const isSection = el.tagName === 'SECTION'
  el.scrollIntoView({ block: isSection ? 'start' : 'center' })
  history.replaceState(null, '', `#${target.id}`)

  // Move keyboard focus there too, without a second jump.
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.dataset.searchTarget = '' // CSS hides the focus ring here; the flash shows the spot instead
  el.focus({ preventScroll: true })

  // A short background flash so the eye finds what was searched for.
  el.classList.remove('search-flash')
  void el.offsetWidth // restart the animation if it's already flashing
  el.classList.add('search-flash')
  el.addEventListener('animationend', () => el.classList.remove('search-flash'), { once: true })
}
