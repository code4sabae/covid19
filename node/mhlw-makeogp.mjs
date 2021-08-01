import webdriver from 'selenium-webdriver'
import fs from 'fs'
import Jimp from 'jimp'
import util from './util.mjs'

const { Builder, By, until } = webdriver;

/*
const url = 'http://localhost:8888/fukunojigjp/app/covid19/#ja'
const srcfn = '../index.html';
const dstpath = '../ogp/';
const prefix = 'covid19japan_ogp_';
const fullpath = "https://www.stopcovid19.jp/ogp/";
const delay = 5000;
*/
const url = 'http://127.0.0.1:8080/mhlw-beds.html';
const srcfn = '../mhlw-beds.html';
const dstpath = '../mhlw-ogp/';
const prefix = '';
const fullpath = "https://www.stopcovid19.jp/mhlw-ogp/";
const delay = 2000;

const capabilities = webdriver.Capabilities.chrome()
capabilities.set('chromeOptions', {
  args: [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=410,640'
  ]
})

const saveScreenShot = async function (url, fn) {
  const driver = await new Builder().withCapabilities(capabilities).build()

  await driver.get(url)
  await driver.executeScript('document.body.style.overflow = "hidden"')

  // await driver.wait(until.elementLocated(By.id('qrcode')), 10000)
  await util.sleep(delay)

  const base64 = await driver.takeScreenshot()
  const buffer = Buffer.from(base64, 'base64')
  fs.writeFileSync(fn, buffer)

  driver.quit()
}

const resizeImage = async function (dstfn, fn) {
  const dw = 1220
  const dh = 640

  const png = await Jimp.read(fn)
  const h = (dw / png.bitmap.width * png.bitmap.height) >> 0
  png.resize(dw, h)
  png.crop(0, 0, dw, dh)

  await png.write(dstfn)
}
const saveOGP = async function (url, dstfn) {
  const fn = 'screenshot.png'
  await saveScreenShot(url, fn)
  await resizeImage(dstfn, fn)
}
const editOGP = function (srcfn, fn) {
  let html = fs.readFileSync(srcfn, 'utf-8')
  html = html.replace(/<meta property="og:image" content=".+">/, `<meta property="og:image" content="${fullpath}${fn}">`)
  html = html.replace(/<meta name="twitter:image" content=".+">/, `<meta name="twitter:image" content="${fullpath}${fn}">`)
  fs.writeFileSync(srcfn, html, 'utf-8')
}
const main = async function () {
  if (process.argv.length >= 3) {
    // console.log(process.argv)
    const url = process.argv[2]
    console.log(url)
    const dstfn = process.argv.length >= 4 ? process.argv[3] : 'ss.png'
    await saveOGP(url, dstfn)
    //await cmd.cmd('open ' + dstfn)
  } else {
    const debug = false
    const path = debug ? 'temp/' : dstpath;
    const dstfn = prefix + util.getYMDHMS() + '.png'
    console.log('write ' + dstfn)
    await saveOGP(url, path + dstfn)
    if (!debug) {
      editOGP(srcfn, dstfn)
    }
  }
}
main()

export default { saveScreenShot }
