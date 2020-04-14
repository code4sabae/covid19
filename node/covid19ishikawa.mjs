import cheerio from 'cheerio'
import util from './util.js'
import fs from 'fs'
import fetch from 'node-fetch'

const URL = 'https://www.pref.ishikawa.lg.jp/kansen/coronakennai.html'

// 令和2年2月27日 -> 2020-02-27 or null
const parseDate = function(s) {
  s = util.toHalf(s)
  const num = s.match(/令和(\d+)年(\d+)月(\d+)日/)
  if (!num)
    return null
  const y = 2018 + parseInt(num[1])
  const m = parseInt(num[2])
  const d = parseInt(num[3])
  return y + "-" + util.fix0(m, 2) + "-" + util.fix0(d, 2)
}
const parseTextHTML = function(dom, tag, key) {
  let res = null
  dom(tag).each((idx, ele) => {
    if (res)
      return
    const text = dom(ele).text()
    if (text.indexOf(key) >= 0)
      res = text
  })
  return res
}
const parseTablesFromHTML = function(dom) {
  const tbl = []
  const trim = function(s) {
    return s.replace(/\s/g, '')
  }
  dom('table').each((idx, ele) => {
    const lines = []
    dom('tr', null, ele).each((idx, tr) => {
      const line = []
      dom('th', null, tr).each((idx, th) => line.push(trim(dom(th).text())))
      dom('td', null, tr).each((idx, td) => line.push(trim(dom(td).text())))
      lines.push(line)
    })
    tbl.push(lines)
  })
  return tbl
}
const main = async function() {
  const url = URL
  const path = '../data/covid19ishikawa/'
  const fn = '20200414144529.html'

  const fnindex = 'index.csv'

  const list = []
  try {
    list = util.csv2json(util.decodeCSV(fs.readFileSync(path + fnndex, 'utf-8')))
  } catch (e) {
  }

  //const html = fs.readFileSync(path + fn, 'utf-8')
  const html = await (await fetch(url)).text()
  const dom = cheerio.load(html)
  const title = parseTextHTML(dom, 'h2', '市町別感染者数')
  const dt = parseDate(title)
  console.log(dt)
  const fncsv = dt + ".csv"
  let exists = null
  for (const d of list) {
    if (d.lastUpdate == dt) {
      exists = d
      break
    }
  }
  if (!exists) {
    list.push({ title: title + " - 石川県／新型コロナウイルス感染症の県内の患者発生状況", lastUpdate: dt, csv: fncsv, src_url: URL })
    fs.writeFileSync(path + fnindex, util.addBOM(util.encodeCSV(util.json2csv(list))), 'utf-8')
  }
  const tbls = parseTablesFromHTML(dom)
  if (tbls.length > 0 ) {
    const tbl = tbls[0]
    tbl[0][0] = '市町'
    fs.writeFileSync(path + fncsv, util.addBOM(util.encodeCSV(tbl)))
  }
}
if (process.argv[1].endsWith('/covid19ishikawa.mjs')) {
  main()
} else {
}
