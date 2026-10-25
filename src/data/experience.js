// Work / education entries, shown top to bottom in this order (newest first).
// The Experience section renders one row per entry, so add or remove freely.
//
//   id           unique, used as the React key
//   start        e.g. '2024'
//   end          e.g. '2026', or '' for "NOW" (still ongoing)
//   role         e.g. 'Software Engineer'
//   company      company / school name
//   logo         image path. Put files in public/companies/ and use '/companies/name.png'.
//                Leave '' (or if it fails to load) to show the company's first letter instead.
//   url          optional company link, makes the name clickable. '' for none.
//   description  one or two sentences about what you did
//   highlights   optional list of specific contributions, shown as bullet points
export const EXPERIENCE = [
  {
    id: 'company-1',
    start: '2026',
    end: '',
    role: 'Software Engineer Intern',
    company: 'Kumosoft llc.',
    logo: '',
    url: 'https://www.kumo-soft.com/',
    description:
      'Laravel + JavaScript development. Built the dental odontogram (interactive tooth chart) module.',
    highlights: [
      'Designed the database schema for the dental module and integrated it into the existing database.',
      'Designed the mobile-first layout for the odontogram.',
      'Researched and documented the domain and business logic, like tooth anatomy and surfaces, caries, and other conditions, to define the module’s features.',
    ],
  },
  {
    id: 'company-2',
    start: '2023',
    end: '2026',
    role: 'Computer Science Student',
    company: 'University of Mindanao',
    logo: '',
    url: 'https://umindanao.edu.ph/',
    description: 'Specialized in Machine Learning and AI. Built everything from business systems like POS and inventory to AI-driven projects.',
    highlights: [
      'Marketing Head of UM Enigma, a university tech org, leading the creatives and marketing department.',
      'Modified a Random Forest model for my thesis, and applied CNN, NLP, and classical ML models across projects.',
      'Built a POS, inventory, and transactions system demo for a local hardware store.',
    ],
  },
]
