import { React, useState, useEffect } from 'react'
import Spinner from '../../components/Spinner'
const { handleAPI } = require('../../utils/zillow-helpers')

// Can be a string as well. Need to ensure each key-value pair ends with ;

function Zillow() {
  return <SearchResults />

  function SearchResults() {
    const [pageResults, setPageResults] = useState(null)
    useEffect(() => {
      async function fetch() {
        setPageResults(await handleAPI())
      }
      fetch()
    }, [])
    if (pageResults) {
      let pageResult = pageResults.map(el => <House city={el['City']} profit={el['Potential Profit']} webpage={el['Webpage']} />)
      // const resultItem = pageResults.map(el => <div>{el}</div>)
      return (
        <div className="login">
          <h1>Houses With Zestimates $50,000 Over Listing Price</h1>
          <ol>{pageResult}</ol>
        </div>
      )
    }
    return <Spinner />
  }

  function House(props) {
    const { city, profit, webpage } = props
    return (
      <li>
        <div> Potential Profit: ${profit.toLocaleString()} </div>
        <div> City: {city} </div>
        <div>
          <a href={webpage}>Website </a>
        </div>
      </li>
    )
  }
}

export default Zillow
