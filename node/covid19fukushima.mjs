import cheerio from 'cheerio'
import util from './util.js'
import fs from 'fs'
import fetch from 'node-fetch'
import htmlparser from './htmlparser.mjs'
import dateparser from './dateparser.mjs'
import covid19fast from './covid19fast.mjs'

const main = async function() {
  const url_opendata = 'http://www.pref.fukushima.lg.jp/w4/covid19/patients/'
  const pref = "Fukushima"

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
  
  const json = util.csv2json(tbls[0])
  let latest = null
  for (const d of json) {
    const name = d['?C=N;O=D Name']
    if (name && name.length > 0) {
      latest = d
    }
  }
  const csvurl = url_opendata + latest['?C=N;O=D Name'].split(' ')[0]
  console.log(csvurl)

  //const csv = await (await fetch(csvurl)).text()
  //fs.writeFileSync(path + 'test.csv', csv, 'utf-8')
  const res = await covid19fast.makeData(pref, csvurl, url_opendata)
  console.log(res)
}
if (process.argv[1].endsWith('/covid19fukushima.mjs')) {
  main()
}
