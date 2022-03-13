import React from 'react'
import BitcoinTicker from '../../tickers/BitcoinTicker'
import GamestopTicker from '../../tickers/GamestopTicker'
import AMCTicker from '../../tickers/AMCTicker'

function MainPage() {
  return (
    <>
      <h1>Main Page</h1>
      <BitcoinTicker />
      <GamestopTicker />
      <AMCTicker />
      <nav>
        <ul>
          <li>
            <a href="/ksl-bot">KSL Bot</a>
          </li>
          <li>
            <a href="/zillow-bot">Zillow Bot</a>
          </li>
          <li>
            <a href="/homie-bot">Homie Bot</a>
          </li>
          <li>
            <a href="/facebook-bot">FB Bot</a>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default MainPage
