import { React, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Spinner from '../../components/Spinner'
const { handleAPI } = require('../../utils/ksl-helpers')

function KSL() {
  const [searchTerms, setSearchTerms] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pageResults, setPageResults] = useState(null)

  return <PageContent />

  function PageContent() {
    if (isSearching) {
      return <Spinner />
    }
    return (
      <>
        <h1>KSL Bot</h1>
        <div>Searches KSL and only returns results 10% below the average price</div>
        <SearchBox />
        <SearchResults />
      </>
    )
  }

  function validateForm() {
    return searchTerms.length > 0
  }

  async function handleSubmit() {
    setIsSearching(true)
    setPageResults(await handleAPI(searchTerms))
    setIsSearching(false)
  }

  function Item(props) {
    const { city, price, age, title, description, discount, webpage } = props
    return (
      <li>
        <div>{title}</div>
        <div>{description}</div>
        <div>Time on KSL: {age}</div>
        <div>City: {city}</div>
        <div>Price: ${price}</div>
        <div>Cost Below Average: ${discount}</div>
        <div>
          <a href={webpage}>Link to Item</a>
        </div>
      </li>
    )
  }

  function SearchResults() {
    if (pageResults) {
      let pageResult = pageResults.map(el => <Item title={el['Title']} description={el['Description']} city={el.City} price={el['Price']} age={el['Time on KSL']} discount={el['Price Deviation ($)']} webpage={el['Link']} />)
      return <ol>{pageResult}</ol>
    }
    return null
  }

  function SearchBox() {
    return (
      <div className="Login">
        <Form>
          <Form.Group size="lg" controlId="search-terms">
            <Form.Label>Search Keywords</Form.Label>
            <Form.Control autoFocus type="search-terms" value={searchTerms} onChange={e => setSearchTerms(e.target.value)} />
          </Form.Group>
          <Button block size="lg" type="submit" disabled={!validateForm()} onClick={() => handleSubmit()}>
            Search
          </Button>
        </Form>
      </div>
    )
  }
}

export default KSL
