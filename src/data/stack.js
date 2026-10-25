// Tools shown in the Stack section, as labelled rows (one row per group).
//
// Each group:  { id, label, items: [...] }
// Each item:
//   id        unique within the group, used as the React key
//   name      shown in the hover label (and read by screen readers)
//   logo      image link: a web URL (most below come from simpleicons.org —
//             https://cdn.simpleicons.org/<name>/<optional hex color>) or a file in
//             public/stack/, e.g. '/stack/sql.svg'. '' (or a failed load) shows the first letter.
//   logoDark  optional logo for dark mode (for dark logos that would vanish on a dark page)
//   url       where the icon links to (new tab), or '' for no link
const si = (name, color = '') => `https://cdn.simpleicons.org/${name}${color ? `/${color}` : ''}`

export const STACK = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: [
      { id: 'react', name: 'React', logo: si('react'), url: 'https://react.dev' },
      { id: 'javascript', name: 'JavaScript', logo: si('javascript'), url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
      { id: 'html', name: 'HTML', logo: si('html5'), url: 'https://developer.mozilla.org/docs/Web/HTML' },
      { id: 'css', name: 'CSS', logo: si('css'), url: 'https://developer.mozilla.org/docs/Web/CSS' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    items: [
      { id: 'laravel', name: 'Laravel', logo: si('laravel'), url: 'https://laravel.com' },
      { id: 'php', name: 'PHP', logo: si('php'), url: 'https://www.php.net' },
      { id: 'node', name: 'Node.js', logo: si('nodedotjs'), url: 'https://nodejs.org' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      // No single "SQL" logo exists, so this is a small database icon in public/stack/.
      { id: 'sql', name: 'SQL', logo: '/stack/sql.svg', url: '' },
      { id: 'mariadb', name: 'MariaDB', logo: si('mariadb'), logoDark: si('mariadb', 'c49a6c'), url: 'https://mariadb.org' },
      { id: 'sqlite', name: 'SQLite', logo: si('sqlite'), logoDark: si('sqlite', '7fb2d8'), url: 'https://sqlite.org' },
    ],
  },
  {
    id: 'ml',
    label: 'ML / AI',
    items: [
      { id: 'python', name: 'Python', logo: si('python'), url: 'https://www.python.org' },
      { id: 'tensorflow', name: 'TensorFlow', logo: si('tensorflow'), url: 'https://www.tensorflow.org' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'git', name: 'Git', logo: si('git'), url: 'https://git-scm.com' },
      { id: 'github', name: 'GitHub', logo: si('github'), logoDark: si('github', 'ededea'), url: 'https://github.com' },
      // Simple Icons dropped Microsoft logos, so VS Code comes from devicon.
      {
        id: 'vscode',
        name: 'VS Code',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/vscode/vscode-original.svg',
        url: 'https://code.visualstudio.com',
      },
    ],
  },
]
