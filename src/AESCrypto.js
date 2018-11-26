import crypto from 'crypto'
import { md5 } from './cryptoHelper'

export default (passphrase, cipherAlgorithm = 'aes-256-cbc') => {
  const IV_LENGTH = 16

  const passphraseHash = md5(passphrase)
  const iv = new Buffer(passphraseHash).slice(0, IV_LENGTH)
  const encrypt = (buffer) => {
    const cipher = crypto.createCipheriv(cipherAlgorithm, passphraseHash, iv)
    const crypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return crypted
  }

  const decrypt = (buffer) => {
    const decipher = crypto.createDecipheriv(cipherAlgorithm, passphraseHash, iv)
    const dec = Buffer.concat([decipher.update(buffer), decipher.final()])
    return dec
  }

  const encryptStream = () => {
    return crypto.createCipheriv(cipherAlgorithm, passphraseHash, iv)
  }

  const decryptStream = () => {
    return crypto.createDecipheriv(cipherAlgorithm, passphraseHash, iv)
  }

  return {
    encrypt,
    encryptStream,
    decrypt,
    decryptStream,
  }
}

// export interface IAESCrypto {
//   encrypt: any;
//   encryptStream: any;
//   decrypt: any;
//   decryptStream: any;
// }
