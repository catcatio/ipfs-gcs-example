import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'
// import * as path from 'path'

export default ({port}) => {
  const app = express()

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(cors())
  app.use(fileUpload())

  // app.use(express.static(path.join(process.cwd(), 'public')))

  app.listen(port, (err) => {
    if (err) {
      throw err
    }

    console.log(`Listening to ${port}`)
  })

  return app
}
