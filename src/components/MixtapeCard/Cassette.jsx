import { memo, useEffect, useId, useRef, useState } from 'react'
import { packRadius } from './useReelMotion.js'

const SVG_NS = 'http://www.w3.org/2000/svg'
const TITLE_MAX_WIDTH = 400 // SVG units available for the title on the label
const TITLE_SIZES = [34, 32, 30, 28, 26] // step down until it fits (§14.2 "Long titles")

// Fill/stroke from the cassette tokens in mixtape.css.
const fill = (token) => ({ fill: `var(--tape-${token})` })

/**
 * Fits the title on the label: once fonts have loaded, measure it and step
 * the font size down to 26; if it still doesn't fit, cut it with "…".
 * Measures with a throwaway <text> so React's own text nodes are untouched.
 */
function useFittedTitle(svgRef, title) {
  const [fit, setFit] = useState({ size: TITLE_SIZES[0], text: title })

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      const svg = svgRef.current
      if (cancelled || !svg) return

      const probe = document.createElementNS(SVG_NS, 'text')
      probe.setAttribute('class', 'mixtape__title')
      probe.style.visibility = 'hidden'
      svg.appendChild(probe)
      const widthOf = (text, size) => {
        probe.setAttribute('font-size', size)
        probe.textContent = text
        return probe.getComputedTextLength()
      }

      let result = null
      for (const size of TITLE_SIZES) {
        if (widthOf(title, size) <= TITLE_MAX_WIDTH) {
          result = { size, text: title }
          break
        }
      }
      if (!result) {
        const size = TITLE_SIZES.at(-1)
        let cut = title
        while (cut.length > 1 && widthOf(`${cut.trimEnd()}…`, size) > TITLE_MAX_WIDTH) {
          cut = cut.slice(0, -1)
        }
        result = { size, text: `${cut.trimEnd()}…` }
      }

      probe.remove()
      setFit(result)
    })
    return () => {
      cancelled = true
    }
  }, [svgRef, title])

  return fit
}

/** One reel hub with 6 teeth, drawn at (0,0) so the inner <g> rotates around its center. */
function Hub({ x, hubRef }) {
  return (
    <g transform={`translate(${x} 170)`}>
      <g ref={hubRef} className="mixtape__hub">
        <circle r="21" style={fill('hub')} />
        <circle r="12" style={fill('shell')} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect key={deg} x="-2" y="-12" width="4" height="6" transform={`rotate(${deg})`} style={fill('hub')} />
        ))}
      </g>
    </g>
  )
}

/**
 * The mixtape cassette as one inline SVG (design.md §14.2, back to front).
 * Purely visual: the reels and tape packs are animated through the refs by
 * useReelMotion.
 */
