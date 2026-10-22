import { useCallback, useEffect, useRef, useState } from 'react'

const API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
const LOAD_TIMEOUT_MS = 8000

// The iFrame API script calls one global callback when it's ready, so load it
// once and share the result between any players on the page.
let apiPromise = null
function loadSpotifyApi() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      window.onSpotifyIframeApiReady = resolve
      const script = document.createElement('script')
      script.src = API_SRC
      script.async = true
      script.onerror = () => {
        apiPromise = null // allow a retry on a later mount
        reject(new Error('Spotify iFrame API failed to load'))
      }
      document.body.appendChild(script)
    })
  }
  return apiPromise
}

/** 'spotify:track:<id>' from a track URL like https://open.spotify.com/track/<id>?si=… */
export function trackUriFromUrl(url) {
  const id = url?.match(/track\/([A-Za-z0-9]{22})/)?.[1]
  // The placeholder ID (all X) in now-playing.json counts as "no track yet".
  return id && !/^X+$/.test(id) ? `spotify:track:${id}` : null
}

/**
 * Spotify's official embedded player (iFrame API), wired up so our own UI can
 * drive it and follow it. The player itself renders into `containerRef` and
 * must stay visible (Spotify's terms).
 *
 * `enabled` delays loading until we want it (e.g. when the card is near view).
 * Song length comes from Spotify, so it's always the real duration — note that
 * visitors who aren't logged in to Spotify get a 30-second preview.
 *
 * Playback position arrives only a few times a second, so `getProgress()`
 * guesses forward between updates for smooth animation.
 */
export function useSpotifyEmbed({ uri, enabled, containerRef, onEnded }) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false) // Spotify's script couldn't load at all
  const [slow, setSlow] = useState(false) // loaded, but the player isn't ready yet after 8s
  const [isPaused, setIsPaused] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [durationMs, setDurationMs] = useState(0)
  const [seconds, setSeconds] = useState(0) // whole seconds only → re-renders ~1×/s
  const [pendingPlay, setPendingPlay] = useState(false)
  // Some browsers (Safari, Firefox, strict privacy settings) won't let our
  // button start audio inside Spotify's iframe — only a click in their player.
  const [blocked, setBlocked] = useState(false)
  const blockedTimer = useRef(0)
  // Only play after the visitor asks: our play buttons, or a click inside
  // Spotify's own player. Anything else (e.g. a logged-in Spotify session
  // resuming on its own) gets paused right away.
  const playAllowed = useRef(false)

  const controllerRef = useRef(null)
  const playback = useRef({ position: 0, duration: 0, isPaused: true, at: 0 })
  const onEndedRef = useRef(onEnded)
  const pendingPlayRef = useRef(false)

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !uri || !container) return
    let cancelled = false

    const timeout = setTimeout(() => {
      // Not fatal: keep the player visible so it can still finish loading.
      if (!cancelled && !controllerRef.current?.isReady) setSlow(true)
    }, LOAD_TIMEOUT_MS)

    loadSpotifyApi()
      .then((IFrameAPI) => {
        if (cancelled) return
        // The API replaces this element with its <iframe>.
        const host = document.createElement('div')
        container.appendChild(host)

        IFrameAPI.createController(host, { uri, width: '100%', height: 80 }, (controller) => {
          if (cancelled) {
            controller.destroy()
            return
          }
          controllerRef.current = controller
          // The player is invisible, so keep keyboard focus out of it.
          container.querySelector('iframe')?.setAttribute('tabindex', '-1')

          controller.addListener('ready', () => {
            controller.isReady = true
            clearTimeout(timeout)
            setReady(true)
            setSlow(false)
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false
              setPendingPlay(false)
              controller.play()
            }
          })

          controller.addListener('playback_update', (event) => {
            const { isPaused: paused, isBuffering: buffering, position, duration } = event.data
            // Started without anyone pressing play → stop it.
            if (!paused && !playAllowed.current) {
              controller.pause()
              return
            }

            const prev = playback.current
            // Spotify pauses at the end of the track; treat "was playing near
            // the end, now paused" as the song finishing.
            const ended =
              !prev.isPaused &&
              paused &&
              prev.duration > 0 &&
              (prev.position >= prev.duration - 1500 || position >= duration - 500)

            playback.current = { position, duration, isPaused: paused, at: performance.now() }
            setIsPaused(paused)
            if (!paused) setBlocked(false)
            setIsBuffering(Boolean(buffering))
            setDurationMs(duration)
            setSeconds(ended ? 0 : Math.floor(position / 1000))
            if (ended) {
              playback.current.position = 0
              onEndedRef.current?.()
            }
          })
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
      clearTimeout(blockedTimer.current)
      controllerRef.current?.destroy()
      controllerRef.current = null
      container.replaceChildren()
    }
  }, [enabled, uri, containerRef])

  useEffect(() => {
    function onBlur() {
      // Focus moved into an iframe → the visitor clicked inside Spotify's player.
      setTimeout(() => {
        const active = document.activeElement
        if (active?.tagName === 'IFRAME' && containerRef.current?.contains(active)) {
          playAllowed.current = true
        }
      }, 0)
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [containerRef])

  /** 0–1 progress through the track, estimated forward between Spotify updates. */
  const getProgress = useCallback(() => {
    const pb = playback.current
    if (!pb.duration) return 0
    const position = pb.isPaused ? pb.position : pb.position + (performance.now() - pb.at)
    return Math.min(1, Math.max(0, position / pb.duration))
  }, [])

  /** Play/pause. If the player isn't ready yet, play as soon as it is. */
  const toggle = useCallback(() => {
    playAllowed.current = true
    const controller = controllerRef.current
    if (controller?.isReady) {
      const wasPaused = playback.current.isPaused
      controller.togglePlay()
      // Asked to play but nothing happened after a few seconds → the browser blocked it.
      if (wasPaused) {
        clearTimeout(blockedTimer.current)
        blockedTimer.current = setTimeout(() => {
          if (playback.current.isPaused) setBlocked(true)
        }, 3000)
      }
    } else {
      pendingPlayRef.current = !pendingPlayRef.current
      setPendingPlay(pendingPlayRef.current)
    }
  }, [])

  const pause = useCallback(() => {
    if (!playback.current.isPaused) controllerRef.current?.pause()
    pendingPlayRef.current = false
    setPendingPlay(false)
  }, [])

  return {
    ready,
    failed,
    slow,
    isPaused,
    isLoading: pendingPlay || (isBuffering && !isPaused),
    blocked,
    durationMs,
    seconds,
    getProgress,
    toggle,
    pause,
  }
}
