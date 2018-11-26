// tslint:disable-next-line:no-var-requires
const btoa = require('btoa')
import crypto from 'crypto'
import openpgp from 'openpgp'

const encrypt = async (data, masterkey, ...userKeys) => {
  const publicKeys = []
  userKeys.push(masterkey)
  for (const key of userKeys) {
    publicKeys.push((await openpgp.key.readArmored(key.publicKeyArmored)).keys[0])
  }

  const privateKeys = (await openpgp.key.readArmored(masterkey.privateKeyArmored)).keys
  const encryptedData = await openpgp.encrypt({
    message: openpgp.message.fromText(data),
    publicKeys,
    privateKeys,
  })
  return encryptedData.data
}

const decrypt = async (encryptedText, user) => {
  const privateKeyArmored = `${user.privateKeyArmored}`
  const prikeys = (await openpgp.key.readArmored(privateKeyArmored)
    .catch((error) => {
      console.error(error.message)
      console.log(user.privateKeyArmored)
      return {keys: []}
    })).keys
  const decryptedFileKey = await openpgp.decrypt({
    message: await openpgp.message.readArmored(encryptedText),
    privateKeys: prikeys,
  })
  return decryptedFileKey.data
}

const updateDecryptKey = async (encryptedData, masterkey, ...userKeys) => {
  const decryptedData = await decrypt(encryptedData, masterkey)
  return encrypt(decryptedData, masterkey, ...userKeys)
}

const genUserKey = async (name, numBits = 1024) =>
  await openpgp.generateKey({
    userIds: [{ name }],
    numBits,
  })

const toKeyPair = async (privateKeyArmored) => {
  const loadedKey = await openpgp.key.readArmored(privateKeyArmored)
  const key = loadedKey.keys[0]

  // return the same interface as generateKey
  return {
    key,
    privateKeyArmored: key.armor(),
    publicKeyArmored: key.toPublic().armor(),
  }
}

const genFileKey = (length = 32) => btoa(crypto.randomBytes(length))

export const pgpCrypto = {
  encrypt,
  decrypt,
  genUserKey,
  toKeyPair,
  genFileKey,
  updateDecryptKey,
}
