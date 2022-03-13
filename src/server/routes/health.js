const express = require('express')

const routes = express.Router()

routes.use('/ping', (req, res) => res.send("I'm not dead yet!"))

module.exports = routes
