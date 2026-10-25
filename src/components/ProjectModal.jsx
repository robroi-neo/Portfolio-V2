import { useEffect, useRef, useState } from 'react'
import './ProjectModal.css'
import ProjectGallery from './ProjectGallery.jsx'
import { GithubIcon, XIcon } from './icons.jsx'

/**
 * Full-screen popup for one project: big screenshot, title, description,
 * and a GitHub link when there is one. Fades in when `project` is set; every
 * way of closing (X, backdrop, Escape) fades it out, then calls `onClose`.
 *
 * Built on the native <dialog>: showModal() gives us the backdrop, focus
 * kept inside, and focus returned to the card afterwards.
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (project && !dialog.open) {
      dialog.showModal()
      // Let other parts of the page react (the music card pauses).
      window.dispatchEvent(new Event('portfolio:window-open'))
    }
  }, [project])

  // Start the fade-out; the dialog really closes when it finishes (below).
  function requestClose() {
    setClosing(true)
  }

  // Safety net: if the fade-out animation never reports back, close anyway.
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => dialogRef.current?.close(), 250)
    return () => clearTimeout(timer)
  }, [closing])

  function handleAnimationEnd(event) {
    if (closing && event.animationName === 'modal-out') dialogRef.current.close()
  }

  // Fires once the dialog is actually closed (by us, or natively).
  function handleClose() {
    setClosing(false)
    onClose()
  }

  // A click that lands on the <dialog> itself (not its content) is a backdrop click.
  function handleClick(event) {
    if (event.target === event.currentTarget) requestClose()
  }

  // Escape: stop the instant native close and fade out instead.
  function handleCancel(event) {
    event.preventDefault()
    requestClose()
  }

  return (
    <dialog
      ref={dialogRef}
      // allow-motion: the fade is gentle, so it plays even with reduced motion on.
      className={`project-modal allow-motion${closing ? ' is-closing' : ''}`}
      aria-labelledby="project-modal-title"
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      {project && (
        <div className="project-modal__body">
          <button
            type="button"
            className="project-modal__close"
            aria-label="Close"
            onClick={requestClose}
          >
            <XIcon size={18} />
          </button>

          <div className="project-modal__frame">
            {/* key starts each project at its first screenshot */}
            <ProjectGallery
              key={project.id}
              images={project.images}
              title={project.title}
              device={project.device}
              tags={project.tags}
              theme={project.theme}
            />
          </div>

          <div className="project-modal__caption">
            <h3 id="project-modal-title" className="project-modal__title">
              {project.title}
            </h3>
            <p className="project-modal__description">{project.description}</p>
            {project.github && (
              <a
                className="project-modal__link"
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                <GithubIcon size={16} />
                View on GitHub
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
