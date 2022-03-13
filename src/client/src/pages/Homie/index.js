import { React, useState, useEffect } from 'react'
import Spinner from '../../components/Spinner'
import axios from 'axios'

function Homie() {
  const [pageResults, setPageResults] = useState(null)
  // reduce the number of API calls
  useEffect(() => {
    const request = axios.CancelToken.source() // (*)
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/resources/zillow-homie-bot`, {
          cancelToken: request.token, // (*)
        })
        setPageResults(response.data)
      } catch (err) {
        console.log('There was a problem or request was cancelled.')
      }
    }
    fetchPost()
    return () => request.cancel() // (*)
  }, [])

  if (pageResults) {
    let pageResult = pageResults.map(el => (
      <HomieResults
        city={el['City']}
        age={el['Days on Market']}
        price={el['Price']}
        profit={el['Potential Profit']}
        link={el['Website Link']}
        avgSqftPrice={el['Average Price Per Sqft in the Area']}
        sqftPrice={el['Price Per Sqft']}
        sampleSize={el['Sample Size']}
      />
    ))

    return (
      <>
        <h1>Homie Bot</h1>
        <div>Searches Homie and calculates average price per square foot per city and then returns Homie listed houses that are underpriced.</div>
        <div>A small sample size indicates an unreliable average price per sqft.</div>
        <ol>{pageResult}</ol>
      </>
    )
  }
  return <Spinner />
}

function HomieResults(props) {
  const { city, age, price, profit, link, avgSqftPrice, sqftPrice, sampleSize } = props
  return (
    <li>
      <div>Price: ${price}</div>
      <div>Price Per Sqft: ${sqftPrice}</div>
      <div>Average Price Per Sqft: ${avgSqftPrice}</div>
      <div>Sample size: {sampleSize}</div>
      <div>Profit: ${profit}</div>
      <div>City: {city}</div>
      <div>Days on Market: {age}</div>
      <a href={link}>Website Link</a>
    </li>
  )
}

export default Homie
