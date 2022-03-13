const { compact } = require('lodash')
const axios = require('axios')

async function handlePage(page, browser) {
  const innerText = await page.evaluate(() => {
    return JSON.parse(document.querySelector('body').innerText)
  })
  let results = innerText.cat1.searchResults.mapResults.map(el => el.hdpData)
  results = compact(results).map(el => el.homeInfo)
  let finalResults = []
  results.forEach(el => {
    let matches = {}
    let diff = el.zestimate - el.price
    if (diff > 50000) {
      matches['Days on Zillow'] = el.daysOnZillow * -1
      matches['Potential Profit'] = diff
      matches['Home Type'] = el.homeType
      matches['City'] = el.city
      matches['Webpage'] = `https://www.zillow.com/homedetails/${el.zpid}_zpid/`
      finalResults.push(matches)
    }
  })
  await browser.close()

  return finalResults
}

async function handleAPI() {
  try {
    const response = await axios.get(`/api/resources/zillow-bot`)
    return response.data
  } catch (err) {
    console.log('There was a problem or request was cancelled.')
  }
}

module.exports = { handlePage: handlePage, handleAPI: handleAPI }
