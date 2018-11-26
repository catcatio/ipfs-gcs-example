'use strict'

const PATH = require('path')

/**
 * Uses an object in a bucket as a lock to signal that an IPFS repo is in use.
 * When the object exists, the repo is in use. You would normally use this to make
 * sure multiple IPFS nodes don’t use the same bucket as a datastore at the same time.
 */
class RepoLock {
  constructor (datastore, lockName = '') {
    this.datastore = datastore
    this.lockName = lockName
  }

  /**
   * Returns the location of the lock file given the path it should be located at
   *
   * @private
   * @param {string} dir
   * @returns {string}
   */
  getLockfilePath (dir) {
    return PATH.join(dir, 'repo.lock')
  }

  /**
   * Creates the lock. This can be overriden to customize where the lock should be created
   *
   * @param {string} dir
   * @param {function(Error, LockCloser)} callback
   * @returns {void}
   */
  lock (dir, callback) {
    const lockPath = this.getLockfilePath(dir)

    this.locked(dir, (err, alreadyLocked) => {
      if (err || alreadyLocked) {
        return callback(new Error('The repo is already locked'))
      }

      // There's no lock yet, create one
      this.datastore.put(lockPath, Buffer.from(this.lockName), (err, data) => {
        if (err) {
          return callback(err, null)
        }

        callback(null, this.getCloser(lockPath))
      })
    })
  }

  /**
   * Returns a LockCloser, which has a `close` method for removing the lock located at `lockPath`
   *
   * @param {string} lockPath
   * @returns {LockCloser}
   */
  getCloser (lockPath) {
    const closer = {
      /**
       * Removes the lock. This can be overriden to customize how the lock is removed. This
       * is important for removing any created locks.
       *
       * @param {function(Error)} callback
       * @returns {void}
       */
      close: (callback) => {
        this.datastore.delete(lockPath, (err) => {
          if (err && err.statusCode !== 404) {
            return callback(err)
          }

          callback(null)
        })
      }
    }

    const cleanup = () => {
      console.log('\nAttempting to cleanup gracefully...')

      closer.close(() => {
        console.log('Cleanup complete, exiting.')
        process.exit()
      })
    }

    // listen for graceful termination
    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
    process.on('SIGHUP', cleanup)
    process.on('SIGUSR2', cleanup)
    process.on('uncaughtException', cleanup)

    return closer
  }

  /**
   * Calls back on whether or not a lock exists. Override this method to customize how the check is made.
   *
   * @param {string} dir
   * @param {function(Error, boolean)} callback
   * @returns {void}
   */
  locked (dir, callback) {
    this.datastore.get(this.getLockfilePath(dir), (err, data) => {
      if (err && err.code === 'ERR_NOT_FOUND') {
        return callback(null, false)
      } else if (err) {
        return callback(err)
      } else if (this.lockName === data.toString()) {
        return callback(null, false)
      }

      callback(null, true)
    })
  }
}

module.exports = RepoLock
