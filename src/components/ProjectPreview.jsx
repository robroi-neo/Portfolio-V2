import { useState } from 'react'

/**
 * A project's screenshot, or a placeholder sketch when there's no image
 * (or it fails to load). Used on the fan cards and in the popup.
 */
export default function ProjectPreview({ project, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (project.image && !failed) {
    return (
      <img
        className={`preview preview--image ${className}`}
        src={project.image}
        alt={`Screenshot of ${project.title}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={`preview preview--sketch ${className}`} aria-hidden="true">
      <span className="preview__line" />
      <span className="preview__line preview__line--short" />
      <div className="preview__blocks">
        <span />
        <span className="is-accent" />
        <span />
      </div>
    </div>
  )
}
