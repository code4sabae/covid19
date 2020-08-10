import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'

const xlsx2csv = function(sheet) {
  const res = []
  const rect = sheet['!ref'].match(/(\D+)(\d+):(\D+)(\d+)/)
  const colst = rect[1].charCodeAt(0) - 'A'.charCodeAt(0)
  const rowst = parseInt(rect[2])
  const coled = rect[3].charCodeAt(0) - 'A'.charCodeAt(0)
  const rowed = parseInt(rect[4])
  for (let i = 0; i < rowed - rowst + 1; i++) {
    const row = i + rowst
    const line = []
    for (let j = 0; j < coled - colst + 1; j++) {
      const col = String.fromCharCode('A'.charCodeAt(0) + j + colst)
      const v = sheet[col + row].w // v
      line.push(v)
    }
    res.push(line)
  }
  return res
}

const parseDateTime = function(s) {
  const n = s.match(/(\d+)\/(\d+)\/(\d+) (\d+)時/)
  if (!n)
    throw "can't parseDateTime " + s
  const d = new Date()
  //console.log(n)
  d.setFullYear(parseInt(n[3]) + 2000)
  d.setMonth(parseInt(n[1]) - 1)
  d.setDate(parseInt(n[2]))
  d.setHours(parseInt(n[4]))
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  //console.log(util.formatYMDHMS(d))
  return d
}
const date2s = function(datetime) {
  return datetime.replace(/:|-/g, "")
}

const parseJSON = function(pref, json, url, url_opendata) {
  //util.checkJSON(json)
  console.log(json)

  const res = { name: pref }
  const latest = json[json.length - 1]
  const lastUpdate = latest['発表年月日'] + ' ' + latest['発表時間']
  res.npatients = parseInt(latest['陽性者数（累計）'])
  res.ncurrentpatients = parseInt(latest['入院中（合計）'])
  res.nseriouspatients = parseInt(latest['入院中（重症）'])
  res.nexits = parseInt(latest['退院（累計）'])
  res.ndeaths = parseInt(latest['死亡（累計）'])
  res.lastUpdate = util.formatYMDHMS(parseDateTime(lastUpdate))
  console.log(lastUpdate, res.lastUpdate)

  console.log(res)
  return res
}

const fetchAndSave = async function(url) {
  const data = await (await fetch(url)).arrayBuffer()
  console.log(data)
  const temp = new Date().getTime() + ".xlsx"
  const fn = 'temp/' + temp
  fs.writeFileSync(fn, new Buffer.from(data), 'binary')
  return fn
}
const getSheetXlsx = async function(url) {
  const fn = await fetchAndSave(url)
  //const workbook = xlsx.readFile('temp/yousei.xlsx')
  const workbook = xlsx.readFile(fn)
  //fs.unlinkSync(fn)

  //console.log(workbook)
  for (const shname in workbook.Sheets) {
    const sh = workbook.Sheets[shname]
    return sh
  }
  return null
}

const main = async function() {
  const pref = 'Hyogo'
  const url = 'https://web.pref.hyogo.lg.jp/kk03/documents/yousei.xlsx'
  const url_opendata = 'http://open-data.pref.hyogo.lg.jp/?page_id=141'

  const sh = await getSheetXlsx(url)
  const csv = xlsx2csv(sh)
  const json = util.csv2json(csv, true)
  const res = parseJSON(pref, json)
  res.src_url = url
  res.url_opendata = url_opendata

  const lpref = pref.toLowerCase()
  //const scsv = util.encodeCSV(csv)
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".csv", util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".json", JSON.stringify(res))
  //util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))

  /*
  const lastUpadte = sh.F2.v
  const getLatest = function(num) {
    let last = null
    for (const name in sh) {
      if (name.endsWith(num)) {
        last = name
      }
    }
    if (last == null)
      return null
    return sh[last].v
  }
  const ncurrentpatients = getLatest(4)
  const nexits = getLatest(7)
  const ndeaths = getLatest(10)
  const npatients = ncurrentpatients + nexits + ndeaths
  console.log(npatients, nexits, ndeaths, ncurrentpatients)
  */
}
main()
