import Contact from './components/Contact.jsx'
import Dock from './components/Dock.jsx'
import Experience from './components/Experience.jsx'
import Hero from './components/Hero.jsx'
import MixtapeCard from './components/MixtapeCard/MixtapeCard.jsx'
import ProjectFan from './components/ProjectFan.jsx'
import ResumeLink from './components/ResumeLink.jsx'
import { SearchProvider } from './components/Search/SearchProvider.jsx'
import SearchWindow from './components/Search/SearchWindow.jsx'
import Section from './components/Section.jsx'
import Stack from './components/Stack.jsx'
import TopBar from './components/TopBar.jsx'
import { EXPERIENCE } from './data/experience.js'
import NOW_PLAYING from './data/now-playing.json'
import { PROJECTS } from './data/projects.js'
import { RESUME } from './data/resume.js'
import { SECTION_COPY, SECTIONS, SECTION_IDS } from './data/sections.js'
import { STACK } from './data/stack.js'
import { useActiveSection } from './hooks/useActiveSection.js'
import { useScrollToHash } from './hooks/useScrollToHash.js'

export default function App() {
  const activeId = useActiveSection(SECTION_IDS)
  useScrollToHash()

  return (
    <SearchProvider>
      <TopBar />
      <main className="page">
        <Section id="home" ariaLabel="Introduction">
          <Hero />
        </Section>

        <Section id="projects" {...SECTION_COPY.projects}>
          <ProjectFan projects={PROJECTS} />
        </Section>

        <Section id="experience" {...SECTION_COPY.experience}>
          <Experience entries={EXPERIENCE} />
          <ResumeLink resume={RESUME} />
        </Section>

        <Section id="stack" {...SECTION_COPY.stack}>
          <Stack groups={STACK} />
        </Section>

        <Section id="personal" {...SECTION_COPY.personal}>
          <MixtapeCard track={NOW_PLAYING} />
        </Section>

        <Section id="contact" {...SECTION_COPY.contact}>
          <Contact />
        </Section>
      </main>

      <Dock sections={SECTIONS} activeId={activeId} />
      <SearchWindow />
    </SearchProvider>
  )
}
