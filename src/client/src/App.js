import MainPage from './pages/Main'
import KSL from './pages/KSL'
import Zillow from './pages/Zillow'
import Homie from './pages/Homie'
import Facebook from './pages/Facebook'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Route exact={true} path="/" component={MainPage} />
            <Route path="/ksl-bot" component={KSL} />
            <Route path="/zillow-bot" component={Zillow} />
            <Route path="/homie-bot" component={Homie} />
            <Route path="/facebook-bot" component={Facebook} />
          </Switch>
        </Router>
      </header>
    </div>
  )
}

export default App
