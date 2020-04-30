import webdriver from 'selenium-webdriver'
import fs from 'fs'
import Jimp from 'jimp'
import util from './util.mjs'

const { Builder, By, until } = webdriver

const capabilities = webdriver.Capabilities.chrome()
capabilities.set('chromeOptions', {
  args: [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=820,640'
  ]
})

const saveScreenShot = async function (fn) {
  const driver = await new Builder().withCapabilities(capabilities).build()

  // await driver.get('https://www.stopcovid19.jp/#ja')
  await driver.get('http://localhost:8888/fukunojigjp/app/covid19/#ja')

  // await driver.wait(until.elementLocated(By.id('qrcode')), 10000)
  await util.sleep(5000)

  const base64 = await driver.takeScreenshot()
  const buffer = Buffer.from(base64, 'base64')
  fs.writeFileSync(fn, buffer)

  driver.quit()
}

const resizeImage = async function (fn) {
  const dw = 1220
  const dh = 640

  const png = await Jimp.read(fn)
  const h = (dw / png.bitmap.width * png.bitmap.height) >> 0
  png.resize(dw, h)
  png.crop(0, 0, dw, dh)

  const path = '../ogp/'
  const dstfn = 'covid19japan_ogp_' + util.getYMDHMS() + '.png'
  await png.write(path + dstfn)
  console.log('write ' + dstfn)
  return dstfn
}
const editOGP = function (fn) {
  const srcfn = '../index.html'
  let html = fs.readFileSync(srcfn, 'utf-8')
  html = html.replace(/<meta property="og:image"\s\scontent=".+"\/>/, `<meta property="og:image"  content="https://www.stopcovid19.jp/ogp/${fn}"/>`)
  html = html.replace(/<meta name="twitter:image" content=".+"\/>/, `<meta name="twitter:image" content="https://www.stopcovid19.jp/ogp/${fn}"/>`)
  fs.writeFileSync(srcfn, html, 'utf-8')
}
const main = async function () {
  const fn = 'screenshot.png'
  await saveScreenShot(fn)
  const dstfn = await resizeImage(fn)
  editOGP(dstfn)
}
main()
