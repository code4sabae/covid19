import fs from 'fs'
import util from './util.mjs'
import webdriver from 'selenium-webdriver'
import Jimp from 'jimp'
import cheerio from 'cheerio'

const { Builder, By, until } = webdriver

const capabilities = webdriver.Capabilities.chrome()
capabilities.set('chromeOptions', {
  args: [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=820,640' // 効かない
  ]
})

const updateTwitterCard = async function (fn) {
  const driver = await new Builder().withCapabilities(capabilities).build()

  //await driver.get('https://www.stopcovid19.jp/#ja')
  await driver.get('https://cards-dev.twitter.com/validator')
  //await driver.manage().window().setRect({ width: 524, height: 768 }) // ok!
  //selenium-webdriver
  await util.sleep(3000)
  await driver.findElement(By.tagName('body')).click({ x: 445, y: 174 })
  await util.sleep(1000)
  await driver.findElement(By.tagName('body')).sendKeys('taisukef')
  //await browser.keys('taisukef\taaa')
  // await driver.findeElement(By.tagName('body')).click({ x: 89, y: 174 }).sendKeys('taisukef')

return

  // await driver.wait(until.elementLocated(By.id('qrcode')), 10000)
  await util.sleep(3000)

  const url = 'https://www.stopcovid19.jp/'
  driver.findElement(By.name('url')).sendKeys(url)
  driver.findElement(By.xpath('//input[@type=\'submit\']')).click()
  await util.sleep(5000)
  driver.quit()
}
const main = async function () {
  const fn = 'screenshot.png'
  await updateTwitterCard(fn)
}
main()
