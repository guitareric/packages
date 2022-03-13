const express = require('express')
const fs = require('fs')
const routes = express.Router()

routes.use('/facebook-database', (req, res) => {
  const botRunningPath = 'bot-running.txt'
  const userInputPath = 'user-input.txt'
  const cookiesPath = 'cookies.txt'
  const previousPostPath = 'previous-post.txt'
  const previousKeywordsPath = 'previous-keywords.txt'
  let botRunning
  let previousKeywords
  let content
  let userInput
  let previousUserSession = fs.existsSync(userInputPath)
  if (previousUserSession) {
    content = fs.readFileSync(userInputPath)
    userInput = JSON.parse(content)
  }
  if (req.body.previousKeywords) {
    content = req.body.previousKeywords
    fs.writeFileSync(previousKeywordsPath, JSON.stringify(content))
  }
  if (fs.existsSync(previousKeywordsPath)) {
    previousKeywords = fs.readFileSync(previousKeywordsPath)
    previousKeywords = JSON.parse(previousKeywords)
  }

  if (fs.existsSync(botRunningPath)) {
    botRunning = fs.readFileSync(botRunningPath)
    botRunning = JSON.parse(botRunning)
  }
  if (req.body.botRunning === true) {
    fs.writeFileSync(botRunningPath, JSON.stringify(req.body.botRunning))
    botRunning = req.body.botRunning
  }
  if (req.body.botRunning === false) {
    fs.writeFileSync(botRunningPath, JSON.stringify(req.body.botRunning))
    botRunning = req.body.botRunning
  }
  const results = { botRunning, previousKeywords, userInput }

  if (req.body.deleteInfo) {
    if (fs.existsSync(userInputPath)) {
      fs.unlinkSync(userInputPath)
    }
    if (fs.existsSync(cookiesPath)) {
      fs.unlinkSync(cookiesPath)
    }
    if (fs.existsSync(previousPostPath)) {
      fs.unlinkSync(previousPostPath)
    }
  }

  res.json(results)
})

module.exports = routes
