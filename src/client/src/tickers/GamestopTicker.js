import { React, useState, useEffect } from 'react'
import axios from 'axios'

function GamestopTicker() {
  const [pageResults, setPageResults] = useState(null)

  useEffect(() => {
    async function fetch() {
      const apiKey = 'F86OQUSB6VYUXOA6'
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GME&apikey=${apiKey}`
      const config = {
        method: 'GET',
        url: url,
        headers: { 'User-Agent': 'request' },
      }
      let res = await axios(config)
      res = Math.round(res.data['Global Quote']['05. price']).toLocaleString()
      setPageResults(res)
    }
    fetch()
  }, [])
  if (pageResults) {
    return <div>GME: ${pageResults}</div>
  }
  return null
}
export default GamestopTicker
