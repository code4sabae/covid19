const { remote } = require('webdriverio')
console.log(__dirname)

const sleep = async msec => new Promise(resolve => setTimeout(resolve, msec))

const main = async function() {
  const browser = await remote({
    runner: true,
    outputDir: __dirname,
    capabilities: {
      browserName: 'safari' // 'chrome'
    }
  })
  //await browser.url('https://www.stopcovid19.jp/#ja')
  await browser.url('http://localhost:8888/fukunojigjp/app/covid19/#ja')
  await browser.setViewportSize(1200, 640)
  await sleep(3000)
  await browser.saveScreenshot('screenshot.png')
  await sleep(3000)
  console.log(await browser.getTitle())
  await browser.deleteSession()
}
main()
