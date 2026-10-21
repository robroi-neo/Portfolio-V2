import { PROFILE } from '../data/profile.js'
import { useInView } from '../hooks/useInView.js'
import './Signature.css'

// The signature as one continuous pen stroke, traced over the signature
// image (coordinates are in that image's pixels, hence the viewBox below).
// It must stay a single stroke, not a filled outline, for the drawing
// effect to work. In pen order:
const SIGNATURE_PATH = `
  M137 257.5 C178 234 245 199 296 184
  C280 194 230 226 205 242.5
  C222 236 250 220 275 213
  C278 213 279 217 283 217
  C290 217 296 212 303 213
  C312 215 312 226 300 234
  C280 248 250 260 238 258
  C232 257 234 252 243 249
  C270 237 320 215 356 207
  C359 206 361 209 359 212
`
// Up to the peak, back down, back up with a small kink, round the flat loop,
// then out through the loop into the tail and the final ink blob (the dot).

/**
 * Handwritten signature that draws itself, once, when it scrolls into view.
 *
 * How the drawing works: pathLength="1" makes the stroke's length 1 unit.
 * A dash pattern of "1 on, 2 off" shifted by 1 hides it completely; animating
 * the shift to 0 slides the visible dash in, so the line appears to be drawn
 * from start to end. The pen dot appears after the stroke finishes.
 */
export default function Signature() {
  const [ref, drawn] = useInView({ threshold: 0.6 })

  return (
    <svg
      ref={ref}
      // allow-motion: plays even with reduced motion on (see base.css).
      className={`signature allow-motion${drawn ? ' is-drawn' : ''}`}
      viewBox="132 178 232 84"
      role="img"
      aria-label={`${PROFILE.name}'s signature`}
    >
      <path className="signature__stroke allow-motion" d={SIGNATURE_PATH} pathLength="1" />
      <circle className="signature__dot allow-motion" cx="358.5" cy="211" r="2.4" />
    </svg>
  )
}
