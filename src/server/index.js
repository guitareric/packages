const pkg = require('./package.json')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const routes = require('./routes')

const { PORT = 8082 } = process.env

const app = express()

app.set('json spaces', 2)
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(morgan('short'), helmet(), bodyParser.json())

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`${pkg.name} is listening at 127.0.0.1:${PORT}`)
})

process.on('exit', () => {
  console.log(`${pkg.name} is shutting down`)
})
