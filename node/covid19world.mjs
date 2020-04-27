import cheerio from 'cheerio'
import fs from 'fs'
import fetch from 'node-fetch'

import util from './util.mjs'
import htmlparser from './htmlparser.mjs'
import dateparser from './dateparser.mjs'

const main = async function() {
  const url_opendata = 'https://www.mhlw.go.jp/stf/newpage_11048.html'

  const path = '../data/covid19world/'
  
  //const html = fs.readFileSync(fn, 'utf-8')
  const html = await (await fetch(url_opendata)).text()
  //console.log(html)

  const dom = cheerio.load(html)
  const title = htmlparser.extractTag(dom, '.m-hdgLv3__hdg', '国外の発生状況')
  const p = title.next('p')
  const dt = dateparser.parseDate(p.text()).replace(/:/g, '-')
  const fn = path + dt + '.csv'
  if (util.readFileSync(fn)) {
    console.log('no update')
    return
  }

  const tbl = p.next('table')
  const lines = htmlparser.parseTHTD(dom, tbl)
  lines.pop()
  for (let i = 1; i < lines.length; i++) {
    for (let j = 1 ; j < lines[i].length; j++) {
      lines[i][j] = parseInt(lines[i][j].replace(/\,/g, ''))
    }
  }
  console.log(lines)
  console.log(lines.length - 1)

  fs.writeFileSync(path + dt + '.html', html, 'utf-8')
  const csv = util.addBOM(util.encodeCSV(lines))
  fs.writeFileSync(fn, csv, 'utf-8')
  fs.writeFileSync(path + 'latest.csv', csv, 'utf-8')
}
if (process.argv[1].endsWith('/covid19world.mjs')) {
  main()
}
