import 'dotenv/config'
import '@rabbotio/noconsole'

import config from './config'
import Server from './server'

const server = Server(config)

server.start()
  .then(() =>console.log(`OK ${Date.now()}`))
  .catch(err => {
    console.error('main', err.message)
    console.error('err')
  })
