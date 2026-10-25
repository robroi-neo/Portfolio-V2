/**
 * Shown in the project popup when a project has no screenshots yet: a mock
 * app window (top bar, stat cards, bar chart) with the project's
 * name and tech tags in the middle. Matches the card's light/dark theme.
 * Purely decorative — the real title and description are in the caption.
 */
const BARS = [45, 70, 55, 90, 65, 80, 40] // bar heights in %

export default function ProjectPlaceholder({ title, tags = [], theme = 'light' }) {
  return (
    <div className={`placeholder placeholder--${theme}`} aria-hidden="true">
      <div className="placeholder__bar">
        <span className="placeholder__dots">
          <span />
          <span />
          <span />
        </span>
        <span className="placeholder__url" />
      </div>

      <div className="placeholder__body">
        <div className="placeholder__main">
          <div className="placeholder__header">
            <span className="placeholder__line placeholder__line--title" />
            <span className="placeholder__avatar" />
          </div>

          <div className="placeholder__hero">
            <p className="placeholder__name">{title.trim()}</p>
            {tags.length > 0 && (
              <div className="placeholder__tags">
                {tags.map((tag, i) => (
                  <span key={tag} className={`placeholder__tag${i === 0 ? ' is-accent' : ''}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="placeholder__stats">
            {[0, 1, 2].map((i) => (
              <div key={i} className="placeholder__card">
                <span className="placeholder__line placeholder__line--short" />
                <span className="placeholder__line placeholder__line--big" />
              </div>
            ))}
          </div>

          <div className="placeholder__chart">
            {BARS.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