function Cassette({ title, artist, hubRefs, packRefs }) {
  const id = useId()
  const ribId = `${id}-rib`
  const winId = `${id}-win`
  const sheenId = `${id}-sheen`
  const svgRef = useRef(null)
  const titleFit = useFittedTitle(svgRef, title)
  const startRadius = packRadius(1) // before the first frame: all tape on the left
  const endRadius = packRadius(0)

  return (
    <svg ref={svgRef} className="mixtape__svg" viewBox="0 0 560 350" aria-hidden="true" focusable="false">
      <title>{`${title} by ${artist}`}</title>
      <defs>
        <pattern id={ribId} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" style={fill('shell')} />
          <rect x="1" y="1" width="3" height="3" style={fill('rib')} />
        </pattern>
        <clipPath id={winId}>
          <rect x="162" y="134" width="236" height="72" rx="36" />
        </clipPath>
        {/* Glossy light falling on the top of the plastic (strength: --tape-sheen). */}
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#fff', stopOpacity: 'var(--tape-sheen)' }} />
          <stop offset="0.45" style={{ stopColor: '#fff', stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* 1 Shell */}
      <rect width="560" height="350" rx="20" fill={`url(#${ribId})`} />
      <rect width="560" height="350" rx="20" fill={`url(#${sheenId})`} />
      {/* Edge highlight so the black shell stands out on dark backgrounds (--tape-rim). */}
      <rect
        x="0.75"
        y="0.75"
        width="558.5"
        height="348.5"
        rx="19.25"
        fill="none"
        style={{ stroke: 'var(--tape-rim)' }}
        strokeWidth="1.5"
      />

      {/* 2 Screws */}
      {[
        [18, 18],
        [542, 18],
        [18, 332],
        [542, 332],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="6" style={fill('screw')} />
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#141414" strokeWidth="1.5" />
        </g>
      ))}

      {/* 3 Label */}
      <rect x="34" y="26" width="492" height="214" rx="10" style={fill('label')} />

      {/* 4 Write-protect corner mark */}
      <path d="M46 40h18l8 8v22H46z" fill="none" stroke="rgb(0 0 0 / 0.5)" strokeWidth="1.5" />

      {/* 5 Writing lines */}
      <line x1="86" y1="76" x2="506" y2="76" style={{ stroke: 'var(--tape-line)' }} strokeWidth="1.5" />
      <line x1="86" y1="104" x2="506" y2="104" style={{ stroke: 'var(--tape-line)' }} strokeWidth="1.5" />

      {/* 6 Title (handwritten) + 7 artist line */}
      <text className="mixtape__title" x="90" y="70" fontSize={titleFit.size} style={fill('ink')}>
        {titleFit.text}
      </text>
      <text className="mixtape__artist" x="90" y="98" fontSize="24" style={fill('ink-soft')}>
        {artist} · most replayed
      </text>

      {/* 8 Side letter */}
      <text className="mixtape__side" x="500" y="70" fontSize="24" textAnchor="middle" style={fill('ink')}>
        A
      </text>

      {/* 9 Stripes */}
      <rect x="34" y="118" width="492" height="12" style={fill('stripe')} />
      <rect x="34" y="132" width="492" height="5" style={fill('gold')} />
      <rect x="34" y="140" width="492" height="10" style={fill('stripe')} />
      <rect x="34" y="170" width="492" height="58" style={fill('gold')} />

      {/* 10 Window frame + 11 window inside */}
      <rect x="150" y="124" width="260" height="92" rx="46" style={fill('shell')} />
      <rect x="162" y="134" width="236" height="72" rx="36" style={fill('window')} />

      {/* 12 Tape packs (radius set every frame by useReelMotion) */}
      <g clipPath={`url(#${winId})`}>
        {[
          [212, startRadius, packRefs[0]],
          [348, endRadius, packRefs[1]],
        ].map(([cx, r, ref]) => (
          <circle
            key={cx}
            ref={ref}
            cx={cx}
            cy="170"
            r={r}
            style={{ fill: 'var(--tape-pack)', stroke: 'var(--tape-pack-edge)' }}
            strokeWidth="2"
          />
        ))}
      </g>

      {/* 13 Center glass */}
      <rect x="262" y="150" width="36" height="40" rx="3" style={fill('shell')} opacity="0.55" />

      {/* 14 Reel hubs (rotated by useReelMotion) */}
      <Hub x={212} hubRef={hubRefs[0]} />
      <Hub x={348} hubRef={hubRefs[1]} />

      {/* 15 Bottom guard + 16 holes */}
      <path d="M128 350 L148 284 L412 284 L432 350 Z" style={fill('guard')} />
      <rect x="160" y="314" width="12" height="12" style={fill('hole')} />
      <rect x="388" y="314" width="12" height="12" style={fill('hole')} />
      <circle cx="204" cy="320" r="7" style={fill('hole')} />
      <circle cx="356" cy="320" r="7" style={fill('hole')} />
      <circle cx="244" cy="320" r="5" style={fill('hole')} />
      <circle cx="316" cy="320" r="5" style={fill('hole')} />
    </svg>
  )
}

// The time display re-renders the card every second; the cassette's props
// don't change then (reels move via refs), so skip re-rendering the SVG.
export default memo(Cassette)
