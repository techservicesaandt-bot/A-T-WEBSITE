export default {
  name: 'rental',
  title: 'Furniture Rental Item',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Chairs', value: 'chairs' },
          { title: 'Sofas', value: 'sofas' },
          { title: 'Barstools', value: 'barstools' },
          { title: 'Tables', value: 'tables' },
          { title: 'Office', value: 'office' },
          { title: 'Devices', value: 'devices' },
          { title: 'Others', value: 'another items' }
        ]
      }
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array', 
      of: [{type: 'block'}]
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
