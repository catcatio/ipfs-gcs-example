import { Duplex } from 'stream'

const bufferToStream = (buffer) => {
  const stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const buffers: any[] = []
    stream.on('error', reject)
    stream.on('data', (data) => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

export {
  bufferToStream,
  streamToBuffer
}
