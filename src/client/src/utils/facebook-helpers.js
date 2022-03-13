const axios = require('axios')

async function handlePage(page, reply, keywords, previousPost) {
  try {
    let matchFound
    let duplicatePost
    let failedCookies
    console.log('Checking for new posts...')
    const selector = '[aria-posinset="1"]'
    await page.waitForSelector(selector)
    let postHandle = await page.$(selector)
    let currentPost = await postHandle.evaluate(el => el.innerText)
    console.log(currentPost) // this will help for debugging to see the whole string that is returned
    let currentPoster = parsePoster(currentPost)
    currentPost = parseComment(currentPost)

    console.log(`Poster ${currentPoster} said:\n ${currentPost}`)

    const keywordsArr = keywords.split(', ')
    if (currentPost !== previousPost) {
      console.log('Checking for keywords...')
      for (let i = 0; i < keywordsArr.length; i++) {
        if (currentPost.includes(keywordsArr[i]) && !matchFound) {
          console.log('Match found! Leaving comment and sending Email notification...')
          matchFound = true
          // await autoScroll(page)
          await page.click('[aria-label="Leave a comment"]')
          await page.waitForSelector('[aria-label="Write a comment"]')
          await page.click('[aria-label="Write a comment"]')
          await page.type('[aria-label="Write a comment"]', reply)
          await page.keyboard.press('Enter')
          await page.waitForTimeout(5000)
          console.log('Comment sent, refreshing in 60 seconds...')
        }
        if (!matchFound && i === keywordsArr.length - 1) {
          console.log('No match found, refreshing in 60 seconds...')
          matchFound = false
        }
      }
    }
    if (currentPost === previousPost) {
      console.log('no new post found to check')
      duplicatePost = true
    }

    return [currentPost, currentPoster, matchFound, failedCookies, duplicatePost]
  } catch (error) {
    failedCookies = true
    console.log('cannot find post, need to reset cookies')
    return [currentPost, currentPoster, matchFound, failedCookies, duplicatePost]
  }
}

function parseComment(currentPost) {
  let comment
  const commentStartIndex = currentPost.lastIndexOf(' ·')
  comment = currentPost.substring(commentStartIndex + 4, currentPost.length) // + 4 needed to bypass first breakline
  comment = comment.substring(0, comment.indexOf('Like') - 1)
  if (currentPost.includes('new photos')) {
    comment = 'Added photos'
  }
  if (!comment) {
    comment = 'A like or a share from another poster'
  }

  // prettier-ignore
  const regex = new RegExp('\n+[0-9]+(?=\s)+[Comme]|\n+[Comme]|\n+[1-9]')
  if (comment.match(regex)) {
    comment = comment.substring(0, indexOf(regex))
  }

  console.log('parseComment is', comment)
  return comment
}

function parsePoster(currentPost) {
  let poster
  poster = currentPost.substring(0, currentPost.indexOf('\n'))
  if (currentPost.includes('Active')) {
    poster = currentPost.split('\n')
    poster = poster[1].split(' ')
    if (poster.length > 1) {
      poster = poster[0] + ' ' + poster[1]
    } else {
      poster = poster[0]
    }
  }

  if (currentPost.includes('shared a memory') || currentPost.includes('new photo')) {
    poster = currentPost.split('\n')
    poster = poster[0].split(' ')
    if (poster.length > 1) {
      poster = poster[0] + ' ' + poster[1]
    } else {
      poster = poster[0]
    }
  }
  if (poster.length > 23) {
    // this might actually cause a conflict, and is only meant to filter out noise from posters with only one name
    poster = poster.split(' ')
    if (poster.length > 1) {
      poster = poster[0] + ' ' + poster[1]
    } else {
      poster = poster[0]
    }
  }
  if (!poster) {
    poster = 'failed to parse poster'
  }

  // posts from comapnies (such as Cabellas) will have a bunch of noise attached to them, currently a check of the string length is used to determine if poster is a company, which could be problamatic
  // const lineBreaks = allIndexOf(currentPost, '\n') // not really helpful to filter out noise since a poster with first name last name can have more linebreaks than a poster with a single name
  // console.log('there are this many linebreaks: ' + lineBreaks.length)
  console.log('parsePoster is ', poster)
  return poster
}

async function autoScroll(page) {
  await page.evaluate(() => {
    window.scrollBy(0, 650)
  })
}

module.exports = {
  handlePage: handlePage,
}
