import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'
import xlsx2csv from './xlsx2csv.mjs'
import cheerio from 'cheerio'
import dateparser from './dateparser.mjs'

const fetchAndSave = async function (url, dstpath) {
  const fnlatest = dstpath + 'latest.xlsx'
  const data = await (await fetch(url)).arrayBuffer()
  const temp = new Date().getTime() + '.xlsx'
  dstpath = dstpath || 'temp/'
  const bin = new Buffer.from(data)
  const binpast = util.readFileSync(fnlatest)
  console.log(bin, binpast)
  if (binpast && Buffer.compare(bin, binpast) === 0) {
    return fnlatest
  }
  util.writeFileSync(dstpath + temp, bin, 'binary')
  util.writeFileSync(fnlatest, bin, 'binary')
  return fnlatest
}
const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const main = async function () {
  const pref = 'Miyagi'
  const urlOpendata = 'https://www.pref.miyagi.jp/site/covid-19/02.html'
  const lpref = pref.toLowerCase()
  const path = '../data/covid19' + lpref + '/'

  const html = await (await fetch(urlOpendata)).text()
  const dom = cheerio.load(html)
  let dt = null
  let url = null
  dom('.detail_free').each((idx, ele) => {
    dom('p', null, ele).each((idx, ele) => {
      if (!dt) { dt = dateparser.parseDate(dom(ele).text()) }
    })
    dom('a', null, ele).each((idx, ele) => {
      if (url) { return }
      const link = dom(ele).attr('href')
      if (link && link.endsWith('.xlsx')) { url = 'https://www.pref.miyagi.jp' + link }
    })
  })

  const fn = await fetchAndSave(url, path)
  // const workbook = xlsx.readFile('temp/kansensuii.xlsx')
  const workbook = xlsx.readFile(fn)
  // console.log(workbook)
  const res = { name: pref }
  const sh = workbook.Sheets['累計グラフ（HP掲載）']
  if (!sh) {
    console.log('cant find sheet')
    process.exit(1)
  }
  console.log(sh)
  const chk = ['罹患者', '退院者', '死亡者']
  for (let i = 0; i < chk.length; i++) {
    if (sh['A' + (6 + i)].v !== chk[i]) {
      console.log('cant find data on sheet ' + chk[i], sh['A' + (6 + i)].v)
      process.exit(1)
    }
  }
  res.lastUpdate = dt
  res.npatients = parseInt(sh.B6.v)
  res.nexits = parseInt(sh.B7.v)
  res.ndeaths = parseInt(sh.B8.v)
  res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths

  res.src_url = url
  res.url_opendata = urlOpendata
  console.log(res)

  util.writeFileSync(path + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  util.writeFileSync(path + 'latest.json', JSON.stringify(res))
}
main()
