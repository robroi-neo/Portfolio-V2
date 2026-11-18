/**
 * A brown-switch mechanical keyboard press, made with the Web Audio API.
 *
 * No audio file: the sound is built from three short layers, so it costs no
 * download and plays with zero delay.
 *
 *   1. tactile bump  — a tiny, soft tick as the switch passes its bump.
 *                      Browns have no click jacket, so this stays quiet
 *                      (a blue switch would be a loud, bright click here).
 *   2. bottom-out    — the keycap hitting the plate: a short burst of noise,
 *                      band-passed so it sounds like plastic, not static.
 *   3. thock         — the low body of the board resonating, a quick pitch drop.
 *
 * A little randomness on each press keeps repeated opens from sounding robotic.
 */

let context = null
let noise = null

function getContext() {
  if (context) return context
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  context = new AudioCtx()
  return context
}

/** Half a second of white noise, made once and reused. */
function getNoise(ctx) {
  if (noise) return noise
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

const jitter = (amount) => 1 + (Math.random() * 2 - 1) * amount

function noiseBurst(ctx, out, { at, frequency, q, gain, decay }) {
  const source = ctx.createBufferSource()
  source.buffer = getNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = q
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, at)
  amp.gain.linearRampToValueAtTime(gain, at + 0.001)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  source.connect(filter).connect(amp).connect(out)
  source.start(at, Math.random() * 0.4)
  source.stop(at + decay + 0.01)
}

/**
 * Play one key press. Safe to call from any click or key handler: browsers
 * only allow sound after the visitor has interacted, and opening search
 * always comes from a click or a key press.
 *
 * @param {number} [volume=0.5]  0–1, on top of an already quiet mix
 */
export function playKeyClick(volume = 0.5) {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const now = ctx.currentTime + 0.005
  const out = ctx.createGain()
  out.gain.value = volume
  out.connect(ctx.destination)

  // 1. tactile bump: faint, high, very short
  noiseBurst(ctx, out, { at: now, frequency: 3800 * jitter(0.1), q: 2.5, gain: 0.08, decay: 0.006 })

  // 2. bottom-out: the main "tk", a few ms later
  const bottom = now + 0.012 * jitter(0.25)
  noiseBurst(ctx, out, { at: bottom, frequency: 1700 * jitter(0.12), q: 1.4, gain: 0.32, decay: 0.028 })

  // 3. thock: low body under the bottom-out
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(210 * jitter(0.08), bottom)
  osc.frequency.exponentialRampToValueAtTime(95, bottom + 0.05)
  const body = ctx.createGain()
  body.gain.setValueAtTime(0, bottom)
  body.gain.linearRampToValueAtTime(0.28, bottom + 0.002)
  body.gain.exponentialRampToValueAtTime(0.0001, bottom + 0.07)
  osc.connect(body).connect(out)
  osc.start(bottom)
  osc.stop(bottom + 0.08)
}
