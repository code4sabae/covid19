import cheerio from 'cheerio'
import util from './util.js'
import fs from 'fs'
import fetch from 'node-fetch'
import htmlparser from './htmlparser.mjs'
import dateparser from './dateparser.mjs'
import covid19fast from './covid19fast.mjs'

const main = async function() {
  const url_opendata = 'https://www.pref.kumamoto.jp/kiji_22038.html'
  const pref = "Kumamoto"

  const lpref = pref.toLowerCase()
  //const path = '../data/covid19' + lpref + '/'
  const path = 'temp/covid19' + lpref + '/'
  const fn = path + "test.html"

  /*
  const list = []
  try {
    list = util.csv2json(util.decodeCSV(fs.readFileSync(path + fnndex, 'utf-8')))
  } catch (e) {
  }
  */

  //const html = fs.readFileSync(fn, 'utf-8')
  const html = await (await fetch(url_opendata)).text()
  //fs.writeFileSync(fn, html, 'utf-8')
  //console.log(html)

  const dom = cheerio.load(html)
  const tbls = htmlparser.parseTables(dom)
  //console.log(tbls)
  
  /*
  let cnt = 0
  for (const tbl of tbls) {
    const fncsv = lpref + cnt++ + '.csv'
    fs.writeFileSync(path + fncsv, util.addBOM(util.encodeCSV(tbl)))
  }
  */
  const json = util.csv2json(tbls[1])
  for (const d of json) {
    const name = d['データ名称']
    if (name.indexOf('陽性患者属性') == -1)
      continue
    const dt = dateparser.parseDate(name)
    console.log(dt)
    const csvurl = d['ファイル（CSV形式）'].split(' ')[0]
    console.log(csvurl)
    const res = await covid19fast.makeData(pref, csvurl, url_opendata)
    console.log(res)
    break
  }
  
}
if (process.argv[1].endsWith('/covid19kumamoto.mjs')) {
  main()
}
