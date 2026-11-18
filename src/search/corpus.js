import { EXPERIENCE } from '../data/experience.js'
import NOW_PLAYING from '../data/now-playing.json'
import { CONTACT } from '../data/contact.js'
import { PROFILE } from '../data/profile.js'
import { PROJECTS } from '../data/projects.js'
import { SECTION_COPY } from '../data/sections.js'
import { STACK } from '../data/stack.js'

/**
 * Everything on the site that search can find, as small "passages".
 *
 * Built from the same data files the page renders, so search can never drift
 * from what's actually on the page. The backend indexer (design-search §15.8)
 * will import this same function to know what to embed.
 *
 * Each passage:
 *   id       unique, e.g. 'project:pixel-pal' (max 64 bytes for Vectorize)
 *   type     'project' | 'experience' | 'stack' | 'personal' | 'contact'
 *            (picks the result icon — the same icon the dock uses for that section)
 *   title    bold first line of the result row
 *   crumb    muted text after the title (where on the page it lives)
 *   text     the snippet shown under the title
 *   keywords extra words that should match but aren't in the text (tags, tool names)
 *   target   what opening the result does:
 *              { kind: 'project', id }      → opens that project's popup
 *              { kind: 'anchor', id }       → scrolls to the element with that id and flashes it
 *              { kind: 'link', url }        → opens an outside link in a new tab
 */
export function buildSearchCorpus() {
  const passages = []

  for (const project of PROJECTS) {
    passages.push({
      id: `project:${project.id}`,
      type: 'project',
      title: project.title.trim(),
      crumb: 'Project',
      text: project.description,
      keywords: project.tags ?? [],
      target: { kind: 'project', id: project.id },
    })
  }

  for (const entry of EXPERIENCE) {
    const anchor = { kind: 'anchor', id: `experience-${entry.id}` }
    passages.push({
      id: `experience:${entry.id}`,
      type: 'experience',
      title: `${entry.role}, ${entry.company}`,
      crumb: 'Experience',
      text: entry.description,
      keywords: [entry.company, entry.role],
      target: anchor,
    })
    // Highlights are tucked behind "Details" on the page, but they hold the
    // most specific facts, so each one is its own searchable passage.
    entry.highlights?.forEach((highlight, i) => {
      passages.push({
        id: `experience:${entry.id}#${i}`,
        type: 'experience',
        title: `${entry.role}, ${entry.company}`,
        crumb: 'Details',
        text: highlight,
        keywords: [entry.company],
        target: anchor,
      })
    })
  }

  for (const group of STACK) {
    const names = group.items.map((item) => item.name)
    passages.push({
      id: `stack:${group.id}`,
      type: 'stack',
      title: group.label,
      crumb: 'Stack',
      text: `${names.join(', ')}.`,
      keywords: names,
      target: { kind: 'anchor', id: 'stack' },
    })
  }

  passages.push(
    {
      id: 'personal:intro',
      type: 'personal',
      title: 'In my spare time',
      crumb: 'Personal',
      text: SECTION_COPY.personal.intro,
      keywords: ['hobbies', 'fun'],
      target: { kind: 'anchor', id: 'personal' },
    },
    {
      id: 'personal:music',
      type: 'personal',
      title: NOW_PLAYING.label,
      crumb: 'Music',
      text: `${NOW_PLAYING.title} by ${NOW_PLAYING.artist}, on a mixtape you can play.`,
      keywords: ['song', 'music', 'spotify', 'cassette', NOW_PLAYING.artist],
      target: { kind: 'anchor', id: 'personal' },
    },
    {
      id: 'profile:about',
      type: 'profile',
      title: PROFILE.name,
      crumb: 'About',
      text: `${PROFILE.role}. Software developer in Davao, Philippines who puts machine learning to work on the web.`,
      keywords: ['about', 'remote', 'hire', 'available'],
      target: { kind: 'anchor', id: 'home' },
    },
  )

  for (const link of CONTACT.links) {
    if (!link.url) continue
    passages.push({
      id: `contact:${link.id}`,
      type: 'contact',
      title: link.label,
      crumb: 'Contact',
      text: link.value,
      keywords: ['contact', 'reach', 'message', link.icon],
      target: { kind: 'anchor', id: 'contact' },
    })
  }

  return passages
}
