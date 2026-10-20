import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { withViewTransition } from '../lib/viewTransition.js'
import './ProjectFan.css'
import ProjectModal from './ProjectModal.jsx'
import ProjectPreview from './ProjectPreview.jsx'

// Shared view-transition-name: the clicked card and the popup's frame take
// turns wearing it, so the browser morphs one into the other.
const MORPH_NAME = 'project-morph'

/**
 * Overlapping project cards. Hovering the group spreads them out; clicking a
 * card grows it into ProjectModal. On phones the cards stack in a column.
 */
export default function ProjectFan({ projects }) {
  const [selected, setSelected] = useState(null)
  const dialogRef = useRef(null)
  const cardRef = useRef(null) // the card that opened the popup, to shrink back into
  const middle = (projects.length - 1) / 2

  function openProject(project, card) {
    cardRef.current = card
    card.style.viewTransitionName = MORPH_NAME // "before" snapshot: the card
    withViewTransition(() => {
      card.style.viewTransitionName = '' // hand the name over to the popup frame
      flushSync(() => setSelected(project)) // render the popup content right now
      dialogRef.current.showModal()
    })
  }

  function closeProject() {
    const card = cardRef.current
    withViewTransition(() => {
      dialogRef.current.close()
      if (card) card.style.viewTransitionName = MORPH_NAME // "after" snapshot: the card again
    }).finally(() => {
      if (card) card.style.viewTransitionName = ''
    })
  }

  return (
    <div className="fan breakout dot-grid">
      <ul className="fan__list" role="list" style={{ '--count': projects.length }}>
        {projects.map((project, i) => {
          // Distance from the middle card: -1.5, -0.5, 0.5, 1.5 for four cards.
          // CSS uses it to place, tilt, and drop each card.
          const offset = i - middle
          return (
            <li
              key={project.id}
              className="fan__item"
              style={{ '--offset': offset, '--drop': Math.abs(offset) }}
            >
              <button
                type="button"
                className={`fan__card fan__card--${project.theme}`}
                aria-haspopup="dialog"
                onClick={(event) => openProject(project, event.currentTarget)}
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
                <ProjectPreview project={project} className="fan__preview" />
              </button>
            </li>
          )
        })}
      </ul>

      <ProjectModal
        dialogRef={dialogRef}
        project={selected}
        onRequestClose={closeProject}
        onClosed={() => setSelected(null)}
      />
    </div>
  )
}
