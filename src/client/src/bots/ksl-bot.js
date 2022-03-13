const { parseArgs, parseResults } = require('./../utils/ksl-helpers')

;(async () => {
  let url = parseArgs(process.argv.slice(2))
  const results = await parseResults(url, true)
  console.log(results)
})()
