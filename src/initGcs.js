const { Storage } = require('@google-cloud/storage')

export default ({ bucketName }) => {
  const storage = new Storage()
  return storage.bucket(bucketName)

}