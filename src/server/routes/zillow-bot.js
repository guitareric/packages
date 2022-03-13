const express = require('express')
const createPage = require('../../client/src/utils/puppeteer')
const { handlePage } = require('../../client/src/utils/zillow-helpers')

const routes = express.Router()

routes.use('/zillow-bot', async (req, res) => {
  const url =
    'https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-112.3483435986837%2C%22east%22%3A-111.49278329594932%2C%22south%22%3A39.86898861094586%2C%22north%22%3A41.41011486839599%7D%2C%22mapZoom%22%3A11%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22isAllHomes%22%3A%7B%22value%22%3Atrue%7D%2C%22sortSelection%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%7D%2C%22isListVisible%22%3Atrue%7D&wants={%22cat1%22:[%22mapResults%22]}&requestId=2'
  const [page, browser] = await createPage(url, false)
  const zillowResults = await handlePage(page, browser)
  res.json(zillowResults)
})

module.exports = routes
