const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')

const CACHE_TIME = 10 * 1000 // 10min
const PATH = 'data/covid19fukui/'
const URL = 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/opendata/list_3_d/fil/covid19_patients.csv'

const date2s = function(datetime) {
  return datetime.replace(/:|-/g, "")
}
const checkJSON = function(json) {
  const names = {}
  for (const d of json) {
    for (const n in d) {
      if (names[n] == null) {
        names[n] = []
      }
      const val = d[n]
      if (names[n].indexOf(val) == -1) {
        names[n].push(val)
      }
    }
  }
  console.log(names)
}
const makeData = async function() {
  const [ scsv, lastUpdate ] = await util.fetchTextWithLastModified(URL, 'ShiftJIS')
  //console.log(scsv)
  const csv = util.decodeCSV(scsv)
  const json = util.csv2json(csv)
  //console.log(json)

  //checkJSON(json)
  // '患者_状態': [ '', '重篤', '死亡', '軽症', '重症' ],
  // '患者_退院済フラグ': [ '1', '0' ],

  let nexits = 0
  let ndeaths = 0
  for (const d of json) {
    if (d['患者_状態'] == '死亡') {
      ndeaths++
    } else if (d['患者_退院済フラグ'] == 1) {
      nexits++
    }
  }
  let patientscurrent = json.length - ndeaths - nexits
  /*
  const area = []
  const PREF = util.JAPAN_PREF_EN
  for (let i = 0; i < PREF.length; i++) {
    if (PREF
  }
  */
  const res = { name: 'Fukui', npatients: json.length, ncurrentpatients: patientscurrent, nexits: nexits, ndeaths: ndeaths, src_url: URL, lastUpdate: lastUpdate }
  res.url_opendata = 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/opendata/list_3.html'
  //console.log(res)
  fs.writeFileSync('../data/covid19fukui/' + date2s(res.lastUpdate) + ".csv", scsv)
  fs.writeFileSync('../data/covid19fukui/_latest.csv', scsv)
  return res
}
const makeDataFromJSON = async function() {
  const url = 'https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/master/data/data.json'
  
  //const [ sjson, lastUpdate ] = await util.fetchTextWithLastModified(url)
  const sjson = await util.fetchText(url)
  const json = JSON.parse(sjson)

  const res = { name: 'Tokyo' }
  res.npatients = json.main_summary.children[0].value
	res.ncurrentpatients = json.main_summary.children[0].children[0].value
	res.nexits = json.main_summary.children[0].children[1].value
	res.ndeaths = json.main_summary.children[0].children[2].value
  res.lastUpdate = json.lastUpdate.replace(/\//g, '-').replace(/ /g, 'T')
  res.src_url = url
  res.url_opendata = 'https://catalog.data.metro.tokyo.lg.jp/organization/t000010?q=%E6%96%B0%E5%9E%8B%E3%82%B3%E3%83%AD%E3%83%8A&sort=score+desc%2C+metadata_modified+desc'
  //console.log(res)

  fs.writeFileSync('../data/covid19tokyo/' + date2s(res.lastUpdate) + ".json", sjson)
  fs.writeFileSync('../data/covid19tokyo/_latest.json', sjson)
  return res
}

const test = async function() {
  const url = URL
  const res = await fetch(url)
  console.log(res.headers) // no last-modified
}
const main = async function() {
  const data = []
  data.push(await makeData())
  data.push(await makeDataFromJSON())
  console.log(data)
  util.writeCSV('../data/covid19japan-fast', util.json2csv(data))
}
if (require.main === module) {
  main()
} else {
}
