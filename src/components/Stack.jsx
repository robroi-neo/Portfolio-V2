import { useState } from 'react'
import './Stack.css'

/** The logo, or the tool's first letter when there's no logo (or it fails to load). */
function StackLogo({ name, logo }) {
  const [failed, setFailed] = useState(false)

  if (logo && !failed) {
    return <img className="stack__img" src={logo} alt="" onError={() => setFailed(true)} />
  }
  return <span className="stack__fallback">{name.charAt(0).toUpperCase()}</span>
}

/** Row of tool icons. Hover or focus one to see its name underneath. One icon per entry. */
export default function Stack({ items }) {
  return (
    <ul className="stack" role="list">
      {items.map(({ id, name, logo, url }) => {
        const content = (
          <>
            <StackLogo name={name} logo={logo} />
            <span className="stack__tooltip" aria-hidden="true">
              {name}
            </span>
          </>
        )

        return (
          <li key={id}>
            {url ? (
              <a className="stack__item" href={url} target="_blank" rel="noreferrer" aria-label={name}>
                {content}
              </a>
            ) : (
              <span className="stack__item" role="img" aria-label={name}>
                {content}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
