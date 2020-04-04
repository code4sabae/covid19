const fs = require('fs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const util = require('./util.js')
const pdf2text = require('./pdf2text.js')

//const CACHE_TIME = 1 * 60 * 60 * 1000 // 1hour
const CACHE_TIME = 10 * 1000 // 10min
//const CACHE_TIME = 1 * 60 * 1000 // 1min
const PATH = 'data/covid19japan/'
const URL = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000164708_00001.html'
const BASEURL = 'https://www.mhlw.go.jp'

const PREF = util.JAPAN_PREF
const PREF_EN = util.JAPAN_PREF_EN

const getCovid19Data = async function() {
  return await util.getWebWithCache(URL, PATH)
}
const getLastUpdate = function(fn) {
  return util.getLastUpdateOfCache(URL, PATH)
}
const getCovid19DataJSON = async function(type) {
  cachetime = CACHE_TIME
  const data = await util.getCache(async function() {
    return await fetchCovid19DataJSON(type, cachetime)
  }, 'data/covid19japan/', '-' + (type ? type : "default") + '.json', cachetime)
  return JSON.parse(data)
}
const startUpdate = function() {
  setInterval(async function() {
    await util.getWebWithCache(URL, PATH, CACHE_TIME)
  }, CACHE_TIME)
}

const parseWeek = function(s) {
  s = util.toHalf(s)
  const n = s.indexOf('週')
  return s.substring(0, n)
}
// '国内事例における都道府県別の患者報告数（2020年3月13日12時時点）' -> 2020/03/09 09:00
const parseDate = function(s) {
  const fix0 = util.fix0
  //const num = s.match(/国内事例における都道府県別の患者報告数（(\d+)年(\d+)月(\d+)日(\d+)時時点）/)
  s = s.substring(s.lastIndexOf('（'))
  let num = s.match(/（(\d+)年(\d+)月(\d+)日(\d+)時時点）/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    const h = parseInt(num[4])
    return y + "-" + fix0(m, 2) + "-" + fix0(d, 2) + "T" + fix0(h, 2) + ":00"
  }
  num = s.match(/（(\d+)年(\d+)月(\d+)日掲載分）/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    return y + "-" + fix0(m, 2) + "-" + fix0(d, 2)
  }
  return "--"
//  console.log(s, num)
}

const parseLink = function(data, title) {
  const dom = cheerio.load(data)
  const res = {}
  dom('a').each((idx, ele) => {
    const text = dom(ele).text()
    if (text && text.startsWith(title)) {
      res.dt = parseDate(text)
      const href = dom(ele).attr("href")
      res.url = href.startsWith("https://") ? href : BASEURL + href
    }
  })
  return res
}
const getDataJSON = async function(title, text2json) {
  const data = await getCovid19Data()
  const res = parseLnik(data, title)
  return await getJSONbyPDF(text2json, res.dt, res.url)
}
const getJSONbyPDF = async function(text2json, dt, url) {
  /*
  if (dt.endsWith(":00"))
    dt = dt.substring(0, dt.length - 3)
  const fn = PATH + dt
  */
  const fn = PATH + url.substring(url.lastIndexOf('/') + 1)
  try {
    const data = fs.readFileSync(fn + ".json")
    return JSON.parse(data)
  } catch (e) {
  }
  const pdf = await (await fetch(url)).arrayBuffer()
	fs.writeFileSync(fn + ".pdf", new Buffer.from(pdf), 'binary')
  const txt = await pdf2text.pdf2text(fn + ".pdf")
  const json = text2json(txt, url, dt)
  if (json != null)
    fs.writeFileSync(fn + ".json", JSON.stringify(json))
  return json
}

//
const parseNumber = function(s) {
  //console.log(s)
  const num = s.match(/.+ (\d+) 名/)
  //console.log(s, num)
  return parseInt(num[1])
}
const getAreas = function() {
  const area = []
  for (let i = 0; i < PREF.length; i++) {
    area[i] = { name: PREF_EN[i], name_jp: PREF[i] }
  }
  return area
}
const text2jsonWithoutCruise = function(txt, url, dt) {
  const res = {}
  const ss = txt.split('\n')
  res.srcurl_pdf = url
  res.srcurl_web = URL
  res.description = ss[0] + ss[1]
  res.lastUpdate = dt
  res.npatients = parseNumber(ss[2])
  const pref = []
  for (let i = 0; i < PREF.length; i++) {
    let cnt = 0
    for (let j = 3; j <= ss.length; j++) {
      if (ss[j] && ss[j].indexOf(PREF[i]) >= 0) {
        cnt = parseNumber(ss[j])
      }
    }
    pref[i] = { name: PREF_EN[i], name_jp: PREF[i], npatients: cnt }
  }
  res.area = pref
  return res
}
const text2jsonWithInspections = function(txt, url, dt) {
  const parsePeopleCount = function(s) {
    const n = parseInt(s)
    if (s == n) {
      return n
    }
    return s
  }

  const isNumber = function(n) {
    if (n == undefined)
      return false
    if (isNaN(n))
      return false
    return parseInt(n) == n
  }

  const res = {}
  const ss = txt.split('\n')
  /*
  for (let i = 0; i < ss.length; i++) {
    console.log(i, ss[i])
  }
  */
  let title = ""
  for (let i = 25; i < ss.length; i++)
    title += ss[i]
  //res.title = title
  res.srcurl_pdf = url
  res.srcurl_web = URL
  res.description = title // desc
  res.lastUpdate = dt
  res.npatients = 0
  res.ninspections = 0

  const area = getAreas()
  area[47] = { name: 'Japan', name_jp: "合計" }
  for (let i = 1; i <= 48 / 2; i++) {
    const ss2 = ss[i].split(' ')
    const area1 = area[i - 1]
    const area2 = area[i - 1 + 24]
    for (let j = 0; j < ss2.length; j++) {
      if (ss2[j] == area1.name_jp) {
        area1.npatients = parsePeopleCount(ss2[j + 1])
        area1.ninspections = parsePeopleCount(ss2[j + 2])
      } else if (ss2[j] == area2.name_jp) {
        area2.npatients = parsePeopleCount(ss2[j + 1])
        area2.ninspections = parsePeopleCount(ss2[j + 2])
      }
    }
    if (!isNumber(area1.npatients) || !isNumber(area2.npatients))
      return null
  }
  if (area.length != 48)
    return null
  
  //console.log(area.length)
  res.npatients = area[47].npatients
  res.ninspections = area[47].ninspections
  area.pop()
  res.area = area
  return res
}

const text2jsonWithCurrentPatients = function(txt, url, dt) {
  const parseDate = function(s) {
    const fix0 = util.fix0
    s = util.toHalf(s)
    // ３月18日(水)
    // 3月18日(水) 対前日比
    //let num = s.match(/(\d+)月(\d+)日\(.\) .+/)
    let num = s.match(/(\d+)月(\d+)日/)
    if (num) {
      const y = new Date().getFullYear()
      const m = parseInt(num[1])
      const d = parseInt(num[2])
      return y + "-" + fix0(m, 2) + "-" + fix0(d, 2)
    }
    return "--"
  }
//  console.log(txt, url, dt)
  const ss = txt.split('\n')
  const res = {}
  res.srcurl_pdf = url
  res.srcurl_web = URL
  res.description = null
  res.lastUpdate = dt
  res.npatients = 0
  res.nexits = 0
  res.ndeaths = 0
  res.ncurrentpatients = 0
  //res.ninspections = 0
  const dt2 = parseDate(ss[0])
  if (dt2 != "--") {
    res.lastUpdate = dt2
  } else {
    for (let i = 46; i < ss.length; i++) {
      const dt3 = parseDate(ss[46])
      if (dt3 != "--") {
        res.lastUpdate = dt3
        break
      }
    }
  }
  
  const area = getAreas()
  for (let i = 0; i < area.length; i++) {
    const a = area[i]
    a.npatients = 0
    a.ncurrentpatients = 0
    a.nexits = 0
    a.ndeaths = 0
  }
  for (let i = 1;; i++) {
    const ss2 = ss[i].split(' ')
    let nstart = parseInt(ss2[0]) == ss2[0] ? 1 : 0
    const pref = ss2[nstart]
    const nskip = ss2[nstart + 5].indexOf('%') >= 0 ? 1 : 0
    //console.log(nskip, ss2[nstart + 5])
    if (pref == '総計') {
      const a = res
      a.npatients = parseInt(ss2[nstart + 1])
      a.ncurrentpatients = parseInt(ss2[nstart + nskip + 3])
      a.nexits = parseInt(ss2[nstart + nskip + 5])
      a.ndeaths = parseInt(ss2[nstart + nskip + 7])
      a.description = ss[i + 1]
      break
    }
    const npref = PREF.indexOf(pref)
    if (npref == -1)
      return null
    const a = area[npref]
    a.npatients = parseInt(ss2[nstart + 1])
    a.ncurrentpatients = parseInt(ss2[nstart + nskip + 3])
    a.nexits = parseInt(ss2[nstart + nskip + 5])
    a.ndeaths = parseInt(ss2[nstart + nskip + 7])
    if (a.npatients != a.ncurrentpatients + a.nexits + a.ndeaths) {
      console.log("***** " + pref, a.ncurrentpatients, a.nexits, a.ndeaths)
      //return null
    }
  }
  res.area = area
  return res
}
//
const getCovid19DataSummaryForIchigoJam = async function() {
  const json = await getCovid19DataJSON()
  const summary = {}
  summary.lastUpdate = json.lastUpdate
  summary.Japan = json.npatients
  for (let i = 0; i < json.area.length; i++) {
    summary[json.area[i].name] = json.area[i].npatients
  }
  return util.simplejson2txt(summary)
}
//
const fetchCovid19DataJSON = async function(type) {
  if (type == 'withpcr') {
    return JSON.stringify(await getDataJSON('新型コロナウイルス陽性者数とPCR検査実施人数（都道府県別）', text2jsonWithInspections))
  }
  //const title = ''新型コロナウイルス感染症（国内事例）の入退院の状況（都道府県別）'
  const title = '国内事例における都道府県別の患者報告数'
  return JSON.stringify(await getDataJSON(title, text2jsonWithCurrentPatients))

  //return await getDataJSON('国内事例における都道府県別の患者報告数', text2jsonWithoutCruise)
}

const test = async function() {
  const fn = "data/covid19japan/2020-03-19"
  const txt = await pdf2text.pdf2text(fn + ".pdf")
  const json = text2jsonWithInspections(txt, "url", "2020-03-19")
  console.log(json)
}
const test2 = async function() {
  const fn = "data/covid19japan/000618476.pdf" // 000610352.pdf"
  const txt = await pdf2text.pdf2text(fn + ".pdf")
  const json = text2jsonWithCurrentPatients(txt, "url", "2020-03-19")
  console.log(json)
}
const makeCovid19Japan = async function() {  
  const html = await (await fetch(URL)).text()
  console.log(html)
  const title = '国内事例における都道府県別の患者報告数'
  const res = parseLink(html, title)
  console.log(res)

  const path = '../data/covid19japan/'
  const url = res.url
  const fn = url.substring(url.lastIndexOf('/') + 1)
  const pdf = await (await fetch(url)).arrayBuffer()
	fs.writeFileSync(fn, new Buffer.from(pdf), 'binary')
  const txt = await pdf2text.pdf2text(fn)
  const json = text2jsonWithCurrentPatients(txt, url, res.dt)
  console.log(json)
  const sjson = JSON.stringify(json)
  fs.writeFileSync(fn + ".json", sjson)
  fs.writeFileSync('../data/covid19japan.json', sjson)
}
const makeCovid19JapanList = function() {
  const path = '../data/covid19japan/'
  const list = fs.readdirSync(path)
  const fndest = '../data/covid19japan-all.json'
  
  //console.log(list)
  // rename
  /*
  for (const f of list) {
    console.log(f)
    if (f.endsWith('.pdf.pdf')) {
      fs.renameSync(path + f, path + f.substring(0, f.length - 4))
    }
  }
  */
  const all = []
  for (const f of list) {
    if (f.endsWith('.pdf.json')) {
      const data = JSON.parse(fs.readFileSync(path + f, 'utf-8'))
      console.log(f, data.lastUpdate)
      data.srcurl_pdf_archived = 'https://www.stopcovid19.jp/data/covid19japan/' + f.substring(0, f.length - 4)
      all.push(data)
    }
  }
  const pi = function(d) {
    return parseInt(d.replace(/-/g, ""))
  }
  all.sort(function(a, b) {
    return pi(a.lastUpdate) - pi(b.lastUpdate)
  })
  console.log(all)
  const sjson = JSON.stringify(all)
  fs.writeFileSync(fndest, sjson)
}
const main = async function() {
  // await makeCovid19Japan()
  makeCovid19JapanList()
}
if (require.main === module) {
  main()
} else {
  startUpdate()
}

exports.getCovid19DataJSON = getCovid19DataJSON
exports.getCovid19DataSummaryForIchigoJam = getCovid19DataSummaryForIchigoJam
