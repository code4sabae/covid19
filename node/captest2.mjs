import util from './util.mjs'
import webdriverio from 'webdriverio'
import path from "path"


console.log(import.meta)
const __dirname = path.dirname(new URL(import.meta.url).pathname)
console.log(__dirname)

const main = async function() {
  try {
    const browser = await webdriverio.remote({
      runner: true,
      outputDir: '.', //__dirname,
      capabilities: {
        browserName: 'chrome'
      }
    })
    return
    //await browser.setWindowSize(1200, 500)
    //await browser.url('https://www.stopcovid19.jp/')
    //await util.sleep(5000)
    // console.log(await browser.getTitle())
    await browser.saveScreenshot('screenshot.png')
    await browser.deleteSession()
  } catch (e) {
    console.log(e)
  }
}
main()
