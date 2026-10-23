import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx'
import ProjectPreview from './ProjectPreview.jsx'

// How far (as a share of the gallery width) a drag must go to change slide.
const SWIPE_THRESHOLD = 0.15
// Phone screenshots per slide: side by side on wide screens, one at a time on phones.
const PHONES_PER_SLIDE = 3
const NARROW = '(max-width: 600px)'

/** [a, b, c, d, e] → [[a, b, c], [d, e]] */
function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/**
 * Screenshots in the project popup. One image (or none) shows as-is; with
 * more, they sit side by side in a strip that slides left/right — via the
 * arrows, the dots, ← / → keys, or by dragging / swiping.
 *
 * device="phone": tall mobile screenshots are grouped a few per slide so
 * they fill the wide frame instead of showing as one narrow strip.
 */
export default function ProjectGallery({ images = [], title, device }) {
  const isPhone = device === 'phone'
  const [perSlide] = useState(() =>
    isPhone && !window.matchMedia(NARROW).matches ? PHONES_PER_SLIDE : 1,
  )
  const slides = chunk(images, perSlide)
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0) // live drag offset in px
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null) // { x, width }
  const count = slides.length

  // ← / → while the popup is open (this only exists while it's open).
  useEffect(() => {
    if (count < 2) return
    function onKeyDown(event) {
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count)
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % count)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count])

  if (images.length < 2) {
    return (
      <ProjectPreview
        src={images[0]}
        alt={`Screenshot of ${title}`}
        className="project-modal__preview"
      />
    )
  }

  const go = (step) => setIndex((i) => (i + step + count) % count)

  // ---- Drag / swipe (mouse, pen and touch all arrive as pointer events) ----
  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStart.current = { x: event.clientX, width: event.currentTarget.offsetWidth }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function handlePointerMove(event) {
    if (dragStart.current) setDragX(event.clientX - dragStart.current.x)
  }

  function handlePointerEnd() {
    if (!dragStart.current) return
    const { width } = dragStart.current
    if (Math.abs(dragX) > width * SWIPE_THRESHOLD) go(dragX < 0 ? 1 : -1)
    dragStart.current = null
    setDragX(0)
    setDragging(false)
  }

  return (
    <div className="gallery" role="group" aria-roledescription="carousel" aria-label={`${title} screenshots`}>
      <div
        className={`gallery__viewport${dragging ? ' is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="gallery__track allow-motion"
          style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
        >
          {slides.map((group, i) => (
            <div
              key={group[0]}
              className={`gallery__slide${isPhone ? ' gallery__slide--phone' : ''}`}
              aria-hidden={i === index ? undefined : true}
            >
              {group.map((src) => {
                const n = images.indexOf(src) + 1
                return (
                  <ProjectPreview
                    key={src}
                    src={src}
                    alt={`${title}, screenshot ${n} of ${images.length}`}
                    className="project-modal__preview"
                    draggable={false}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="gallery__nav gallery__nav--prev" aria-label="Previous screenshot" onClick={() => go(-1)}>
        <ChevronLeftIcon size={20} />
      </button>
      <button type="button" className="gallery__nav gallery__nav--next" aria-label="Next screenshot" onClick={() => go(1)}>
        <ChevronRightIcon size={20} />
      </button>

      <div className="gallery__dots">
        {slides.map((group, i) => (
          <button
            key={group[0]}
            type="button"
            className="gallery__dot"
            aria-label={`Slide ${i + 1} of ${count}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
