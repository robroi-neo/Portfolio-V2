// Projects shown in the fan (in order, left to right) and in the popup.
//
//   id          unique, used as the React key
//   title       card + popup heading
//   image       screenshot path. Put files in public/projects/ and use '/projects/name.png'.
//               Leave '' to show a placeholder sketch instead.
//   description short paragraph shown in the popup
//   github      repo URL, or '' to hide the GitHub link
//   tags        optional tech chips on the card (first one is highlighted)
//   theme       'dark' or 'light' card style
export const PROJECTS = [
  {
    id: 'hardware-mangement',
    title: 'Hardware Management System',
    image: '',
    description:
      'A Hardware Management System for an SME. It has a functional POS, Invoice, Inventory, Permissions and Auth, and Dashboard.',
    github: 'https://github.com/robroi-neo/Hardware-Management-System',
    tags: ['Laravel'],
    theme: 'light',
  },
  {
    id: 'pixel-pal',
    title: 'Pixel Pal',
    image: '',
    description:
      'A multiplayer guessing game using Pixel art. Can be played up to 8 people.',
    github: 'https://github.com/robroi-neo/pixel-pal',
    tags: ['Flutter', 'Firebase'],
    theme: 'dark',
  },
  {
    id: 'terraria-wiki-chatbot',
    title: 'Terraria Wiki Bot ',
    image: '',
    description: 'A terraria wiki bot using LLM models with RAG capabilities. Deployed in Streamlit.',
    github: 'https://github.com/robroi-neo/terraria-wiki-chatbot',
    tags: ['Ollama', 'Python', 'Streamlit'],
    theme: 'light',
  },
  {
    id: 'snake-dqn',
    title: 'Reinforcement Learning (DQN & Dual DQN) using Snake.',
    image: '',
    description: 'Very cool snake game playing on its own.',
    github: 'https://github.com/robroi-neo/snake-deep-q-network',
    tags: ['Python', 'Reinforcement Learning'],
    theme: 'dark',
  },
]
