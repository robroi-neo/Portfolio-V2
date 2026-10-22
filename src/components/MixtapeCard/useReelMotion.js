import { useCallback, useEffect, useRef } from 'react'

// Tape pack radius: empty hub → full pack (SVG units, design.md §14.6).
const LO = 24
const HI = 46
// Reel speed ω = K / r, tuned so ω = 165°/s at r = 35 (§14.5 A3).
const K = 5775
const SPIN_UP = 0.25 // seconds (A2)
const SPIN_DOWN = 0.45
const REWIND_MS = 700 // (A10)

/**
 * Radius of a tape pack holding `fill` (0–1) of the tape. Tape length is
 * fixed, so the two packs' *areas* add up to a constant — that's why the
 * supply reel shrinks faster near the end, like a real cassette.
 */
export const packRadius = (fill) => Math.sqrt(LO * LO + (HI * HI - LO * LO) * fill)

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * Drives the cassette with a requestAnimationFrame loop, writing straight to
 * the SVG/DOM through refs (no React re-renders per frame):
 * - reels spin at ω = K / r, so the small reel turns faster than the full one
 * - a motor `speed` eases toward `targetSpeed` (spin-up / spin-down)
 * - tape pack sizes and the progress bar follow `getProgress()`
 * - `rewind()` spins backwards fast while the tape winds back to the start
 *
 * The loop only runs while something is moving; call `redraw()` after the
 * progress changes while paused (e.g. the visitor scrubbed in Spotify).
 */
export function useReelMotion({ targetSpeed, getProgress, hubRefs, packRefs, barRef }) {
  const sim = useRef({
    speed: 0,
    angles: [0, 0],
    target: 0,
    getProgress: () => 0,
    rewindStart: null,
    raf: 0,
    last: 0,
    kick: () => {},
  })

  useEffect(() => {
    const s = sim.current

    function tick(now) {
      const dt = Math.min(0.05, (now - s.last) / 1000) // clamp after tab switches
      s.last = now

      let p
      let rewinding = false
      if (s.rewindStart !== null) {
        const t = (now - s.rewindStart) / REWIND_MS
        if (t >= 1) {
          s.rewindStart = null
          p = 0
        } else {
          rewinding = true
          p = 1 - easeInOut(t)
        }
      } else {
        p = s.getProgress()
      }

      // Motor: signed speed eases toward the target (negative = backwards).
      const target = rewinding ? -3 : s.target
      const rate = Math.abs(target) > Math.abs(s.speed) ? 1 / SPIN_UP : 1 / SPIN_DOWN
      s.speed += (target - s.speed) * Math.min(1, rate * dt)

      const rLeft = packRadius(1 - p) // supply reel shrinks
      const rRight = packRadius(p) // take-up reel grows
      packRefs[0].current?.setAttribute('r', rLeft.toFixed(2))
      packRefs[1].current?.setAttribute('r', rRight.toFixed(2))
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`

      s.angles[0] += (K / rLeft) * dt * s.speed
      s.angles[1] += (K / rRight) * dt * s.speed
      if (hubRefs[0].current) hubRefs[0].current.style.transform = `rotate(${s.angles[0]}deg)`
      if (hubRefs[1].current) hubRefs[1].current.style.transform = `rotate(${s.angles[1]}deg)`

      const moving = rewinding || s.target !== 0 || Math.abs(s.speed) > 0.01
      s.raf = moving ? requestAnimationFrame(tick) : 0
    }

    s.kick = () => {
      if (s.raf) return
      s.last = performance.now()
      s.raf = requestAnimationFrame(tick)
    }
    s.kick() // draw the first frame (tape packs at the right size)

    return () => {
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
  }, [hubRefs, packRefs, barRef])

  // Follow the latest target speed and progress source.
  useEffect(() => {
    const s = sim.current
    s.target = targetSpeed
    s.getProgress = getProgress
    s.kick()
  }, [targetSpeed, getProgress])

  const redraw = useCallback(() => sim.current.kick(), [])
  const rewind = useCallback(() => {
    sim.current.rewindStart = performance.now()
    sim.current.kick()
  }, [])

  return { redraw, rewind }
}
