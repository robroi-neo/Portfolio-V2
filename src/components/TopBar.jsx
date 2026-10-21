import './TopBar.css'
import { ClockIcon, MoonIcon, SunIcon } from './icons.jsx'
import { useClock } from '../hooks/useClock.js'
import { useTheme } from '../hooks/useTheme.js'

// Davao has no daylight saving, so the offset is always GMT+8.
const TIME_ZONE = 'Asia/Manila'
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Thin strip at the very top of the page: location on the left, live clock + theme toggle on the right. */
export default function TopBar() {
  const now = useClock()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="topbar">
      <span className="topbar__location">Davao, PH</span>
      <span className="topbar__right">
        <span className="topbar__clock">
          <ClockIcon size={14} />
          <time dateTime={now.toISOString()}>{timeFormat.format(now)} GMT+8</time>
        </span>
        <button
          type="button"
          className="topbar__theme"
          onClick={(event) => toggle(event.currentTarget)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>
      </span>
    </div>
  )
}
