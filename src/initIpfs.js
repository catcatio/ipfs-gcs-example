export default (gcs, {
  ipfsConfig,
  ipfsRepoLockName,
  ipfsRepoPath
}) => new Promise((resolve, reject) => {
  const Gateway = require('ipfs/src/http')
  const Repo = require('ipfs-repo')
  const GCSStore = require('datastore-gcs')
  const RepoLock = require('./repo-lock')

  const bucketpath = ipfsRepoPath

  // Create our custom lock
  const store = new GCSStore(bucketpath, { gcs })
  const repoLock = new RepoLock(store, ipfsRepoLockName)

  // Create the IPFS Repo, full backed by GCS
  const repo = new Repo(bucketpath, {
    storageBackends: {
      root: GCSStore,
      blocks: GCSStore,
      keys: GCSStore,
      datastore: GCSStore
    },
    storageBackendOptions: {
      root: { gcs },
      blocks: { gcs },
      keys: { gcs },
      datastore: { gcs }
    },
    lock: repoLock
  })

  const gateway = new Gateway(
    repo,
    ipfsConfig
  )

  console.log('Starting the gateway...')

  gateway.start(true, (x) => {

    if (x instanceof Error) {
      return reject(x)
    }

    console.log('Gateway now running')

    const node = gateway.node

    resolve(node)

    node.version()
      .then((version) => {
        console.log('Version:', version.version)
      })
      // Once we have the version, let's add a file to IPFS
      .then(() => {
        return node.files.add({
          path: 'data.txt',
          content: Buffer.from(`js_ipfs ${Date.now()}`)
        })
      })
      // Log out the added files metadata and cat the file from IPFS
      .then((filesAdded) => {
        console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
        return node.files.cat(filesAdded[0].hash)
      })
      // Print out the files contents to console
      .then((data) => {
        console.log(`\nFetched file content '${data.toString()}', containing ${data.byteLength} bytes`)
      })
      // Log out the error, if there is one
      .catch((err) => {
        console.log('File Processing Error:', err)
      })
  })

})