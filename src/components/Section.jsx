/**
 * One page section. Handles the id (for the dock), the label/heading header,
 * and the column layout. Put anything inside; add className="breakout" to a
 * child to make it full width.
 */
export default function Section({ id, label, heading, intro, ariaLabel, children }) {
  const headingId = heading ? `${id}-heading` : undefined
  const hasHeader = label || heading || intro

  return (
    <section
      id={id}
      className="section"
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : (ariaLabel ?? label)}
    >
      {hasHeader && (
        <header className="section__header">
          {label && <p className="label">{label}</p>}
          {heading && (
            <h2 id={headingId} className="heading">
              {heading}
            </h2>
          )}
          {intro && <p className="section__intro">{intro}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
