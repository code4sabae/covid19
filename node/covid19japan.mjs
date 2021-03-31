import fs from 'fs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import util from './util.mjs'
import pdf2text from './pdf2text.mjs'
//import pdf2text from './pdf2text.js'

import { ocrNums } from "./covid19japan_ocr.mjs";

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
  let res = null
  dom('a').each((idx, ele) => {
    const text = dom(ele).text()
    if (res == null && text && text.indexOf(title) >= 0) {
      res = {}
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
const getAreas = function () {
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

const text2jsonWithCurrentPatients = function (txt, url, dt) {
  const parseDate = function (s) {
    const fix0 = util.fix0
    s = util.toHalf(s)
    // ３月18日(水)
    // 3月18日(水) 対前日比
    // let num = s.match(/(\d+)月(\d+)日\(.\) .+/)
    const num = s.match(/(\d+)月(\d+)日/)
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
  // res.ninspections = 0
  console.log(ss)
  // const linestart = 2 // ss[0].indexOf('関数') >= 0 ? 2 : 1
  const linestart = ss[0].indexOf('関数') >= 0 ? 2 : 1
  console.log(ss, linestart)
  const dt2 = parseDate(ss[linestart - 1])
  console.log(dt2)
  
  if (dt2 !== '--') {
    res.lastUpdate = dt2
  } else {
    for (let i = 46; i < ss.length; i++) {
      const dt3 = parseDate(ss[46])
      if (dt3 != '--') {
        res.lastUpdate = dt3
        break
      }
    }
  }
  if (res.lastUpdate == '--') {
    console.log('cant parse lastUpdate!!')
    process.exit(1)
  }

  const area = getAreas()
  for (let i = 0; i < area.length; i++) {
    const a = area[i]
    a.npatients = 0
    a.ncurrentpatients = 0
    a.nexits = 0
    a.ndeaths = 0
    //a.patientsdif = 0
    //a.patientsratio = 0
  }
  const parsei = function (s) {
    const n = parseInt(s)
    if (n !== s) {
      return 0
    }
    return n
  }
  const parseIntWithComma = function (s) {
    console.log(s)
    s = s.replace(/,/g, '')
    const n = parseInt(s)
    if (n.toString() !== s) { return 0 }
    return n
  }
  console.log(ss)
  for (let i = linestart; ; i++) {
    const ss2 = ss[i].split(' ')
    // if (ss2.length < 10) { continue }
    if (ss2.length < 9) { continue }
    console.log(ss2)
    let nstart = parseInt(ss2[0]) === ss2[0] ? 1 : 0
    const pref = ss2[nstart]
    if (pref.indexOf(ss2[nstart + 1]) >= 0) {
      nstart++
    }
    const nskip = ss2[nstart + 5].indexOf('%') >= 0 ? 1 : 0
    //console.log(nskip, ss2[nstart + 5])
    if (pref == '総計') {
      const a = res
      a.npatients = parseIntWithComma(ss2[nstart + 1])
      a.ncurrentpatients = parseIntWithComma(ss2[nstart + nskip + 3])
      a.nexits = parseIntWithComma(ss2[nstart + nskip + 5])
      a.ndeaths = parseIntWithComma(ss2[nstart + nskip + 7])
      a.description = ss[i + 1]
      break
    } else if (pref == 'その他') {
      continue // とりあえず、その他は含めない
    }
    const npref = PREF.indexOf(pref)
    if (npref == -1)
      return null
    const a = area[npref]
    a.npatients = parseIntWithComma(ss2[nstart + 1])
    a.ncurrentpatients = parseIntWithComma(ss2[nstart + nskip + 3])
    a.nexits = parseIntWithComma(ss2[nstart + nskip + 5])
    a.ndeaths = parseIntWithComma(ss2[nstart + nskip + 7])
    //console.log(pref, a)
    //a.patientsdif = parseInt(ss2[nstart + 2])
    //if (nskip)
    //  a.patientsratio = parseFloat(ss2[nstart + 3])
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
const makeCovid19Japan = async function () {
  const html = await (await fetch(URL)).text()
  console.log(html)
  const title = '国内事例における都道府県別の患者報告数'
  // const title2 = '国内における都道府県別のPCR検査陽性者数'
  const title2 = '内における都道府県別のPCR検査陽性者数'
  let res = parseLink(html, title)
  if (!res) {
    res = parseLink(html, title2)
  }
  console.log(res)
  
  const url = res.url
  const fn = url.substring(url.lastIndexOf('/') + 1)
  const path = '../data/covid19japan/'
  const pdf = await (await fetch(url)).arrayBuffer()
  fs.writeFileSync(path + fn, new Buffer.from(pdf), 'binary')
  await makeCovid19JapanByPDF(url, path + fn)
}
const makeCovid19JapanByPDF = async function (url, fn) {
  const txt = await pdf2text.pdf2text(fn)
  const json = text2jsonWithCurrentPatients(txt, url) // , res.dt)
  console.log(json)
  const sjson = JSON.stringify(json)
  fs.writeFileSync(fn + '.json', sjson)
  fs.writeFileSync('../data/covid19japan.json', sjson)
  writeCSVbyJSON('../data/covid19japan.csv', json.area)
}
const makeCovid19JapanList = function () {
  const path = '../data/covid19japan/'
  const flist = fs.readdirSync(path)
  const fndest = '../data/covid19japan-all.json'
  const fndestcsv = '../data/covid19japan-all.csv'
  const baseurl = 'https://www.stopcovid19.jp/data/covid19japan/'

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
  const list = []
  for (const f of flist) {
    if (f.endsWith('.pdf.json')) {
      const data = JSON.parse(fs.readFileSync(path + f, 'utf-8'))
      console.log(f, data.lastUpdate)
      const fbase = f.substring(0, f.length - 5)
      data.srcurl_pdf_archived = baseurl + fbase
      all.push(data)
      const fncsv = data.lastUpdate + '.csv'
      writeCSVbyJSON(path + fncsv, data.area)
      console.log(data.area)
      list.push({
        lastUpdate: data.lastUpdate,
        description: data.description,
        srcurl_web: data.srcurl_web,
        srcurl_pdf: data.srcurl_pdf,
        srcurl_pdf_archived: data.srcurl_pdf_archived,
        url_csv: baseurl + fncsv,
        url_json: data.srcurl_pdf_archived + '.json'
      })
    }
  }
  const pi = function (d) {
    return parseInt(d.replace(/-/g, ''))
  }
  const pisort = function (a, b) {
    return pi(a.lastUpdate) - pi(b.lastUpdate)
  }
  all.sort(pisort)
  list.sort(pisort)
  console.log(all)
  const sjson = JSON.stringify(all)
  fs.writeFileSync(fndest, sjson)
  console.log(list[list.length - 1])
  writeCSVbyJSON(fndestcsv, list)
}
const writeCSVbyJSON = function (fn, json) {
  const scsv = util.encodeCSV(util.json2csv(json))
  fs.writeFileSync(fn, util.addBOM(scsv))
}
const makeCovid19JapanPrefs = () => {
  const path = '../data/covid19japan/';
  const dstpath = '../data/covid19japan/pref/';
  const flist = fs.readdirSync(path)

  flist.sort();
  const pref = {};
  for (const f of flist) {
    if (!f.endsWith(".csv") || f.endsWith(".pdf.csv")) {
      continue;
    }
    const data = util.csv2json(util.decodeCSV(util.removeBOM(fs.readFileSync(path + f, "utf-8"))));
    const date = f.substring(0, f.length - 4)
    //console.log(date);
    for (const p of data) {
      //console.log(p);
      const name = p.name;
      let pp = pref[name];
      if (!pp) {
        pp = pref[name] = [];
      }
      const p2 = { date };
      delete p.name;
      delete p.name_jp;
      Object.assign(p2, p);
      pp.push(p2);
    }
  }
  for (const p in pref) {
    // console.log(pref[p]);
    const data = util.addBOM(util.encodeCSV(util.json2csv(pref[p])));
    const dstname = dstpath + p + ".csv";
    fs.writeFileSync(dstname, data);
    console.log(dstname, p, data.length);
  }
};
const mainV1 = async function () {
  // await makeCovid19JapanByPDF('https://www.mhlw.go.jp/content/10900000/000622869.pdf', '../data/covid19japan/000622869.pdf')

  const url = 'https://www.mhlw.go.jp/content/10906000/000620403.pdf'
  const fn = '../data/covid19japan/000620403.pdf'
  const txt = await pdf2text.pdf2text(fn)
  const json = text2jsonWithCurrentPatients(txt, url) // , res.dt)
  console.log(json)
  const sjson = JSON.stringify(json)
  fs.writeFileSync(fn + '.json', sjson)

  // version 1
  // await makeCovid19Japan()
  //makeCovid19JapanList()
}
//
const text2csvWithCurrentPatients2 = function (txt) {
  const ss = txt.split('\n')
  const parseIntWithComma = function (s) {
    s = s.replace(/,/g, '')
    const n = parseInt(s)
    if (n.toString() !== s) { return s }
    return n
  }
  console.log(ss)
  const list = []
  const rowoff = ss.map(s => s.charAt(0)).indexOf('北')
  console.log(rowoff)
  list.push(['都道府県名', 'PCR検査陽性者', 'PCR検査実施人数', '入院治療等を要する者 (人)', 'うち重症', '退院又は療養解除となった者の数 (人)', '死亡(累積) (人)', '確認中(人)'])
  for (let i = 0; i < 47; i++) {
    const ss2a = ss[rowoff + i].split(' ')
    let pref = ss2a[0] + ss2a[1]
    const nstart = pref === '北海' || pref === '神奈' || pref === '鹿児' || pref === '⿅児' || pref === '和歌' ? 3 : 2
    if (nstart === 3) { pref += ss2a[2] }
    // const pref2 = PREF.find(p => p.startsWith(pref))
    const pref2 = PREF[i]
    const ss2 = [pref2]
    for (let i = nstart; i < ss2a.length; i++) {
      const s3 = ss2a[i]
      if (!s3.startsWith('※')) { ss2.push(parseIntWithComma(s3)) }
    }
    list.push(ss2)
  }
  // console.log(list)
  return list
}
const makeCurrentPatientsJSON = function (txt, csv, url, urlweb) {
  const parseDate = function (s) {
    const fix0 = util.fix0
    s = util.toHalf(s)
    s = s.replace(/⽉/g, "月"); // 令和2年7⽉2⽇ へんな漢字
    s = s.replace(/⽇/g, "日");
    {
      const num = s.match(/令和(\d+)年(\d+)月(\d+)日/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return (y + 2018) + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    {
      const num = s.match(/(2\d+)年(\d+)月(\d+)日/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return y + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    {
      const num = s.match(/(20\d+)\/(\d+)\/(\d+)/)
      if (num) {
        const y = parseInt(num[1])
        const m = parseInt(num[2])
        const d = parseInt(num[3])
        return y + '-' + fix0(m, 2) + '-' + fix0(d, 2)
      }
    }
    console.log(s, "can't parse date!!");
    return '--'
  }

  const res = {}
  res.srcurl_pdf = url
  res.srcurl_web = urlweb
  res.description = '各都道府県の検査陽性者の状況(空港検疫、チャーター便案件を除く国内事例)'
  res.lastUpdate = parseDate(txt)
  res.npatients = 0
  res.nexits = 0
  res.ndeaths = 0
  res.ncurrentpatients = 0
  res.ninspections = 0

  const pi = s => parseInt(s) !== s ? 0 : parseInt(s)
  const data = util.csv2json(csv)
  const area = getAreas()
  for (let i = 0; i < area.length; i++) {
    const a = area[i]
    const c = data[i]
    console.log(c)
    a.npatients = c['PCR検査陽性者']
    a.ncurrentpatients = 0
    a.nexits = c['退院又は療養解除となった者の数 (人)'] || c['退院又は療養解除となった者の数']
    a.ndeaths = c['死亡(累積) (人)'] || c['死亡']
    a.nheavycurrentpatients = c['うち重症']
    a.nunknowns = c['確認中(人)'] || c['確認中']
    a.ncurrentpatients = a.npatients - a.nexits - pi(a.ndeaths)
    const nc = c['入院治療等を要する者']
    if (a.ncurrentpatients !== nc) {
      console.log('unmatch', a)
      a.ncurrentpatients = nc
    }
    a.ninspections = c['PCR検査実施人数']

    res.npatients += a.npatients
    res.nexits += a.nexits
    res.ndeaths += pi(a.ndeaths)
    res.nheavycurrentpatients += pi(a.nheavycurrentpatients)
    res.nunknowns += pi(a.nunknowns)
    res.ncurrentpatients += pi(a.ncurrentpatients)
    res.ninspections += pi(a.ninspections)
    
    a["ISO3155-2"] = "JP-" + util.fix0(i + 1, 2);
  }
  res.area = area
  return res
}
const parseURLCovid19Latest = async function (urlweb) {
  const html = await (await fetch(urlweb)).text();
  // console.log(html)
  const title = "新型コロナウイルス感染症の現在の状況と厚生労働省の対応について";
  let url = parseLink(html, title);
  return url.url;
}
const parseURLCovid19 = async function (urlweb) {
  const html = await (await fetch(urlweb)).text()
  // console.log(html)
  const title = '各都道府県の検査陽性者の状況'
  const title2 = '国内における都道府県別のPCR検査陽性者数'
  let url = parseLink(html, title)
  if (!url) {
    url = parseLink(html, title2)
  }
  return url.url
}
const pi = (s) => {
  const n = parseInt(s);
  if (isNaN(n)) {
    console.log(n);
    return s;
  }
  return n;
};

const bklist = `https://www.mhlw.go.jp/content/10906000/000628667.pdf
https://www.mhlw.go.jp/content/10906000/000628697.pdf
https://www.mhlw.go.jp/content/10906000/000628917.pdf
https://www.mhlw.go.jp/content/10900000/000629701.pdf
https://www.mhlw.go.jp/content/10906000/000630162.pdf
https://www.mhlw.go.jp/content/10906000/000630627.pdf`
const mainV2 = async function () {
  /*
  const url = 'https://www.mhlw.go.jp/content/10906000/000628667.pdf'
  const urlweb = 'https://www.mhlw.go.jp/stf/newpage_11229.html'
  */
 /*
  const url = 'https://www.mhlw.go.jp/content/10906000/000628697.pdf'
  const urlweb = 'https://www.mhlw.go.jp/stf/newpage_11232.html'
  */
  // const urlweb = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000164708_00001.html' // 感染症について
  // 報道
  const now = new Date();
//  const urlweb7 = "https://www.mhlw.go.jp/stf/houdou/houdou_list_202007.html";
//  const urlweb7 = "https://www.mhlw.go.jp/stf/houdou/houdou_list_202012.html";
  const urlweb7 = `https://www.mhlw.go.jp/stf/houdou/houdou_list_${now.getFullYear()}${util.fix0(now.getMonth() + 1, 2)}.html`;
  //const urlweb7 = `https://www.mhlw.go.jp/stf/houdou/houdou_list_${now.getFullYear()}${util.fix0(now.getMonth(), 2)}.html`;
  console.log(urlweb7);
  //process.exit(0);
  const urlweb = await parseURLCovid19Latest(urlweb7)
  console.log(urlweb)
  //process.exit(0);


  //const urlweb = "https://www.mhlw.go.jp/stf/newpage_12236.html";
  // const urlweb = 'https://www.mhlw.go.jp/stf/newpage_11567.html'
  // const urlweb = 'https://www.mhlw.go.jp/stf/newpage_11587.html'
  //const urlweb = "https://www.mhlw.go.jp/stf/newpage_15561.html"; // 2020/12/17
  const path = '../data/covid19japan/'
  let fn = null // '000630627.pdf'
  //let fn = "000646194.pdf";
  /*
  for (const b of bklist.split('\n')) {
  let url = b.trim()
  let fn = url.substring(url.lastIndexOf('/') + 1)
  console.log(fn)
  */

  // const fetchdata = false
  let url = null
  const fetchdata = true
  if (fetchdata) {
    url = await parseURLCovid19(urlweb)
    console.log(url)
    if (!url) {
      console.log('not found url', url)
      return
    }
    fn = url.substring(url.lastIndexOf('/') + 1)
    const pdf = await (await fetch(url)).arrayBuffer()
    fs.writeFileSync(path + fn, new Buffer.from(pdf), 'binary')
  }

  const pdfToTxt = async (fn) => {
    try {
      return await pdf2text.pdf2text(fn, 2)
    } catch (e) {
      return await pdf2text.pdf2text(fn)
    }
  };
  const txt = await pdfToTxt(path + fn);
  console.log("txt", txt, txt.length)
  let csv = null;
  if (txt.length === 0) {
    console.log("OCR mode! must set lastUpdate");
    Deno.exit(0);
    const corecsv = await ocrNums(path + fn);
    csv = util.decodeCSV(util.removeBOM(fs.readFileSync("../data/covid19japan/000674737.pdf.csv", "utf-8")));
    console.log(csv.length, corecsv.length);
    for (let i = 0; i < corecsv.length - 2; i++) {
      for (let j = 0; j < csv[i + 1].length - 1; j++) {
        csv[i + 1][j + 1] = pi(corecsv[i][j]);
      }
    }
  } else {
    csv = text2csvWithCurrentPatients2(txt)
  }
  console.log(csv)
 
  fs.writeFileSync(path + fn + '.csv', util.addBOM(util.encodeCSV(csv)), 'utf-8')

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb)
  const scsv = util.addBOM(util.encodeCSV(util.json2csv(json.area)))
  console.log(path + json.lastUpdate + '.csv')
  fs.writeFileSync(path + json.lastUpdate + '.csv', scsv, 'utf-8')
  fs.writeFileSync(path + fn + '.json', JSON.stringify(json), 'utf-8')

  fs.writeFileSync(path + '../covid19japan.csv', scsv, 'utf-8')
  fs.writeFileSync(path + '../covid19japan.json', JSON.stringify(json), 'utf-8')

  // }
};
const pdf2csv = async (path, fn) => {
  const pdfToTxt = async (fn) => {
    try {
      return await pdf2text.pdf2text(fn, 2)
    } catch (e) {
      return await pdf2text.pdf2text(fn)
    }
  };
  const txt = await pdfToTxt(path + fn);
  console.log("txt", txt, txt.length)
  let csv = null;
  if (txt.length === 0) {
    console.log("OCR mode! must set lastUpdate");
    Deno.exit(0);
    const corecsv = await ocrNums(path + fn);
    csv = util.decodeCSV(util.removeBOM(fs.readFileSync("../data/covid19japan/000674737.pdf.csv", "utf-8")));
    console.log(csv.length, corecsv.length);
    for (let i = 0; i < corecsv.length - 2; i++) {
      for (let j = 0; j < csv[i + 1].length - 1; j++) {
        csv[i + 1][j + 1] = pi(corecsv[i][j]);
      }
    }
  } else {
    csv = text2csvWithCurrentPatients2(txt)
  }
  console.log(csv)
 
  fs.writeFileSync(path + fn + '.csv', util.addBOM(util.encodeCSV(csv)), 'utf-8')
};
const mainV2_hand = async () => {
  const path = '../data/covid19japan/';
  //17
  
  const fn = "000706505.pdf";
  const txt = "2020/12/17 24時時点";
  const urlweb = "https://www.mhlw.go.jp/stf/newpage_15597.html";
  
  //16
  /*
  const fn = "000708650.pdf";
  const txt = "2020/12/16 24時時点";
  const urlweb = "https://www.mhlw.go.jp/stf/newpage_15561.html";
*/
  const url = "https://www.mhlw.go.jp/content/10906000/" + fn;
  await pdf2csv(path, fn);
  const csv = util.decodeCSV(util.removeBOM(fs.readFileSync(path + fn + '.csv', "utf-8")));

  for (let i = 0; i < csv.length; i++) {
    for (let j = 0; j < csv[i].length; j++) {
      csv[i][j] = pi(csv[i][j]);
    }
  }

  const json = makeCurrentPatientsJSON(txt, csv, url, urlweb)
  const scsv = util.addBOM(util.encodeCSV(util.json2csv(json.area)))
  console.log(path + json.lastUpdate + '.csv')
  fs.writeFileSync(path + json.lastUpdate + '.csv', scsv, 'utf-8')
  fs.writeFileSync(path + fn + '.json', JSON.stringify(json), 'utf-8')

  fs.writeFileSync(path + '../covid19japan.csv', scsv, 'utf-8')
  fs.writeFileSync(path + '../covid19japan.json', JSON.stringify(json), 'utf-8')
};

const main = async () => {
  // await mainV1() // old
  //await mainV2_hand();
  
  await mainV2();
  makeCovid19JapanList();
  makeCovid19JapanPrefs();
}
if (process.argv[1].endsWith('/covid19japan.mjs')) {
  main()
}

// exports.getCovid19DataJSON = getCovid19DataJSON
// exports.getCovid19DataSummaryForIchigoJam = getCovid19DataSummaryForIchigoJam
