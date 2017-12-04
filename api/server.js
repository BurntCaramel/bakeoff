const Hapi = require('hapi')

const server = new Hapi.Server({
  port: process.env.PORT || 8787
})

server.route(require('./routes'))

server.start()
  .catch((error) => {
    console.log('Error starting server', error)
  })