import { Router } from 'express'
import AESCrypto from '../AESCrypto'
import { Duplex } from 'stream'

const bufferToStream = (buffer) => {
  const stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}

const doUpload = async (ipfs, path, data, fileKey = '') => {
  console.log('doUpload', path, data, fileKey)
  let content = bufferToStream(data)
  if (fileKey) {
    content = content.pipe(AESCrypto(fileKey).encryptStream())
  }

  return await ipfs.files.add({
    path,
    content
  })
}

const upload = (ipfs) => async (req, res) => {
  const files = req.files
  const result = await doUpload(ipfs, files.upload.name, files.upload.data)
  console.log(result)
  res.json(result)
}

const supload = (ipfs, defaultFileKey) => async (req, res) => {
  const files = req.files
  const fileKey = req.query.fileKey
  const result = await doUpload(ipfs, files.upload.name, files.upload.data, fileKey || defaultFileKey)
  console.log(result)
  res.json(result)
}

const ipfsDownloadStream = (ipfs, ipfspath) => {
  return ipfs.files.catReadableStream(ipfspath)
}

const download = (ipfs) => async (req, res) => {
  const ipfspath = req.path
  ipfsDownloadStream(ipfs, ipfspath)
    .on('error', (err) => {
      console.log(err)
      // can be =>  Error: No such file
      res.status(400).send(err)
    })
    .pipe(res)
}

const sdownload = (ipfs, defaultFileKey) => async (req, res) => {
  const startTime = Date.now()
  const ipfspath = req.path
  const fileKey = req.query.fileKey
  const aesCrypto = AESCrypto(fileKey || defaultFileKey)

  try {
    const readStream = ipfs.files.catReadableStream(ipfspath)
    readStream.on('error', (err) => {
      console.log(err)
      // can be =>  Error: No such file
      res.status(400).send(err)
    })
      .pipe(aesCrypto.decryptStream())
      .on('end', () => {
        console.log('s-download done', Date.now()-startTime)
      })
      .pipe(res)
  } catch (error) {
    console.log(error)
  }
}

export default (ipfs, { fileKey }) => {
  const router = Router()
  router.post('/s-upload', supload(ipfs, fileKey))
  router.post('/upload', upload(ipfs))
  router.use('/s-download', sdownload(ipfs, fileKey))
  router.use('/download', download(ipfs))
  router.use('/', (req, res) => res.send('ok'))
  return router
}