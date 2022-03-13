const express = require('express')
const createPage = require('../../client/src/utils/puppeteer')
const { handlePage } = require('../../client/src/utils/facebook-helpers')
const fs = require('fs')

const routes = express.Router()

routes.use('/facebook-bot', async (req, res) => {
  try {
    const userInputPath = 'user-input.txt'
    const cookiesPath = 'cookies.txt'
    const previousPostPath = 'previous-post.txt'
    let previousPost
    let content
    let login
    let password
    let keywords
    let reply
    let page
    let url
    let browser
    let userInput = req.body.userInput
    let failedLogin

    let previousPostSession = fs.existsSync(previousPostPath)
    if (previousPostSession) {
      content = fs.readFileSync(previousPostPath)
      previousPost = JSON.parse(content)
    }

    // If the user file exists, get user info.
    let previousUserSession = fs.existsSync(userInputPath)
    if (previousUserSession) {
      content = fs.readFileSync(userInputPath)
      const userInputArr = JSON.parse(content)
      ;[login, password, reply, keywords] = userInputArr
    } else {
      ;[login, password, reply, keywords] = userInput
      fs.writeFileSync(userInputPath, JSON.stringify(userInput))
      url = 'https://facebook.com'
      ;[page, browser] = await createPage(url, false)
      console.log('Logging in...')
      await page.type('#email', login)
      await page.type('#pass', password)
      await page.click('[name="login"]')
      await page.waitForNavigation()
      const selector = '[aria-posinset="1"]'
      await page.waitForSelector(selector, { timeout: 7000 })
      const cookiesObject = await page.cookies()
      fs.writeFileSync(cookiesPath, JSON.stringify(cookiesObject))
      console.log('Session has been saved to ' + cookiesPath)
      await browser.close()
    }

    url = 'https://www.facebook.com/?sk=h_chr'
    ;[page, browser] = await createPage(url, false)
    const context = browser.defaultBrowserContext()
    context.overridePermissions('https://www.facebook.com/?sk=h_chr', ['geolocation', 'notifications'])
    // read the cookies.
    content = fs.readFileSync(cookiesPath)
    const cookiesArr = JSON.parse(content)
    if (cookiesArr.length !== 0) {
      for (let cookie of cookiesArr) {
        await page.setCookie(cookie)
      }
      console.log('Session has been loaded in the browser')
    }
    await page.reload()
    const [currentPost, currentPoster, matchFound, failedCookies, duplicatePost] = await handlePage(page, reply, keywords, previousPost)
    fs.writeFileSync(previousPostPath, JSON.stringify(currentPost))
    const results = { currentPost, currentPoster, reply, matchFound, keywords, failedCookies, duplicatePost, failedLogin }
    await browser.close()
    res.json(results)
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    failedLogin = true
    const results = { currentPost, currentPoster, reply, matchFound, keywords, failedCookies, duplicatePost, failedLogin }
    res.json(results)
  }
})

module.exports = routes
