export default {
  name: 'project',
  title: 'Portfolio Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
    },
    {
      name: 'serviceCategory',
      title: 'Service Category',
      type: 'string',
      options: {
        list: [
          { title: 'Events', value: 'events' },
          { title: 'Exhibitions', value: 'exhibitions' },
          { title: 'Fitout', value: 'fitout' },
          { title: 'Signage', value: 'signages' },
          { title: 'Branding', value: 'branding' },
          { title: 'Manufacturing', value: 'manufacturing' },
        ],
      }
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array', 
      of: [{type: 'block'}]
    },
    {
      name: 'thumbnail',
      title: 'Featured Thumbnail',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'serviceCategory',
      media: 'thumbnail'
    }
  }
}
