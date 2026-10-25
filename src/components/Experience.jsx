import { useId, useState } from 'react'
import './Experience.css'
import { ChevronDownIcon } from './icons.jsx'

/** Company logo, or a tile with the company's first letter when there's no logo (or it fails to load). */
function CompanyLogo({ company, logo }) {
  const [failed, setFailed] = useState(false)

  if (logo && !failed) {
    return (
      <img
        className="experience__logo"
        src={logo}
        alt=""
        loading="lazy"
        decoding="async"
        width="20"
        height="20"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span className="experience__logo experience__logo--fallback" aria-hidden="true">
      {company.replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase()}
    </span>
  )
}

/** One entry. If it has highlights, they're tucked behind a "Details" toggle. */
function ExperienceItem({ start, end, role, company, logo, url, description, highlights }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const hasHighlights = highlights?.length > 0

  return (
    <li className="experience__item">
      <p className="experience__dates">
        {start} — {end || 'Now'}
      </p>

      <div className="experience__body">
        <h3 className="experience__title">
          {role} at{' '}
          <span className="experience__company">
            <CompanyLogo company={company} logo={logo} />
            {url ? (
              <a href={url} target="_blank" rel="noreferrer">
                {company}
              </a>
            ) : (
              company
            )}
          </span>
        </h3>
        <p className="experience__description">{description}</p>

        {hasHighlights && (
          <>
            <button
              type="button"
              className={`experience__toggle${open ? ' is-open' : ''}`}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Hide details' : 'Details'}
              <ChevronDownIcon size={14} />
            </button>

            {/* Always rendered so it can animate open; inert keeps it out of reach while closed. */}
            <div id={panelId} className={`experience__panel${open ? ' is-open' : ''}`} inert={!open}>
              <ul className="experience__highlights">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </li>
  )
}

/** Timeline-style list: dates on the left, role + company + description on the right. One row per entry. */
export default function Experience({ entries }) {
  return (
    <ol className="experience" role="list">
      {entries.map((entry) => (
        <ExperienceItem key={entry.id} {...entry} />
      ))}
    </ol>
  )
}
