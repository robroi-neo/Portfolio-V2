import { PROFILE } from '../data/profile.js'
import { useInView } from '../hooks/useInView.js'
import './Signature.css'

// Display signature "R.N Dingal" — deliberately not a legal signature.
// Generated from the Hershey Script 1-stroke font (MIT, single-stroke glyphs
// made for pen plotters), so every piece is a real pen stroke that can be
// drawn on. Each entry: [path, length]; listed in writing order.
const STROKES = [
  ["M44.1 20.2L47.2 23.3L47.2 32.8L44.1 45.4L41 54.8L37.8 61.1L31.5 70.5L25.2 76.9L18.9 80L15.8 80L12.6 76.9L12.6 67.4L15.8 51.6L18.9 42.2L22 35.9L28.4 26.4L34.6 20.2L41 17L50.4 13.8L63 13.8L69.3 17L72.4 20.2L75.6 26.4L75.6 35.9L72.4 42.2L69.3 45.4L63 48.5L53.6 48.5L44.1 45.4L47.2 48.5L50.4 54.8L50.4 70.5L53.6 76.9L59.8 80L66.2 76.9L69.3 73.7L75.6 64.2", 301.3],
  ["M97.7 73.7L94.6 76.9L97.7 80L100.8 76.9L97.7 73.7", 17.7],
  ["M129.2 35.9L122.9 32.8L119.8 26.4L119.8 23.3L122.9 17L129.2 13.8L132.3 13.8L138.7 17L141.8 23.3L141.8 29.6L138.7 45.4L135.5 58L129.2 80", 106.9],
  ["M135.5 58L144.9 32.8L151.3 20.2L154.4 17L160.7 13.8L167 13.8L173.3 17L176.5 23.3L176.5 29.6L173.3 45.4L167 67.4L167 76.9L170.1 80L173.3 80L179.6 76.9L182.7 73.7L189.1 64.2", 158.3],
  ["M267.8 13.8L261.5 17L258.3 23.3L255.2 35.9L252.1 54.8L248.9 64.2L245.7 70.5L239.5 76.9L233.2 80L226.9 80L223.7 76.9L223.7 70.5L226.9 67.4L233.2 67.4L239.5 70.5L245.7 76.9L255.2 80L264.7 80L274.1 76.9L280.4 70.5L286.7 58L289.9 42.2L289.9 29.6L286.7 20.2L283.5 17L277.3 13.8L267.8 13.8L261.5 20.2L261.5 26.4L264.7 35.9L270.9 45.4L277.3 51.6L286.7 58L293 61.1", 298.9],
  ["M308.7 35.9L308.7 39L311.9 39L311.9 35.9L308.7 35.9", 12.6],
  ["M299.3 64.2L305.6 51.6L299.3 70.5L299.3 76.9L302.4 80L305.6 80L311.9 76.9L315 73.7L321.3 64.2", 70.9],
  ["M321.3 64.2L327.6 54.8L333.9 51.6L337 54.8L337 58L333.9 70.5L330.7 80", 48.9],
  ["M333.9 70.5L337 64.2L343.3 54.8L349.6 51.6L355.9 51.6L359.1 54.8L359.1 61.1L355.9 70.5L355.9 76.9L359.1 80L362.2 80L368.5 76.9L371.7 73.7L377.9 64.2", 89.3],
  ["M406.3 61.1L403.2 54.8L396.8 51.6L390.6 51.6L384.3 54.8L381.1 58L378 64.2L378 70.5L381.1 76.9L387.4 80L393.7 80L400 76.9L403.2 73.7", 77.2],
  ["M409.4 51.6L403.2 73.7L390.6 108.4L387.4 114.6L381.1 117.8L378 114.6L378 108.4L381.1 98.9L390.6 89.5L400 83.2L406.3 80L415.8 73.7L425.2 64.2", 151.1],
  ["M453.5 61.1L450.4 54.8L444 51.6L437.8 51.6L431.5 54.8L428.3 58L425.2 64.2L425.2 70.5L428.3 76.9L434.6 80L440.9 80L447.2 76.9L450.4 70.5L456.6 51.6L453.5 67.4L453.5 76.9L456.6 80L459.8 80L466.1 76.9L469.2 73.7L475.6 64.2", 155.8],
  ["M475.6 64.2L481.9 54.8L491.3 39L494.4 32.8L497.6 23.3L497.6 17L494.4 13.8L488.2 17L485 23.3L481.9 35.9L478.7 58L478.7 76.9L481.9 80L485 80L491.3 76.9L494.4 73.7L500.8 64.2", 156.2],
]
const VIEWBOX = '8 9 497 112'

// Each stroke gets a share of the total draw time proportional to its length,
// starting when the previous one ends, so the name is written out in order.
const TOTAL = STROKES.reduce((sum, [, len]) => sum + len, 0)
let elapsed = 0
const TIMED = STROKES.map(([d, len]) => {
  const start = elapsed / TOTAL
  elapsed += len
  return { d, start, share: len / TOTAL }
})

/**
 * Handwritten display signature that writes itself, once, when it scrolls
 * into view.
 *
 * How the drawing works: pathLength="1" makes each stroke 1 unit long. A
 * dash pattern of "1 on, 2 off" shifted by 1 hides it; transitioning the
 * shift to 0 reveals it from start to end. Each stroke's delay and duration
 * (CSS vars, as fractions of --draw-time) make them play one after another.
 */
export default function Signature() {
  const [ref, drawn] = useInView({ threshold: 0.6 })

  return (
    <svg
      ref={ref}
      // allow-motion: plays even with reduced motion on (see base.css).
      className={`signature allow-motion${drawn ? ' is-drawn' : ''}`}
      viewBox={VIEWBOX}
      role="img"
      aria-label={`${PROFILE.name}'s signature`}
    >
      {TIMED.map(({ d, start, share }) => (
        <path
          key={d}
          className="signature__stroke allow-motion"
          d={d}
          pathLength="1"
          style={{ '--start': start, '--share': share }}
        />
      ))}
    </svg>
  )
}
