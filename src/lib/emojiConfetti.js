/**
 * Emoji confetti: fires emoji up from the bottom of the screen on a temporary
 * full-screen canvas.
 *
 * - The canvas ignores the pointer, sits above everything, and is removed as
 *   soon as the last emoji has faded, so it costs nothing when idle.
 * - Each emoji is drawn once into a small bitmap and reused (drawImage is far
 *   cheaper than drawing text ~100 times a frame).
 * - Calling it again while a burst is running adds to the same canvas.
 */

const COUNT = 100 // emoji per burst
const GRAVITY = 1400 // px/s²
const DRAG = 0.995 // per-frame velocity kept (light air resistance)
const LIFE = 2.8 // seconds an emoji lives (fades over the last third)

let canvas = null
let ctx = null
let particles = []
let frame = 0
let last = 0
const sprites = new Map() // emoji → pre-rendered bitmap

function sprite(emoji) {
  if (sprites.has(emoji)) return sprites.get(emoji)
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `${size * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
  g.fillText(emoji, size / 2, size / 2 + size * 0.05)
  sprites.set(emoji, c)
  return c
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '999',
  })
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function teardown() {
  window.removeEventListener('resize', resize)
  canvas.remove()
  canvas = ctx = null
}

const rand = (min, max) => min + Math.random() * (max - min)

function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000) // cap after tab switches
  last = now
  ctx.clearRect(0, 0, innerWidth, innerHeight)

  particles = particles.filter((p) => {
    p.age += dt
    if (p.age < 0) return true // still waiting for its staggered launch
    if (p.age >= p.life || (p.vy > 0 && p.y > innerHeight + 80)) return false
    p.vx *= DRAG
    p.vy = p.vy * DRAG + GRAVITY * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.rot += p.spin * dt

    const fade = Math.min(1, (p.life - p.age) / (p.life / 3))
    ctx.globalAlpha = fade
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size)
    ctx.restore()
    return true
  })
  ctx.globalAlpha = 1

  if (particles.length) {
    frame = requestAnimationFrame(tick)
  } else {
    frame = 0
    teardown()
  }
}

/**
 * Fires emoji up from the bottom edge of the screen: they launch from all
 * along the bottom, rise to around the top, slow down, and fall back.
 *
 * @param {object} options
 * @param {string|string[]} options.emoji one emoji or a list to pick from at random
 */
export function emojiConfetti({ emoji = '🎉' } = {}) {
  const choices = (Array.isArray(emoji) ? emoji : [emoji]).filter(Boolean)
  if (!choices.length) return
  ensureCanvas()
  const pick = () => sprite(choices[Math.floor(Math.random() * choices.length)])

  // Launch speed that just reaches the top of the screen under gravity
  // (v = √(2gh)); each emoji gets a bit less or more so the heights vary.
  const toTop = Math.sqrt(2 * GRAVITY * innerHeight)

  for (let i = 0; i < COUNT; i++) {
    const angle = -Math.PI / 2 + rand(-0.35, 0.35) // mostly straight up, fanning a little
    const speed = toTop * rand(0.7, 1.05)
    particles.push({
      img: pick(),
      x: rand(0, innerWidth),
      y: innerHeight + rand(20, 60), // just below the bottom edge
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: rand(22, 44),
      rot: rand(0, Math.PI * 2),
      spin: rand(-6, 6),
      age: rand(-0.25, 0), // tiny stagger so they don't all leave at once
      life: LIFE * rand(0.9, 1.15),
    })
  }

  if (!frame) {
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }
}
