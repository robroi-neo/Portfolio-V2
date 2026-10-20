import Dock from './components/Dock.jsx'
import Section from './components/Section.jsx'
import Slot from './components/Slot.jsx'
import TopBar from './components/TopBar.jsx'
import { SECTIONS, SECTION_IDS } from './data/sections.js'
import { useActiveSection } from './hooks/useActiveSection.js'
import { useScrollToHash } from './hooks/useScrollToHash.js'

// Phase 1: the page skeleton. Each <Slot> marks a component built in a later phase.
export default function App() {
  const activeId = useActiveSection(SECTION_IDS)
  useScrollToHash()

  return (
    <>
      <TopBar />
      <main className="page">
        <Section id="home" ariaLabel="Introduction">
          <Slot minHeight={420}>Hero · location + clock, avatar, name, intro, actions</Slot>
        </Section>

        <Section
          id="projects"
          label="Work"
          heading="Selected projects"
          intro="Hover to spread them out. Click one to open its case study."
        >
          <Slot className="breakout dot-grid" minHeight={380}>
            Project fan · 4 cards
          </Slot>
        </Section>

        <Section id="experience" label="Experience" heading="Where I've worked and learned">
          <Slot minHeight={280}>Experience entries + résumé link</Slot>
        </Section>

        <Section id="stack" label="Stack" heading="Tools I reach for">
          <Slot minHeight={220}>Stack rows · label + chips</Slot>
        </Section>

        <Section
          id="personal"
          label="Personal"
          intro="In my spare time, I play games, practice guitar, and build things just for fun."
        >
          <Slot minHeight={140}>Music card</Slot>
          <Slot className="breakout" minHeight={260}>
            Photo fan
          </Slot>
          <Slot minHeight={140}>Arcade door</Slot>
        </Section>

        <Section id="contact" label="Contact" heading="Say hello">
          <Slot minHeight={320}>Form · link rows · signature footer</Slot>
        </Section>
      </main>

      <Dock sections={SECTIONS} activeId={activeId} />
    </>
  )
}
