import { PROFILE } from './profile.js'

// Contact section settings.
export const CONTACT = {
  // Where the form sends messages. Paste a form-backend URL here, e.g. a free
  // Formspree form (https://formspree.io → new form → "https://formspree.io/f/abcdwxyz").
  // Left '' → "Send message" opens the visitor's email app with the message filled in.
  formEndpoint: '',

  // Link rows under the form, top to bottom.
  //   id     unique, used as the React key
  //   label  left side, e.g. 'GitHub'
  //   value  right side, e.g. '@robroi-neo'
  //   url    where it goes. '' hides the row.
  //   icon   one of: 'mail', 'x', 'github', 'linkedin'
  links: [
    {
      id: 'email',
      label: 'Email',
      value: PROFILE.email,
      url: `mailto:${PROFILE.email}`,
      icon: 'mail',
    },
    {
      id: 'x',
      label: 'X.com',
      value: '@[handle]',
      url: '', // e.g. 'https://x.com/yourhandle'
      icon: 'x',
    },
    {
      id: 'github',
      label: 'GitHub',
      value: '@robroi-neo',
      url: 'https://github.com/robroi-neo',
      icon: 'github',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: '/in/[handle]',
      url: '', // e.g. 'https://www.linkedin.com/in/yourhandle'
      icon: 'linkedin',
    },
  ],
}
