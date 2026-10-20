import './ProjectModal.css'
import ProjectPreview from './ProjectPreview.jsx'
import { GithubIcon, XIcon } from './icons.jsx'

/**
 * Full-screen popup for one project: big screenshot, title, description,
 * and a GitHub link when there is one.
 *
 * Built on the native <dialog>. ProjectFan opens it with showModal(), which
 * gives us the backdrop, focus kept inside, and focus returned to the card.
 * Every way of closing (X, backdrop, Escape) goes through `onRequestClose`
 * so ProjectFan can animate it; `onClosed` fires once it's actually closed.
 */
export default function ProjectModal({ dialogRef, project, onRequestClose, onClosed }) {
  // A click that lands on the <dialog> itself (not its content) is a backdrop click.
  function handleClick(event) {
    if (event.target === event.currentTarget) onRequestClose()
  }

  // Escape: stop the instant native close and use the animated one instead.
  function handleCancel(event) {
    event.preventDefault()
    onRequestClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="project-modal"
      aria-labelledby="project-modal-title"
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={onClosed}
    >
      {project && (
        <div className="project-modal__body">
          <button
            type="button"
            className="project-modal__close"
            aria-label="Close"
            onClick={onRequestClose}
          >
            <XIcon size={18} />
          </button>

          <div className="project-modal__frame">
            {/* key resets the image's "failed" state when switching projects */}
            <ProjectPreview key={project.id} project={project} className="project-modal__preview" />
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
