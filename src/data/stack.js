// Tools shown in the Stack section, left to right. One icon per entry.
//
//   id    unique, used as the React key
//   name  shown in the hover label (and read by screen readers)
//   logo  image link. Either a web URL (the ones below come from simpleicons.org —
//         https://cdn.simpleicons.org/<name>) or a file in public/stack/, e.g. '/stack/react.svg'.
//         Leave '' (or if it fails to load) to show the tool's first letter instead.
//   logoDark  optional logo used in dark mode instead (e.g. for black logos
//             that would vanish on a dark background). Omit to use `logo` in both.
//   url   where the icon links to (new tab), or '' for no link
export const STACK = [
  { id: 'react', name: 'React', logo: 'https://cdn.simpleicons.org/react', url: 'https://react.dev' },
  { id: 'javascript', name: 'JavaScript', logo: 'https://cdn.simpleicons.org/javascript', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { id: 'laravel', name: 'Laravel', logo: 'https://cdn.simpleicons.org/laravel', url: 'https://laravel.com' },
  { id: 'flutter', name: 'Flutter', logo: 'https://cdn.simpleicons.org/flutter', url: 'https://flutter.dev' },
  { id: 'firebase', name: 'Firebase', logo: 'https://cdn.simpleicons.org/firebase', url: 'https://firebase.google.com' },
  { id: 'python', name: 'Python', logo: 'https://cdn.simpleicons.org/python', url: 'https://python.org' },
  {
    id: 'github',
    name: 'GitHub',
    logo: 'https://cdn.simpleicons.org/github',
    logoDark: 'https://cdn.simpleicons.org/github/ededea', // simpleicons: /<name>/<hex color>
    url: 'https://github.com',
  },
  { id: 'claude-code', name: 'Claude Code', logo: 'https://cdn.simpleicons.org/claude', url: 'https://claude.com/claude-code' },
]
