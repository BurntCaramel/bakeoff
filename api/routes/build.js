const webpackService = require('../services/webpack')
const axios = require('axios')
const _ = require('lodash')

module.exports = [
  {
    method: 'GET',
    path: '/build',
    async handler(request, h) {
      const { stats, bundleJS } = await webpackService.run()
      // stats: compilation, hash, startTime, endTime
      return h.response(bundleJS)
        .type('application/javascript')
    }
  },
  {
    method: 'POST',
    path: '/build',
    options: {
      payload: {
        allow: 'application/javascript',
        parse: 'gunzip'
      }
    },
    async handler(request, h) {
      const componentJS = request.payload
      const { stats, bundleJS } = await webpackService.run({
        componentJS
      })
      // stats: compilation, hash, startTime, endTime
      return h.response(bundleJS)
        .type('application/javascript')
    }
  },
  {
    method: 'GET',
    path: '/build/github',
    async handler(request, h) {
      const { data: componentJS } = await axios.get('https://cdn.rawgit.com/RoyalIcing/Collected/b0f0ad6d/app-react/src/components/Label.js')

      const props = _.mapValues(request.query, (value) => {
        if (value.length === 0) {
          return true
        }
        else {
          return value
        }
      })

      console.log('props', props)

      // const componentJS = request.payload
      const { stats, bundleJS } = await webpackService.run({
        componentJS,
        props
      })
      // stats: compilation, hash, startTime, endTime
      return h.response(bundleJS)
        .type('application/javascript')
    }
  },
  {
    method: 'GET',
    path: '/build/github/{orgName}/{repoName}/{filePath*}',
    async handler(request, h) {
      const { orgName, repoName, filePath } = request.params

      const { data: componentJS } = await axios.get(`https://cdn.rawgit.com/${orgName}/${repoName}/master/${filePath}`)

      const props = _.mapValues(request.query, (value) => {
        if (value.length === 0) {
          return true
        }
        else {
          return value
        }
      })

      console.log('props', props)

      // const componentJS = request.payload
      const { stats, bundleJS } = await webpackService.run({
        componentJS,
        props
      })
      // stats: compilation, hash, startTime, endTime
      return h.response(bundleJS)
        .type('application/javascript')
    }
  }
]