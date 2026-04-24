export default {
  name: 'siteSettings',
  title: 'Global Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Address / Location',
      type: 'string',
    },
    {
      name: 'instagram',
      title: 'Instagram Link',
      type: 'url',
    },
    {
      name: 'facebook',
      title: 'Facebook Link',
      type: 'url',
    },
    {
      name: 'linkedin',
      title: 'LinkedIn Link',
      type: 'url',
    },
    {
      name: 'formspreeId',
      title: 'Formspree ID (for contact form)',
      type: 'string',
    },
    {
      name: 'footerText',
      title: 'Footer Text',
      type: 'text',
    },
    {
      name: 'logo',
      title: 'Main Header Logo',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'footerLogo',
      title: 'Footer Logo (Inverted/Light)',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'favicon',
      title: 'Favicon (Browser Tab Icon)',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
