export default {
  name: 'aboutSettings',
  title: 'About Page Settings',
  type: 'document',
  fields: [
    {
      name: 'heroVideo',
      title: 'Hero Background Video (MP4)',
      type: 'file',
      options: { accept: 'video/mp4' }
    },
    {
      name: 'heroPoster',
      title: 'Hero Video Fallback Image (Poster)',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'workshopImage',
      title: 'Workshop / Office Image',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
