import { React, useState, useEffect } from 'react'
import axios from 'axios'

function BitcoinTicker() {
  const [pageResults, setPageResults] = useState(null)

  useEffect(() => {
    async function fetch() {
      const apiKey = 'F86OQUSB6VYUXOA6'
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${apiKey}`
      const config = {
        method: 'GET',
        url: url,
        headers: { 'User-Agent': 'request' },
      }
      let res = await axios(config)
      res = Math.round(res.data['Realtime Currency Exchange Rate']['5. Exchange Rate']).toLocaleString()
      setPageResults(res)
    }
    fetch()
  }, [])
  if (pageResults) {
    return <div>BTC: ${pageResults}</div>
  }
  return null
}
export default BitcoinTicker
