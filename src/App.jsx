import Contact from './components/Contact.jsx'
import Dock from './components/Dock.jsx'
import Experience from './components/Experience.jsx'
import Hero from './components/Hero.jsx'
import MixtapeCard from './components/MixtapeCard/MixtapeCard.jsx'
import ProjectFan from './components/ProjectFan.jsx'
import ResumeLink from './components/ResumeLink.jsx'
import Section from './components/Section.jsx'
import Slot from './components/Slot.jsx'
import Stack from './components/Stack.jsx'
import TopBar from './components/TopBar.jsx'
import { EXPERIENCE } from './data/experience.js'
import NOW_PLAYING from './data/now-playing.json'
import { PROJECTS } from './data/projects.js'
import { RESUME } from './data/resume.js'
import { SECTIONS, SECTION_IDS } from './data/sections.js'
import { STACK } from './data/stack.js'
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
          <Hero />
        </Section>

        <Section
          id="projects"
          label="projects"
          intro="Here are some of my works so far."
        >
          <ProjectFan projects={PROJECTS} />
        </Section>

        <Section
          id="experience"
          label="Experience"
          intro="Throughout my career, I've worked on various projects, from building scalable systems to designing user-friendly interfaces. Here's a brief overview."
        >
          <Experience entries={EXPERIENCE} />
          <ResumeLink resume={RESUME} />
        </Section>

        <Section id="stack" label="Stack">
          <Stack items={STACK} />
        </Section>

        <Section
          id="personal"
          label="Personal"
          intro="In my spare time, I play games, practice guitar, and build things just for fun."
        >
          <MixtapeCard track={NOW_PLAYING} />
          <Slot className="breakout" minHeight={260}>
            Photo fan
          </Slot>
          <Slot minHeight={140}>Arcade door</Slot>
        </Section>

        <Section
          id="contact"
          label="Contact"
          intro="You can contact me using the form or via the links below."
        >
          <Contact />
        </Section>
      </main>

      <Dock sections={SECTIONS} activeId={activeId} />
    </>
  )
}
