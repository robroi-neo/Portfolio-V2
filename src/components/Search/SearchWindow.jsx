import { useEffect, useId, useRef, useState } from 'react'
import { SEARCH_SUGGESTIONS } from '../../data/search.js'
import { SECTIONS } from '../../data/sections.js'
import { ENGINE_LABEL } from '../../search/client.js'
import { playKeyClick } from '../../lib/keyClick.js'
import { openResult } from '../../search/openResult.js'
import { useSearch } from '../../search/useSearch.js'
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  CodeIcon,
  CornerDownLeftIcon,
  DownloadIcon,
  GamepadIcon,
  LayersIcon,
  MailIcon,
  SearchIcon,
  UserIcon,
} from '../icons.jsx'
import { useSearchWindow } from './SearchProvider.jsx'
import './SearchWindow.css'

// A result's icon is the dock icon of the section it lives in, so the
// visitor already knows what each one means.
const TYPE_ICON = {
  project: BriefcaseIcon,
  experience: LayersIcon,
  stack: CodeIcon,
  personal: GamepadIcon,
  profile: UserIcon,
  contact: MailIcon,
  resume: DownloadIcon,
}
const TYPE_NAME = {
  project: 'Project',
  experience: 'Experience',
  stack: 'Stack',
  personal: 'Personal',
  profile: 'About',
  contact: 'Contact',
  resume: 'Résumé download',
}

const JUMP_TO = SECTIONS.filter((s) => s.id !== 'home')

/** Snippet text with the matched words wrapped in <mark> (lime). */
function Highlighted({ text, ranges }) {
  if (!ranges?.length) return text
  const parts = []
  let at = 0
  ranges.forEach(([start, end], i) => {
    if (start > at) parts.push(text.slice(at, start))
    parts.push(<mark key={i}>{text.slice(start, end)}</mark>)
    at = end
  })
  parts.push(text.slice(at))
  return parts
}

/** Score as ".81" — the leading zero adds nothing. */
function formatScore(score) {
  return score >= 1 ? '1.0' : score.toFixed(2).replace(/^0/, '')
}

/**
 * The search window (design-search §15). A native <dialog>, like the project
 * popup: showModal() gives the backdrop, keeps focus inside, and hands focus
 * back to the button that opened it. Phones get a bottom sheet (CSS).
 *
 * The search box is a combobox: focus stays in the input while ↑/↓ move the
 * highlighted row, and Enter opens it.
 */
