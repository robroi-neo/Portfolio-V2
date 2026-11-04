import { useState } from 'react'
import { PROFILE } from '../data/profile.js'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut.js'
import { emojiConfetti } from '../lib/emojiConfetti.js'
import './Hero.css'
import { ArrowDownIcon, CheckIcon, MailIcon } from './icons.jsx'

/** Introduction: avatar, name, role, short bio, and the two main actions. */
export default function Hero() {
  const { copied, copy } = useCopyToClipboard(PROFILE.email)
  // Fall back to initials when no photo is set or the file can't be loaded.
  const [photoFailed, setPhotoFailed] = useState(false)

  // Easter egg: the highlighted word fires emoji confetti up from the bottom of the screen.
  function burst() {
    emojiConfetti({ emoji: PROFILE.confetti || '🤖' })
  }
  const showPhoto = Boolean(PROFILE.photo) && !photoFailed

  useKeyboardShortcut('c', copy)

  return (
    <div className="hero">
      <div className="hero__avatar">
        {showPhoto ? (
          <img
            className="hero__photo"
            src={PROFILE.photo}
            alt={PROFILE.name}
            width="80"
            height="80"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span aria-hidden="true">[{PROFILE.initials}]</span>
        )}
        <span className="hero__status" aria-hidden="true" />
      </div>

      <div className="hero__id">
        <h1 className="hero__name">{PROFILE.name}</h1>
        <p className="hero__role">{PROFILE.role}</p>
      </div>

      <p className="hero__bio">
        Hey, I'm {PROFILE.firstName}, a software developer in Davao, Philippines who
        likes putting{' '}
        <button type="button" className="highlight highlight--button" onClick={burst}>
          machine learning
        </button>{' '}
        to work on the
        web. I wire models into real products, and make small games on the side.
      </p>

      <div className="hero__actions">
        <a href="#contact" className="btn btn--primary">
          <MailIcon size={16} />
          Get in touch
        </a>
        <a href="#projects" className="btn btn--secondary">
          See my work
          <ArrowDownIcon size={16} />
        </a>
      </div>

      <p className="hero__hint">
        {copied ? (
          <>
            <CheckIcon size={14} /> Email copied
          </>
        ) : (
          <>
            Press <kbd>C</kbd> to copy my email
          </>
        )}
      </p>

      <span className="sr-only" role="status">
        {copied ? 'Email copied to clipboard' : ''}
      </span>
    </div>
  )
}
