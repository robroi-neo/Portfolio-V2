/**
 * One page section. Handles the id (for the dock), the label/intro header,
 * and the column layout. Put anything inside; add className="breakout" to a
 * child to make it full width.
 */
export default function Section({ id, label, intro, ariaLabel, children }) {
  const hasHeader = label || intro

  return (
    <section id={id} className="section" aria-label={ariaLabel ?? label}>
      {hasHeader && (
        <header className="section__header">
          {label && <p className="label">{label}</p>}
          {intro && <p className="section__intro">{intro}</p>}
        </header>
      )}
      {children}
    </section>
  )
}