export default function SearchWindow() {
  const { open, closeSearch } = useSearchWindow()
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const pendingTarget = useRef(null) // result to open once the window has closed
  const [closing, setClosing] = useState(false)
  const [query, setQuery] = useState('')
  const listId = useId()

  const { status, data, retry } = useSearch(query)
  const isEmpty = status === 'empty' || (status === 'loading' && !data)
  const results = data?.results ?? []

  // Rows the arrow keys move through: suggestions when empty, results otherwise.
  const items = isEmpty ? SEARCH_SUGGESTIONS : status === 'error' ? [] : results
  // Weak matches start with nothing highlighted, so Enter doesn't jump to a stretch.
  const defaultIndex = status === 'weak' ? -1 : 0
  const [active, setActive] = useState({ items: null, index: 0 })
  const activeIndex = active.items === items ? active.index : defaultIndex
  const setActiveIndex = (index) => setActive({ items, index })
  const optionId = (i) => `${listId}-option-${i}`

  // ---- open / close ----

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      dialog.showModal() // no open animation: it appears instantly…
      playKeyClick() // …with a brown-switch key press
      inputRef.current?.select() // reopening keeps the last query, ready to overwrite
      window.dispatchEvent(new Event('portfolio:window-open')) // the music card pauses
    }
    // Closed from outside (Ctrl+Space): fade out like every other way of closing.
    if (!open && dialog.open) setClosing(true)
  }, [open])

  function requestClose() {
    setClosing(true)
  }

  // Safety net: close even if the fade-out never reports back.
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => dialogRef.current?.close(), 300)
    return () => clearTimeout(timer)
  }, [closing])

  function handleAnimationEnd(event) {
    if (closing && /^search-(sheet-)?out$/.test(event.animationName)) dialogRef.current.close()
  }

  // The dialog is really closed now (by us, or by the browser).
  function handleClose() {
    setClosing(false)
    closeSearch()
    const target = pendingTarget.current
    pendingTarget.current = null
    if (target) openResult(target)
  }

  // A click on the <dialog> itself (outside the panel) is a backdrop click.
  function handleDialogClick(event) {
    if (event.target === event.currentTarget) requestClose()
  }

  // Escape: fade out instead of vanishing.
  function handleCancel(event) {
    event.preventDefault()
    requestClose()
  }

  // ---- choosing ----

  function pick(index) {
    if (isEmpty) {
      setQuery(SEARCH_SUGGESTIONS[index])
      inputRef.current?.focus()
      return
    }
    const result = results[index]
    if (!result) return
    pendingTarget.current = result.target
    requestClose()
  }

  function jumpTo(id) {
    pendingTarget.current = { kind: 'anchor', id }
    requestClose()
  }

  function handleKeyDown(event) {
    if (!items.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      const start = activeIndex < 0 ? (step > 0 ? -1 : 0) : activeIndex
      setActiveIndex((start + step + items.length) % items.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      pick(activeIndex)
    }
  }

  // Keep the highlighted row visible when arrowing through a long list.
  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, listId])

  // ---- text for the footer and screen readers ----

  let footer = ENGINE_LABEL
  let announcement = ''
  if (status === 'loading') {
    footer = 'Searching…'
  } else if (status === 'results') {
    footer = `Top ${results.length} of ${data.total} passages · ${data.tookMs} ms`
    announcement = `${results.length} result${results.length === 1 ? '' : 's'}`
  } else if (status === 'weak') {
    footer = 'No close match'
    announcement = `No close matches for ${data.query}`
  } else if (status === 'error') {
    footer = 'Offline'
    announcement = 'Search is offline'
  }

  const listLabel = isEmpty ? 'Suggested searches' : status === 'weak' ? 'Closest passages' : 'Search results'

  return (
    <dialog
      ref={dialogRef}
      className={`search-window${closing ? ' is-closing' : ''}`}
      aria-label="Search this site"
      onClick={handleDialogClick}
      onCancel={handleCancel}
      onClose={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="search-window__panel" data-state={status}>
        <span className="search-window__handle" aria-hidden="true" />

        <div className="search-window__bar">
          <SearchIcon size={18} />
          <label htmlFor="site-search" className="sr-only">
            Search this site
          </label>
          <input
            ref={inputRef}
            id="site-search"
            className="search-window__input"
            type="search"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 && items.length ? optionId(activeIndex) : undefined}
            placeholder="Ask about my projects, stack, or experience"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="search-window__esc" aria-hidden="true">
            esc
          </kbd>
          <button type="button" className="search-window__cancel" onClick={requestClose}>
            Cancel
          </button>
          {status === 'loading' && <span className="search-window__progress" aria-hidden="true" />}
        </div>

        <div className="search-window__body">
          {status === 'weak' && (
            <div className="search-window__note">
              <p className="search-window__note-title">Nothing close to “{data.query}” yet.</p>
              <p>These are the nearest passages on the site, but they’re a stretch.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="search-window__note">
              <p className="search-window__note-title">Search is offline right now.</p>
              <p>Jump to a section instead, or try again in a minute.</p>
              <button type="button" className="btn btn--secondary search-window__retry" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {isEmpty && <p className="label search-window__group">Try asking</p>}

          {items.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label={listLabel}
              className={`search-window__list${status === 'loading' ? ' is-stale' : ''}`}
            >
              {isEmpty
                ? SEARCH_SUGGESTIONS.map((text, i) => (
                    <li
                      key={text}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === activeIndex}
                      className="search-option search-option--suggestion"
                      onMouseDown={(event) => event.preventDefault()} // keep focus in the input
                      onMouseMove={() => i !== activeIndex && setActiveIndex(i)}
                      onClick={() => pick(i)}
                    >
                      <SearchIcon size={16} />
                      <span className="search-option__text">{text}</span>
                      <CornerDownLeftIcon size={16} />
                    </li>
                  ))
                : results.map((result, i) => {
                    const Icon = TYPE_ICON[result.type] ?? SearchIcon
                    return (
                      <li
                        key={result.id}
                        id={optionId(i)}
                        role="option"
                        aria-selected={i === activeIndex}
                        className="search-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseMove={() => i !== activeIndex && setActiveIndex(i)}
                        onClick={() => pick(i)}
                      >
                        <span className="search-option__icon" aria-hidden="true">
                          <Icon size={16} />
                        </span>
                        <span className="search-option__main">
                          <span className="search-option__title">
                            {result.title}
                            <span className="search-option__crumb"> · {result.crumb}</span>
                            <span className="sr-only">, {TYPE_NAME[result.type]}</span>
                          </span>
                          <span className="search-option__snippet">
                            <Highlighted text={result.snippet} ranges={result.highlights} />
                          </span>
                        </span>
                        <span className="search-option__aside" aria-hidden="true">
                          <span className="search-option__score" title="Match score">
                            {formatScore(result.score)}
                          </span>
                          {result.target.kind === 'download' ? (
                            <DownloadIcon size={16} />
                          ) : (
                            <CornerDownLeftIcon size={16} />
                          )}
                        </span>
                      </li>
                    )
                  })}
            </ul>
          )}

          {status === 'weak' && (
            <button type="button" className="search-window__ask" onClick={() => jumpTo('contact')}>
              Not here? Ask me directly
              <ArrowUpRightIcon size={14} />
            </button>
          )}

          {(isEmpty || status === 'error') && (
            <>
              <p className="label search-window__group">Jump to</p>
              <div className="search-window__jumps">
                {JUMP_TO.map(({ id, name, Icon }) => (
                  <button key={id} type="button" className="search-jump" onClick={() => jumpTo(id)}>
                    <Icon size={15} />
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="search-window__footer">
          <span className="search-window__keys" aria-hidden="true">
            <kbd>↑</kbd>
            <kbd>↓</kbd> move <kbd>↵</kbd> open
          </span>
          <span className="search-window__status">{footer}</span>
        </div>

        <span className="sr-only" role="status">
          {announcement}
        </span>
      </div>
    </dialog>
  )
}
