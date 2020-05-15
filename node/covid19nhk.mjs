import cheerio from 'cheerio'
import util from './util.js'
import fs from 'fs'
import fetch from 'node-fetch'

//const URL = 'https://www3.nhk.or.jp/news/special/coronavirus/medical/'
const URL = 'https://www3.nhk.or.jp/news/special/coronavirus/medical/module/mod_bed-patient-percentage.html'

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
  //const path = '../data/covid19nhk/'
  const path = 'temp/covid19nhk/'

  /*
  const list = []
  try {
    list = util.csv2json(util.decodeCSV(fs.readFileSync(path + fnndex, 'utf-8')))
  } catch (e) {
  }
  */

  //const html = fs.readFileSync(path + fn, 'utf-8')
  const html = await (await fetch(url)).text()
  fs.writeFileSync(path + "test.html", html, 'utf-8')
  console.log(html)

  const dom = cheerio.load(html)
  const tbls = parseTablesFromHTML(dom)
  console.log(tbls)
  let cnt = 0
  for (const tbl of tbls) {
    const fncsv = 'nhk' + cnt++
    fs.writeFileSync(path + fncsv, util.addBOM(util.encodeCSV(tbl)))
  }
}
if (process.argv[1].endsWith('/covid19nhk.mjs')) {
  main()
}
