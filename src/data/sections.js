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
