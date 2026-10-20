import './Dock.css'

/**
 * Floating dock (design.md §2). Each icon is a plain anchor link to its
 * section — smooth scrolling comes from CSS (`scroll-behavior: smooth`).
 * The highlighted icon follows `activeId`, which App gets from useActiveSection.
 */
export default function Dock({ sections, activeId }) {
  return (
    <nav className="dock" aria-label="Sections">
      <ul className="dock__list" role="list">
        {sections.map(({ id, name, Icon }) => {
          const isActive = id === activeId
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`dock__item${isActive ? ' is-active' : ''}`}
                aria-label={name}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="dock__icon">
                  <Icon />
                </span>
                <span className="dock__tooltip" aria-hidden="true">
                  {name}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
