import {
  BriefcaseIcon,
  CodeIcon,
  GamepadIcon,
  LayersIcon,
  MailIcon,
  UserIcon,
} from '../components/icons.jsx'

// The six sections, in page order (design.md §2 — dock order).
// The dock is built from this list, so adding/reordering happens here only.
export const SECTIONS = [
  { id: 'home', name: 'Home', Icon: UserIcon },
  { id: 'projects', name: 'Projects', Icon: BriefcaseIcon },
  { id: 'experience', name: 'Experience', Icon: LayersIcon },
  { id: 'stack', name: 'Stack', Icon: CodeIcon },
  { id: 'personal', name: 'Personal', Icon: GamepadIcon },
  { id: 'contact', name: 'Contact', Icon: MailIcon },
]

// Defined once, outside any component, so it's the same array every render.
// (useActiveSection depends on it — a new array each render would re-run the effect.)
export const SECTION_IDS = SECTIONS.map((section) => section.id)

// Each section's small label and intro line. Kept here (not in App.jsx) so
// search can find the same words the page shows (search/corpus.js).
export const SECTION_COPY = {
  projects: { label: 'projects', intro: 'Here are some of my works so far.' },
  experience: {
    label: 'Experience',
    intro:
      "Throughout my career, I've worked on various projects, from building scalable systems to designing user-friendly interfaces. Here's a brief overview.",
  },
  stack: { label: 'Stack' },
  personal: {
    label: 'Personal',
    intro: 'In my spare time, I love playing games, listening to music, playing the guitar, and building fun things.',
  },
  contact: { label: 'Contact', intro: 'You can contact me using the form or via the links below.' },
}
