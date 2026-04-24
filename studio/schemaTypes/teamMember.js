export default {
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'position',
      title: 'Job Title / Position',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Short Bio or Quote',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
