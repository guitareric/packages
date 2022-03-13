const express = require('express')
const createPage = require('../../client/src/utils/puppeteer')
const { handlePage } = require('../../client/src/utils/ksl-helpers')

const routes = express.Router()

routes.use('/ksl-bot', async (req, res) => {
  const url = `https://classifieds.ksl.com/search/keyword/${req.body.searchTerms}/perPage/96/sort/3`
  const [page, browser, os] = await createPage(url, false)
  const kslResults = await handlePage(page, browser)
  res.json(kslResults)
})

module.exports = routes
