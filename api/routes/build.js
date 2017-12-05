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
  }
]