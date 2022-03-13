import { React, useState, useEffect, useRef } from 'react'
import { Form, Button } from 'react-bootstrap'
import Spinner from '../../components/Spinner'
import axios from 'axios'

export default function Facebook() {
  const [keywords, setKeywords] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [reply, setReply] = useState('')
  const [pageResults, setPageResults] = useState(null)
  const [isRunning, setIsRunning] = useState(null)
  const intervalRef = useRef()
  let response
  let userInput
  async function changeBotStatus(status) {
    try {
      let deleteInfo
      if (status === true) {
        deleteInfo = false
      }
      if (status === false) {
        deleteInfo = true
      }
      await axios.post(`/api/resources/facebook-database`, { deleteInfo: deleteInfo, botRunning: status })
    } catch (err) {
      console.log('There was a problem or request was cancelled.')
    }
  }

  function GetBotStatus() {
    useEffect(() => {
      const fetchStatus = async () => {
        try {
          response = await axios.get(`/api/resources/facebook-database`)
          setIsRunning(response.data.botRunning)
          console.log('bot is', isRunning)
          console.log(`status got and is ${response.data.botRunning}`)
          setKeywords(response.data.previousKeywords)
          setReply(response.data.userInput[2])
          setLogin(response.data.userInput[0])
        } catch (err) {
          console.log('There was a problem or request was cancelled.')
        }
      }
      fetchStatus()
    }, [])
  }
  GetBotStatus()

  function ShowUserInfo() {
    return (
      <>
        <div className="d-inline">
          User is: <p className="d-inline text-primary">{login}</p>
        </div>
        <div className="d-inline">
          Keywords are: <p className="d-inline text-warning">{keywords}</p>
        </div>
        <div className="d-inline pb-3">
          Reply is: <p className="d-inline text-info">{reply}</p>
        </div>
      </>
    )
  }
  const fetchPost = async () => {
    try {
      setPageResults(null)
      userInput = [login, password, reply, keywords]
      response = await axios.post(`/api/resources/facebook-bot`, {
        userInput,
      })
      setPageResults(response.data)
      await axios.post(`/api/resources/facebook-database`, { previousKeywords: keywords })
    } catch (err) {
      console.log('There was a problem or request was cancelled.')
    }
  }

  if (isRunning) {
    clearInterval(intervalRef.current)
    const id = setInterval(fetchPost, 60000)
    intervalRef.current = id
  }
  async function handleSubmit(event) {
    setPageResults(null)
    setIsRunning(true)

    changeBotStatus(true)

    event.preventDefault()

    const id = setInterval(fetchPost, 60000)
    intervalRef.current = id

    fetchPost()
  }

  async function resetCookies() {
    try {
      await axios.post('/api/resources/facebook-database', { deleteInfo: true })
    } catch (error) {
      console.log('cookie reset failed')
    }
  }
  function handleBotStop(event) {
    if (event) {
      event.preventDefault()
    }
    setIsRunning(false)
    setPageResults(null)
    changeBotStatus(false)
    clearInterval(intervalRef.current)
  }
  function StopButton() {
    return (
      <Button className="my-3" variant="danger" type="button" onClick={handleBotStop}>
        Stop Bot
      </Button>
    )
  }

  function PostInfo() {
    if (pageResults) {
      let { currentPost, currentPoster, reply, matchFound, keywords, failedCookies, duplicatePost, failedLogin } = pageResults
      if (!matchFound && !failedCookies && !failedLogin && !duplicatePost) {
        return (
          <>
            <div>
              {currentPoster} said: {currentPost}
            </div>
            <div className="mb-2 text-danger">No match found, checking for new posts in 60 seconds...</div>
          </>
        )
      }

      if (matchFound && !failedCookies && !failedLogin && !duplicatePost) {
        return (
          <>
            <div>
              {currentPoster} said: {currentPost}
            </div>
            <div className="text-success">Match found! Reply sent!</div>
            <div className="mb-2">Refreshing in 60 seconds...</div>
          </>
        )
      }
      if (failedCookies) {
        resetCookies()
        return (
          <>
            <div className="mb-2 text-danger">Cannot find post, trying again in 60 seconds...</div>
          </>
        )
      }
      if (failedLogin) {
        setTimeout(handleBotStop, 5000)
        return <div className="mb-2 text-danger">Login failed, check user information and password. Resetting in 5 seconds...</div>
      }
      if (duplicatePost) {
        return (
          <>
            <div>
              {currentPoster} said: {currentPost}
            </div>
            <div className="mb-2 text-danger">No new posts found, checking again in 60 seconds...</div>
          </>
        )
      }
    }

    return null
  }

  function BotRunning() {
    if (isRunning) {
      return (
        <>
          <div className="d-inline">
            Bot status: <div className="text-success d-inline">Running</div>
          </div>
        </>
      )
    }
    return (
      <div className="d-inline">
        Bot status: <div className="text-danger d-inline">Stopped</div>
      </div>
    )
  }

  function BotForm() {
    if (isRunning && pageResults) {
      return (
        <>
          <ShowUserInfo />
          <PostInfo />
          <StopButton />
        </>
      )
    }
    if (isRunning && !pageResults) {
      return (
        <>
          <ShowUserInfo />
          <PostInfo />
          <Spinner />
          <StopButton />
        </>
      )
    }
    if (!isRunning) {
      return (
        <>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label className="text-primary">Facebook Login</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={login} onChange={e => setLogin(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className="text-primary">Facebook Password</Form.Label>
              <Form.Control type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formBasicKeywords">
              <Form.Label className="text-primary">Keywords or Phrases (home = bad, buy a home = good)</Form.Label>
              <Form.Control type="keywords" placeholder="Keywords separated by commas (e.g. buy a house, home loan, realtor, etc)" value={keywords} onChange={e => setKeywords(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formBasicReply">
              <Form.Label className="text-primary">Your Automated Reply</Form.Label>
              <Form.Control type="reply" placeholder="Enter reply" value={reply} onChange={e => setReply(e.target.value)} />
            </Form.Group>
            <Button className="my-3" variant="primary" type="submit">
              Start Bot
            </Button>
          </Form>
        </>
      )
    }
    return null
  }

  return (
    <>
      <h1>FB Bot</h1>
      <div>Bot that searches feed for keywords and auto-replies</div>
      <BotRunning />
      {BotForm()} {/* cannot use react component due to loss of focus on keystroke */}
    </>
  )
}
