const webpackService = require('../services/webpack')

module.exports = [
  {
    method: 'GET',
    path: '/build',
    async handler(request, h) {
      const { stats, fs } = await webpackService.run()
      // stats: compilation, hash, startTime, endTime
      
      return fs.readFileSync('/dist/bundle.js')
    }
  }
]