import cheerio from 'cheerio'
import util from './util.js'
import fs from 'fs'
import fetch from 'node-fetch'
import htmlparser from './htmlparser.mjs'
import covid19fast from './covid19fast.mjs'

const main = async function() {
  const url_opendata = 'https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/corona-doko.html'
  const url_base = 'https://www.pref.nagano.lg.jp/'
  const pref = "Nagano"

  const lpref = pref.toLowerCase()
  //const path = '../data/covid19' + lpref + '/'
  const path = 'temp/covid19' + lpref + '/'
  const fn = path + "test.html"

  //const html = fs.readFileSync(fn, 'utf-8')
  const html = await (await fetch(url_opendata)).text()
  //fs.mkdirSync(path)
  fs.writeFileSync(fn, html, 'utf-8')
  console.log(html)

  const dom = cheerio.load(html)

  const csvurl = url_base + htmlparser.extractLink(dom, '新型コロナウイルス感染症患者の発生状況（CSV：')
  console.log(csvurl)

  const res = await covid19fast.makeData(pref, csvurl, url_opendata)
  console.log(res)
}
if (process.argv[1].endsWith('/covid19nagano.mjs')) {
  main()
}
