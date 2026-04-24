import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '7amv4h2g',
    dataset: 'production'
  },
  project: {
    basePath: '/studio'
  },
  studioHost: 'at-technical-services'
})
