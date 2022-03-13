const health = require('./health')
const express = require('express')
const zillowBot = require('./zillow-bot')
const zillowHomieBot = require('./zillow-homie-bot')
const kslBot = require('./ksl-bot')
const facebookBot = require('./facebook-bot')
const facebookDb = require('./facebook-database')

const router = express.Router()

router.use('/health', health)
router.use('/resources', zillowBot)
router.use('/resources', zillowHomieBot)
router.use('/resources', facebookBot)
router.use('/resources', kslBot)
router.use('/resources', facebookDb)
module.exports = router
