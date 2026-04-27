export default {
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'Service ID (Slug used in URL, e.g., events, exhibitions)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'title',
      title: 'Service Title',
      type: 'string',
    },
    {
      name: 'tagline',
      title: 'Tagline / Subheader',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'homeMeta',
      title: 'Home Page Meta Tag (e.g., Portfolio, Interior, Events)',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Service Main Image (Used in Home Page and Service Page Header)',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'order',
      title: 'Order (for sorting on Home Page)',
      type: 'number',
    }
  ]
}
