
const Server = (config) => {
  const start = async () => {

    const gcs = await require('./initGcs').default(config)
    const ipfs = await require('./initIpfs').default(gcs, config)

    const app = require('./initExpress').default(config)
    const routers = require('./routers').default(ipfs, config)

    app.use(routers)
  }

  const stop = async () => {

  }

  return {
    start,
    stop
  }
}

export default Server