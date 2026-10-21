import { useState } from 'react'
import { CONTACT } from '../data/contact.js'
import { PROFILE } from '../data/profile.js'
import './Contact.css'
import { ArrowUpRightIcon, GithubIcon, LinkedinIcon, MailIcon, XLogoIcon } from './icons.jsx'
import Signature from './Signature.jsx'

const ICONS = { mail: MailIcon, x: XLogoIcon, github: GithubIcon, linkedin: LinkedinIcon }

const STATUS_TEXT = {
  sending: 'Sending…',
  sent: "Thanks! Your message is on its way — I'll get back to you soon.",
  error: `Couldn't send that. Please try again, or email me at ${PROFILE.email}.`,
}

/** Contact form, link rows, and the signature footer. */
export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const { name, email, message, _gotcha } = Object.fromEntries(new FormData(form))
    if (_gotcha) return // hidden field filled in = spam bot

    // No form backend set up: open the visitor's email app with everything filled in.
    if (!CONTACT.formEndpoint) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(CONTACT.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  // Enter in the message sends (Shift+Enter for a new line) — on keyboards only;
  // on phones Enter keeps making new lines. requestSubmit runs the field checks first.
  function handleMessageKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    if (!window.matchMedia('(hover: hover)').matches) return
    event.preventDefault()
    event.currentTarget.form.requestSubmit()
  }

  const links = CONTACT.links.filter((link) => link.url)

  return (
    <div className="contact">
      <form className="contact__form" onSubmit={handleSubmit}>
        <div className="contact__row">
          <label className="sr-only" htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            className="field"
            name="name"
            placeholder="Name"
            autoComplete="name"
            required
          />
          <label className="sr-only" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            className="field"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        <label className="sr-only" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          className="field field--message"
          name="message"
          placeholder="Message"
          rows={7}
          required
          onKeyDown={handleMessageKeyDown}
        />

        {/* Honeypot: hidden from people, bots fill it in. */}
        <input
          className="contact__honeypot"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="contact__actions">
          <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
            Send message
          </button>
          <span className="contact__hint">
            or <kbd>⏎ Enter</kbd> to send
          </span>
        </div>

        <p className={`contact__status contact__status--${status}`} role="status">
          {STATUS_TEXT[status] ?? ''}
        </p>
      </form>

      <ul className="contact__links" role="list">
        {links.map(({ id, label, value, url, icon }) => {
          const LinkIcon = ICONS[icon] ?? MailIcon
          const external = !url.startsWith('mailto:')
          return (
            <li key={id}>
              <a
                className="contact__link"
                href={url}
                {...(external && { target: '_blank', rel: 'noreferrer' })}
              >
                <span className="contact__link-label">
                  <LinkIcon size={18} />
                  {label}
                </span>
                <span className="contact__link-value">
                  {value}
                  <ArrowUpRightIcon size={16} />
                </span>
              </a>
            </li>
          )
        })}
      </ul>

      <footer className="contact__footer">
        <Signature />
        <p className="contact__credit">
          © {new Date().getFullYear()} {PROFILE.name}
        </p>
      </footer>
    </div>
  )
}
