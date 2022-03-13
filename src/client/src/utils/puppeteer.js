//Enable stealth mode
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function createPage(url, headless) {
  // set chrome executable path based on OS

  const browser = await puppeteer.launch({
    headless: headless,
    slowMo: 20,
  })

  const page = (await browser.pages())[0]

  await page.setJavaScriptEnabled(true)
  await page.setDefaultNavigationTimeout(0)

  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    })
  })

  await page.evaluateOnNewDocument(() => {
    // Pass chrome check
    window.chrome = {
      runtime: {},
      // etc.
    }
  })

  await page.evaluateOnNewDocument(() => {
    //Pass notifications check
    const originalQuery = window.navigator.permissions.query
    return (window.navigator.permissions.query = parameters =>
      parameters.name === 'notifications'
        ? Promise.resolve({
            state: Notification.permission,
          })
        : originalQuery(parameters))
  })

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    })
  })

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `languages` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    })
  })

  await page.goto(url, {
    timeout: 0,
  })

  return [page, browser]
}

module.exports = createPage
