const webpackService = require('../services/webpack')

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
  }
]