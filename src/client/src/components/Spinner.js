import React from 'react'
import { css } from '@emotion/react'
import PropagateLoader from 'react-spinners/PropagateLoader'

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`

function Spinner() {
  return (
    <>
      <div className="mt-3">Checking Internet, Please Hold (up to 60 seconds)</div>
      <div className="sweet-loading mb-3">
        <div className="my-3">
          <PropagateLoader color={'#ffffff'} css={override} size={15} />
        </div>
      </div>
    </>
  )
}

export default Spinner
