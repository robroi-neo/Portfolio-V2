import { SearchIcon } from '../icons.jsx'
import { useSearchWindow } from './SearchProvider.jsx'

// Macs usually keep Ctrl+Space for switching keyboard languages, so the
// browser never sees it there. Show the shortcut that actually works.
const isMac =
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? '')

const SHORTCUT_LABEL = isMac ? '⌘ K' : 'Ctrl Space'
const SHORTCUT_ARIA = isMac ? 'Meta+K Control+Space' : 'Control+Space'

/**
 * The "you can search here" signal in the top bar, next to DAVAO, PH.
 * Wide screens: icon + keycap. Phones: just the icon (no keyboard to hint at).
 */
export function TopBarSearchButton() {
  const { open, openSearch } = useSearchWindow()
  return (
    <button
      type="button"
      className={`search-trigger${open ? ' is-open' : ''}`}
      onClick={openSearch}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-keyshortcuts={SHORTCUT_ARIA}
      aria-label="Search this site"
    >
      <span className="search-trigger__pill">
        <SearchIcon size={14} />
        <kbd className="search-trigger__kbd" aria-hidden="true">
          {SHORTCUT_LABEL}
        </kbd>
      </span>
    </button>
  )
}

/** Search button at the end of the dock, after a divider — reachable after the top bar scrolls away. */
export function DockSearchButton() {
  const { open, openSearch } = useSearchWindow()
  return (
    <button
      type="button"
      className={`dock__item${open ? ' is-active' : ''}`}
      onClick={openSearch}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-keyshortcuts={SHORTCUT_ARIA}
      aria-label="Search this site"
    >
      <span className="dock__icon">
        <SearchIcon />
      </span>
      <span className="dock__tooltip" aria-hidden="true">
        Search · {SHORTCUT_LABEL}
      </span>
    </button>
  )
}
