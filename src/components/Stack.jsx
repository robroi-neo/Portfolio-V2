import { Fragment, useEffect, useRef, useState } from 'react'
import './Stack.css'

// macOS-style magnification: icons within RANGE px of the pointer grow,
// up to (1 + MAX_GROW)× right under it, easing off with distance.
const RANGE = 110
const MAX_GROW = 0.6

/**
 * The logo, or the tool's first letter when there's no logo (or it fails to load).
 * With `logoDark`, both are rendered and CSS shows the one matching the theme.
 */
function StackLogo({ name, logo, logoDark }) {
  const [failed, setFailed] = useState(false)

  if (logo && !failed) {
    return (
      <>
        <img
          className={`stack__img${logoDark ? ' stack__img--light' : ''}`}
          src={logo}
          alt=""
          width="26"
          height="26"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
        {logoDark && (
          <img
            className="stack__img stack__img--dark"
            src={logoDark}
            alt=""
            width="26"
            height="26"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
          />
        )}
      </>
    )
  }
  return <span className="stack__fallback">{name.slice(0, 2)}</span>
}

/**
 * Stack as a dock: a row of tool tiles, grouped by category with small gaps.
 * Icons magnify (macOS-style) as the pointer moves across them, the hovered
 * tool's name shows underneath, and the text filters above dim everything
 * outside the chosen category.
 */
export default function Stack({ groups }) {
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null) // { name, group }
  const barRef = useRef(null)
  const frame = useRef(0)
  const pointerX = useRef(null)

  // Magnify from the pointer position — written straight to CSS vars, once
  // per frame, so moving the mouse doesn't re-render React.
  function applyMagnify() {
    frame.current = 0
    const bar = barRef.current
    if (!bar) return
    for (const el of bar.querySelectorAll('.stack__tile')) {
      let scale = 1
      if (pointerX.current !== null) {
        const r = el.getBoundingClientRect()
        const distance = Math.abs(pointerX.current - (r.left + r.width / 2))
        if (distance < RANGE) scale = 1 + MAX_GROW * ((Math.cos((distance / RANGE) * Math.PI) + 1) / 2)
      }
      el.style.setProperty('--s', scale.toFixed(3))
    }
  }

  function handlePointerMove(event) {
    if (event.pointerType !== 'mouse') return // touch: no magnify, just tap
    pointerX.current = event.clientX
    if (!frame.current) frame.current = requestAnimationFrame(applyMagnify)
  }

  function handlePointerLeave() {
    pointerX.current = null
    setHovered(null)
    if (!frame.current) frame.current = requestAnimationFrame(applyMagnify)
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const label = hovered ? hovered.name : 'Hover a tool'

  return (
    <>
      <div className="stack__filters" role="group" aria-label="Filter tools by category">
        {[{ id: 'all', label: 'All' }, ...groups].map(({ id, label: pill }) => (
          <button
            key={id}
            type="button"
            className="stack__filter"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="stack__dock">
        <ul
          ref={barRef}
          className="stack__bar allow-motion"
          role="list"
          aria-label="Tools"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {groups.map((group, gi) => (
            <Fragment key={group.id}>
              {gi > 0 && <li className="stack__gap" aria-hidden="true" />}
              {group.items.map((item) => {
                const dimmed = filter !== 'all' && filter !== group.id
                const show = () => setHovered({ name: item.name, group: group.label })
                const Tag = item.url ? 'a' : 'span'
                return (
                  <li key={item.id} className={`stack__entry${dimmed ? ' is-dimmed' : ''}`}>
                    <Tag
                      className="stack__tile allow-motion"
                      data-group={group.id}
                      aria-label={`${item.name} (${group.label})`}
                      {...(item.url
                        ? { href: item.url, target: '_blank', rel: 'noreferrer' }
                        : { role: 'img' })}
                      onPointerEnter={show}
                      onFocus={show}
                      onBlur={() => setHovered(null)}
                    >
                      <StackLogo name={item.name} logo={item.logo} logoDark={item.logoDark} />
                    </Tag>
                  </li>
                )
              })}
            </Fragment>
          ))}
        </ul>

        <p className={`stack__name${hovered ? ' is-active' : ''}`} aria-live="polite">
          {label}
        </p>
      </div>
    </>
  )
}
