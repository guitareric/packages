const { compact } = require('lodash')
const axios = require('axios')

async function handlePage(page, browser) {
  const innerText = await page.evaluate(() => {
    return JSON.parse(document.querySelector('body').innerText)
  })
  let results = innerText.cat1.searchResults.mapResults.map(el => el.hdpData)
  results = compact(results).map(el => el.homeInfo)
  let cities = []
  // make an array of cities from results
  results.forEach(el => {
    if (!cities.includes(el.city)) {
      let city = el.city
      cities.push(city)
    }
  })
  let cityInfo = []
  // group the results by city
  cities.forEach(el => {
    let filteredResults = []
    let city = el
    results.filter(el => {
      if (el.city === city) {
        filteredResults.push(el)
      }
    })
    let prices = []
    // calculate the average price per sqft per city
    filteredResults.forEach(el => {
      let pricePerSqft = el.price / el.livingArea
      prices.push(pricePerSqft)
    })
    let total = 0
    prices.forEach(el => {
      total += el
    })
    let average = total / prices.length
    cityInfo.push({
      city: city,
      avgPricePerSqft: Number(average.toFixed(2)),
      sampleSize: prices.length,
    })
  })

  // the caculations of averages from Zillow are completed, will now search Homie for underpriced "Homie" listed homes

  let config = {
    headers: {
      Host: 'api.homie.com',
      Origin: 'https://platform.homie.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    },
    method: 'get',
    url: 'https://api.homie.com/api/v2/listings/search/GeographicArea?query=-106.813431461556,42.418228103105264,-116.239700992806,42.418228103105264,-116.239700992806,38.206048457203224,-106.813431461556,38.206048457203224,-106.813431461556,42.418228103105264&sort=-listingDate&limit=1000&filter=yearBuilt+%3E%3D+1980+and+propertyType+%3D+%22SingleFamily%22+and+(originationType+%3D+%22Homie%22+or+originationType+%3D+%22Ksl%22+or+originationType+%3D+%22Manual%22)',
  }

  let res = await axios(config)
  results = res.data.map(el => el)

  cities = []
  results.forEach(el => {
    if (!cities.includes(el.address.city)) {
      city = el.address.city
      cities.push(city)
    }
  })
  let homieSearchInfo = []
  cities.forEach(el => {
    city = el
    let latestResults = results.filter(el => el.address.city === city)
    latestResults.forEach(el => {
      result = el
      result['pricePerSqft'] = result.priceInPennies / (result.area * 100)
      cityInfo.forEach(el => {
        if (el.city === result.address.city) {
          result['avgPricePerSqft'] = el.avgPricePerSqft
          result['sampleSize'] = el.sampleSize
          result['theoreticalPrice'] = Math.round(result.avgPricePerSqft * result.area)
          result['potentialProfit'] = Math.round(result.theoreticalPrice - result.priceInPennies / 100)
          homieSearchInfo.push(result)
        }
      })
    })
  })
  let finalResults = []
  // gather houses with a price discrepancy > 50,000, and email them
  homieSearchInfo.forEach(el => {
    if (Number(el.potentialProfit) > 50000) {
      // filter out old houses and houses that didn't have a big enough sample size
      if (el.isNewlyPublished && el.sampleSize > 2) {
        let matches = {}
        console.log('match found')
        matches['House #'] = finalResults.length + 1
        matches['City'] = el.address.city
        matches['Price Per Sqft'] = el.pricePerSqft.toFixed(2)
        matches['Sample Size'] = el.sampleSize
        matches['Average Price Per Sqft in the Area'] = el.avgPricePerSqft
        matches['Website Link'] = `https://platform.homie.com/home/${el.id}`
        matches['Price'] = (el.priceInPennies / 100).toLocaleString()
        matches['Theoretical Price'] = el.theoreticalPrice.toLocaleString()
        matches['Potential Profit'] = el.potentialProfit.toLocaleString()
        matches['Published Date'] = el.publishedDate.substring(0, 10)
        let date1 = new Date(el.publishedDate).getTime() / 1000
        let date2 = new Date().getTime() / 1000
        let difference = (date2 - date1) / 60 / 60 / 24
        matches['Days on Market'] = difference.toFixed(1)
        finalResults.push(matches)
      }
    }
  })

  if (finalResults.length) {
    console.log(finalResults)
    await browser.close()
    return finalResults
  } else {
    console.log('No Results')
    await browser.close()
  }
}

module.exports = handlePage
