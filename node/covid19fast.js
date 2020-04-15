const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')

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
  fs.writeFileSync('../data/covid19tokyo/latest.json', sjson)
  return res
}

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
const makeData = async function(pref, url, url_opendata) {
  //const [ scsv, lastUpdate ] = await util.fetchTextWithLastModified(url, 'ShiftJIS')
  let [ scsv, lastUpdate ] = await util.fetchTextWithLastModified(url)
  //console.log(scsv, lastUpdate) // 熊本県 LastModified なし
  console.log('lastUpdate', lastUpdate)

  //console.log(scsv)
  const csv = util.decodeCSV(scsv)
  //csv.splice(0, 1)
  const json = util.csv2json(csv)
  //console.log(json)

  checkJSON(json)
  // '患者_状態': [ '', '重篤', '死亡', '軽症', '重症' ],
  // '患者_退院済フラグ': [ '1', '0' ],

  let nexits = 0
  let ndeaths = 0
  for (const d of json) {
    if (d['患者_状態'] == '死亡') {
      ndeaths++
    } else if (d['患者_退院済フラグ'] == 1 || d['退院済フラグ'] == 1) {
      nexits++
    }
  }
  let patientscurrent = json.length - ndeaths - nexits

  if (!lastUpdate) {
    lastUpdate = json[json.length - 1]['公表_年月日']
    console.log('lastUpdate', lastUpdate)
  }
  /*
  const area = []
  const PREF = util.JAPAN_PREF_EN
  for (let i = 0; i < PREF.length; i++) {
    if (PREF
  }
  */
  const res = { name: pref, npatients: json.length, ncurrentpatients: patientscurrent, nexits: nexits, ndeaths: ndeaths, src_url: url, lastUpdate: lastUpdate }
  res.url_opendata = url_opendata
  //console.log(res)
  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".csv", util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  return res
}
const makeDataFromAlt = async function(pref, url, url_opendata) {
  let [ scsv, lastUpdate ] = await util.fetchTextWithLastModified(url)
  //console.log(scsv, lastUpdate) // 熊本県 LastModified なし
  console.log('lastUpdate', lastUpdate)

  //console.log(scsv)
  const csv = util.decodeCSV(scsv)
  //csv.splice(0, 1)
  const json = util.csv2json(csv)
  //console.log(json)

  checkJSON(json)

  console.log(json)
  const latest = json[json.length - 1]
  
  const res = { name: pref }
  res.npatients = parseInt(latest['陽性累計'])
  res.ncurrentpatients = parseInt(latest['患者累計'])
  res.nexits = parseInt(latest['治療終了累計'])
  res.ndeaths = parseInt(latest['死亡累計'])
  res.lastUpdate = lastUpdate.replace(/\//g, '-').replace(/ /g, 'T')
  res.src_url = url
  res.url_opendata = url_opendata

  console.log(res)
  
  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".csv", util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  return res
}

const test = async function() {
  const url = URL
  const res = await fetch(url)
  console.log(res.headers) // no last-modified
}
/*
const list = [
  { pref: "Fukui", url: 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/covid-19_d/fil/covid19_patients.csv', url_opendata: 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/covid-19.html' },
  { pref: "Fukuoka", url: 'https://ckan.open-governmentdata.org/dataset/8a9688c2-7b9f-4347-ad6e-de3b339ef740/resource/c27769a2-8634-47aa-9714-7e21c4038dd4/download/400009_pref_fukuoka_covid19_patients.csv', url_opendata: 'https://ckan.open-governmentdata.org/dataset/401000_pref_fukuoka_covid19_patients' },
  { pref: "Kumamoto", url: '', url_opendata: '' },
]
*/

const fetchCSVtoJSON = async url => util.csv2json(util.decodeCSV(await (await fetch(url)).text()))

const main = async function() {
  //const data = fs.readFileSync('../data/covid19fukui/20200409T151739.csv', 'utf-8')
  //fs.writeFileSync('../data/covid19fukui/20200409T151739-2.csv', util.addBOM(data))

  const url_official = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-OrSJv81VIWWrQ0W6vndw8HEjtztkWY39E97v-oFR0tYF0chwV-duQUkKIOSJPj57IbVuqGZO-C_K/pub?gid=0&single=true&output=csv'
  const list = await fetchCSVtoJSON(url_official)
  
  const data = []
  for (const d of list) {
    if (d.data_canuse == 1) {
      console.log(d.data_canuse, d.pref)
      if (d.data_standard == 1) {
      //if (d.pref == 'Kumamoto') {
        data.push(await makeData(d.pref, d.url_patients_csv, d.url_opendata))
      } else if (d.data_alt == 1) {
        const d2 = await makeDataFromAlt(d.pref, d.url_patients_alt, d.url_opendata)
        console.log(d2)
        data.push(d2)
      }
    }
  }
  data.push(await makeDataFromJSON())
  console.log(data)
  util.writeCSV('../data/covid19japan-fast', util.json2csv(data))

  //const data2 = util.readCSV('../data/covid19japan-fast')
  //console.log(data2)
}
if (require.main === module) {
  main()
} else {
}
