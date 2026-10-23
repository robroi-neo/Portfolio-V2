import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRightIcon } from '../icons.jsx'
import Cassette from './Cassette.jsx'
import './mixtape.css'
import { trackUriFromUrl, useSpotifyEmbed } from './useSpotifyEmbed.js'
import { useReelMotion } from './useReelMotion.js'

/** 214 → "3:34". Unknown → "–:––". */
function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return totalSeconds === 0 ? '0:00' : '–:––'
  const s = Math.floor(totalSeconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * "Most replayed" music card: a mixtape cassette that plays the track through
 * Spotify's embedded player (design.md §14). Song details come from
 * src/data/now-playing.json; the length comes live from Spotify.
 */
export default function MixtapeCard({ track }) {
  const uri = trackUriFromUrl(track.spotifyUrl)

  // Load Spotify's (heavy) player only once the visitor shows interest in the
  // card: pointer over it, a tap, or keyboard focus. If they press play
  // before it's ready, it starts as soon as it loads.
  const [wantsPlayer, setWantsPlayer] = useState(false)
  const showInterest = wantsPlayer ? undefined : () => setWantsPlayer(true)
  const embedRef = useRef(null)

  const hubLeft = useRef(null)
  const hubRight = useRef(null)
  const packLeft = useRef(null)
  const packRight = useRef(null)
  const barRef = useRef(null)
  const hubRefs = useMemo(() => [hubLeft, hubRight], [])
  const packRefs = useMemo(() => [packLeft, packRight], [])

  const rewindRef = useRef(() => {})
  const handleEnded = useCallback(() => rewindRef.current(), [])

  const player = useSpotifyEmbed({
    uri,
    enabled: wantsPlayer && Boolean(uri),
    containerRef: embedRef,
    onEnded: handleEnded,
  })

  // Error state: reels still turn slowly on hover so the card isn't dead.
  const [hovered, setHovered] = useState(false)
  const failed = player.failed || !uri

  const state = failed
    ? 'error'
    : player.isLoading
      ? 'loading'
      : !player.isPaused
        ? 'playing'
        : player.seconds > 0
          ? 'paused'
          : 'idle'

  const targetSpeed =
    state === 'playing' ? 1 : state === 'loading' ? 0.3 : state === 'error' && hovered ? 0.4 : 0

  const { redraw, rewind } = useReelMotion({
    targetSpeed,
    getProgress: player.getProgress,
    hubRefs,
    packRefs,
    barRef,
  })

  useEffect(() => {
    rewindRef.current = rewind
  }, [rewind])

  // Paused but the position moved (e.g. scrubbed in the Spotify player): redraw once.
  useEffect(() => {
    redraw()
  }, [player.seconds, redraw])

  // Don't compete with a popup: pause when a window opens (ProjectModal fires this).
  const { pause } = player
  useEffect(() => {
    window.addEventListener('portfolio:window-open', pause)
    return () => window.removeEventListener('portfolio:window-open', pause)
  }, [pause])

  const playing = state === 'playing' || state === 'loading'
  const action = playing ? 'Pause' : 'Play'
  const trackName = `${track.title} by ${track.artist}`
  const durationSeconds = player.durationMs / 1000
  const timeText = `${formatTime(player.seconds)} of ${formatTime(durationSeconds)}`

  function handleToggle() {
    if (!failed) player.toggle()
  }

  return (
    <div className="mixtape" data-state={state} onPointerEnter={showInterest} onFocus={showInterest}>
      <button
        type="button"
        className="mixtape__cassette allow-motion"
        aria-pressed={playing}
        aria-label={`${action} ${trackName}`}
        onClick={handleToggle}
        // Hover only matters in the error state (slow spin), so don't re-render otherwise.
        onPointerEnter={failed ? () => setHovered(true) : undefined}
        onPointerLeave={failed ? () => setHovered(false) : undefined}
      >
        <Cassette title={track.title} artist={track.artist} hubRefs={hubRefs} packRefs={packRefs} />
      </button>

      {!failed && (
        <div className="mixtape__transport">
          <button
            type="button"
            className="mixtape__play allow-motion"
            aria-pressed={playing}
            aria-label={`${action} ${trackName}`}
            onClick={handleToggle}
          >
            {state === 'loading' ? (
              <span className="mixtape__spinner allow-motion" aria-hidden="true" />
            ) : playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 2.5v11a.6.6 0 0 0 .9.5l9-5.5a.6.6 0 0 0 0-1L4.9 2a.6.6 0 0 0-.9.5z" fill="currentColor" />
              </svg>
            )}
          </button>

          <div className="mixtape__progress">
            <div
              className="mixtape__track"
              role="progressbar"
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(durationSeconds) || 0}
              aria-valuenow={player.seconds}
              aria-valuetext={timeText}
            >
              <div ref={barRef} className="mixtape__fill" />
            </div>
            <div className="mixtape__times">
              <span>{formatTime(player.seconds)}</span>
              <span>{formatTime(durationSeconds)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mixtape__caption">
        {failed ? (
          <span>Can't play here —</span>
        ) : (
          <span className="mixtape__label">
            <span className="mixtape__eq" aria-hidden="true">
              <span className="allow-motion" />
              <span className="allow-motion" />
              <span className="allow-motion" />
            </span>
            {player.slow
              ? 'Spotify is taking a while to load…'
              : state === 'loading'
                ? 'Loading…'
                : player.blocked
                  ? 'Your browser blocked playback here —'
                  : track.label}
          </span>
        )}
        {track.spotifyUrl && (
          <a className="mixtape__spotify" href={track.spotifyUrl} target="_blank" rel="noreferrer">
            Listen on Spotify
            <ArrowUpRightIcon size={14} />
          </a>
        )}
      </div>

      {/* Spotify's own player: loaded but invisible — the cassette and our
          controls drive it. (Spotify's terms expect it to be visible; hidden by choice.) */}
      <div ref={embedRef} className="mixtape__embed" aria-hidden="true" />
    </div>
  )
}
