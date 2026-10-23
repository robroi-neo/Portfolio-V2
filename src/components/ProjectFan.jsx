import { useState } from 'react'
import './ProjectFan.css'
import ProjectModal from './ProjectModal.jsx'
import ProjectPreview from './ProjectPreview.jsx'

/**
 * Overlapping project cards. Hovering the group spreads them out; clicking a
 * card opens it in ProjectModal. On phones the cards stack in a column.
 */
export default function ProjectFan({ projects }) {
  const [selected, setSelected] = useState(null)
  const middle = (projects.length - 1) / 2

  return (
    // is-open keeps the fan spread while the popup covers it, so the cards
    // don't fold and re-spread behind it.
    <div className={`fan breakout dot-grid${selected ? ' is-open' : ''}`}>
      <ul className="fan__list" role="list" style={{ '--count': projects.length }}>
        {projects.map((project, i) => {
          // Distance from the middle card: -1.5, -0.5, 0.5, 1.5 for four cards.
          // CSS uses it to place, tilt, and drop each card.
          const offset = i - middle
          return (
            <li
              key={project.id}
              className="fan__item allow-motion"
              style={{ '--offset': offset, '--drop': Math.abs(offset) }}
            >
              <button
                type="button"
                className={`fan__card fan__card--${project.theme} allow-motion`}
                aria-haspopup="dialog"
                onClick={() => setSelected(project)}
              >
                <span className="fan__dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="fan__title">{project.title}</span>
                {project.tags?.length > 0 && (
                  <span className="fan__tags">
                    {project.tags.map((tag, t) => (
                      <span key={tag} className={`chip${t === 0 ? ' chip--accent' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
                <ProjectPreview
                  src={project.images?.[0]}
                  alt={`Screenshot of ${project.title}`}
                  className="fan__preview"
                />
              </button>
            </li>
          )
        })}
      </ul>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
