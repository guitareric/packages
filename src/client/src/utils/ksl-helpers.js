const axios = require('axios')

async function handleAPI(searchTerms) {
  try {
    searchTerms = searchTerms.split(' ').join('%20')
    const response = await axios.post('/api/resources/ksl-bot', { searchTerms: searchTerms })
    return response.data
  } catch (err) {
    console.log('There was a problem or request was cancelled.')
  }
}

async function handlePage(page, browser) {
  let resultNumber = await page.evaluate(() => {
    return Number(document.querySelector('#srpNavHeaderOptions > span').innerText)
  })
  // display number of results
  console.log(`${resultNumber} results`)
  // used since pagination for results > 96 isn't accounted for
  if (resultNumber > 96) {
    resultNumber = 96
  }
  let results = []
  let total = 0
  // parse results
  for (let i = 0; i < resultNumber; i++) {
    let result = {}

    let [webLink, title] = await page.$eval(`#search-results > div > section > div > div > section:nth-child(${i + 1}) > div.listing-item-info > h2 > div > a`, el => {
      return [el.href, el.innerText]
    })
    result['Title'] = title
    let description = await page.$eval(`#search-results > div > section > div > div > section:nth-child(${i + 1}) > div.listing-item-info > div.item-description.info-line`, el => {
      return el.innerText
    })
    result['Description'] = description.split('\n').join(' ')
    result['Link'] = webLink

    let city = await page.$eval(`#search-results > div > section > div > div > section:nth-child(${i + 1}) > div.listing-item-info > div.item-detail.info-line > a`, el => {
      return el.innerText
    })
    result['City'] = city

    let age = await page.$eval(`#search-results > div > section > div > div > section:nth-child(${i + 1}) > div.listing-item-info > div.item-detail.info-line > span`, el => {
      return el.innerText
    })
    result['Time on KSL'] = age

    let price = await page.$eval(`#search-results > div > section > div > div > section:nth-child(${i + 1}) > div.listing-item-info > div:nth-child(${2})`, el => {
      return el.innerText
    })
    result['Price'] = Math.round(Number(price.substring(1)))

    // throw out free and ISO ads
    if (!isNaN(result.Price) && !result.Title.includes('ISO') && result.Price > 1) {
      total += result.Price
      results.push(result)
    }
  }

  // calculate average price
  total = 0
  results.forEach(el => {
    total += el.Price
  })
  let avg = Number(Math.round(total / results.length))
  // throw outliers away
  results = results.filter(el => {
    return el.Price > avg * 0.5 && el.Price < avg * 1.5
  })
  // recalculate average
  total = 0
  results.forEach(el => (total += el.Price))
  avg = Number(Math.round(total / results.length))
  // put average and deviations onto result object
  results.forEach(el => {
    el['Average Price'] = avg
    el['Price Deviation ($)'] = (el['Price'] - avg) * -1
    el['Price Deviation (%)'] = Math.round((100 * (el.Price - avg)) / avg)
  })

  // only return results that are at least 10% below the average cost
  results = results.filter(el => el['Price Deviation (%)'] < -10)

  if (results.length) {
    console.log(results)
    await browser.close()
    results = results.sort((firstItem, secondItem) => firstItem.Price - secondItem.Price)
    return results
  } else {
    console.log('No results')
    console.log('Average price was ' + avg)
    await browser.close()
  }
}
module.exports = { handlePage: handlePage, handleAPI: handleAPI }
