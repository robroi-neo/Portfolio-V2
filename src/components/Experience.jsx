import { useState } from 'react'
import './Experience.css'

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

/** Timeline-style list: dates on the left, role + company + description on the right. One row per entry. */
export default function Experience({ entries }) {
  return (
    <ol className="experience" role="list">
      {entries.map(({ id, start, end, role, company, logo, url, description }) => (
        <li key={id} className="experience__item">
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
          </div>
        </li>
      ))}
    </ol>
  )
}
