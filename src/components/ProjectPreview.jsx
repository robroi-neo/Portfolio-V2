import { useState } from 'react'

/**
 * One screenshot, or a placeholder sketch when there's no image (or it fails
 * to load). Used for the fan card covers and in the popup gallery.
 * Extra props (e.g. aria-hidden) go on the <img>.
 */
export default function ProjectPreview({ src, alt, className = '', ...imgProps }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        className={`preview preview--image ${className}`}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        {...imgProps}
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
