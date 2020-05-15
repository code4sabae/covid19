import fs from 'fs'
import fetch from 'node-fetch'
import util from './util.mjs'
import cmd from './cmd.mjs'

const makeDataFromDataJSON = async function(pref, url_datajson, url_opendata) {
  const url = url_datajson // 'https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/master/data/data.json'
  
  //const [ sjson, lastUpdate ] = await util.fetchTextWithLastModified(url)
  const sjson = await util.fetchText(url)
  const json = JSON.parse(sjson)

  const res = { name: pref }
  res.npatients = json.main_summary.children[0].value
  const ch = json.main_summary.children[0].children
  const get = function(name) {
    for (const d of ch) {
      if (d.attr == name) {
        return d.value
      }
    }
    console.log("error! not found", name)
    console.log(ch)
    process.exit(1)
  }
  res.nexits = get('退院')
  res.ndeaths = get('死亡')
  res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
  res.lastUpdate = json.lastUpdate.replace(/\//g, '-').replace(/ /g, 'T')
  res.src_url = url
  res.url_opendata = url_opendata
  //console.log(res)

  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".json", sjson)
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', sjson)
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
  console.log(url)
  let [ scsv, lastUpdate ] = await util.fetchTextWithLastModified(url)
  //console.log(scsv, lastUpdate) // 熊本県 LastModified なし
  console.log('lastUpdate', lastUpdate)

  //console.log(scsv)
  const csv = util.decodeCSV(scsv)

  // for 長野
  const firstline = csv[0][0]
  if (firstline.indexOf('長野県における新型コロナウイルス感染症の発生状況') >= 0) {
    csv.splice(0, 2)
  } else if (firstline.indexOf('陽性患者属性') >= 0) {
    csv.splice(0, 1)
  }

  //csv.splice(0, 1)
  const json = util.csv2json(csv)
  //console.log(json)

  checkJSON(json)
  // '患者_状態': [ '', '重篤', '死亡', '軽症', '重症' ],
  // '患者_退院済フラグ': [ '1', '0' ],

  let nexits = 0
  let ndeaths = 0
  console.log(json)
  for (const d of json) {
    if (d['患者_状態'] == '死亡' || d['状態'] == '死亡' || d['患者_死亡フラグ'] == 1 || d['患者状況'] == '死亡') {
      ndeaths++
    } else if (d['患者_退院済フラグ'] == 1 || d['退院済フラグ'] == 1 || d['患者状況'] == '退院') {
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
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
  return res
}
const makeDataFromAlt = async function(pref, url, url_opendata) {
  const [ scsv, lastUpdateFetched ] = await util.fetchTextWithLastModified(url)
  //console.log(scsv, lastUpdate) // 熊本県 LastModified なし
  console.log('lastUpdateFetched', lastUpdateFetched)

  //console.log(scsv)
  const csv = util.decodeCSV(scsv)
  //csv.splice(0, 1)
  const json = util.csv2json(csv)
  //console.log(json)

  checkJSON(json)
  console.log(json)

  const res = { name: pref }
  const latest = json[json.length - 1]
  let lastUpdate = null
  if (latest['完了_年月日']) {
    res.npatients = 0
    res.nexits = 0
    res.ndeaths = 0
    for (const d of json) {
      res.npatients += parseInt(d['陽性確認_件数'])
      res.nexits += parseInt(d['陰性確認_件数'])
      res.ndeaths += parseInt(d['死亡確認_件数'])
      res.lastUpdate = d['完了_年月日'].replace(/\//g, '-').replace(/ /g, 'T')
    }
    res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
  } else {
    lastUpdate = latest['公表_年月日'] || latest['受付_年月日'] || lastUpdate
    res.npatients = parseInt(latest['陽性累計'] || latest['陽性患者数累計'])
    res.ncurrentpatients = parseInt(latest['患者累計'] || latest['入院者数累計'] || latest['入院'])
    res.nexits = parseInt(latest['治療終了累計'] || latest['退院者数累計'] || latest['退院'])
    res.ndeaths = parseInt(latest['死亡累計'] || latest['死亡者数累計'] || latest['死亡'])
    if (!res.npatients) {
      res.npatients = res.ncurrentpatients + res.nexits + res.ndeaths
    }
    if (lastUpdate)
      res.lastUpdate = lastUpdate.replace(/\//g, '-').replace(/ /g, 'T')
  }
  if (lastUpdateFetched) {
    res.lastUpdate = lastUpdateFetched
  }
  res.src_url = url
  res.url_opendata = url_opendata
  console.log(res)
  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".csv", util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
  return res
}

const test = async function() {
  const url = URL
  const res = await fetch(url)
  console.log(res.headers) // no last-modified
}


const list_test = [ // for test
  //{ pref: "Fukui", url: 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/covid-19_d/fil/covid19_patients.csv', url_opendata: 'https://www.pref.fukui.lg.jp/doc/toukei-jouhou/covid-19.html' },
  //{ pref: "Fukuoka", url: 'https://ckan.open-governmentdata.org/dataset/8a9688c2-7b9f-4347-ad6e-de3b339ef740/resource/c27769a2-8634-47aa-9714-7e21c4038dd4/download/400009_pref_fukuoka_covid19_patients.csv', url_opendata: 'https://ckan.open-governmentdata.org/dataset/401000_pref_fukuoka_covid19_patients' },
  // { pref: "Toyama", data_canuse: 1, data_standard: 1, url_patients_csv: 'http://opendata.pref.toyama.jp/files/covid19/20200403/toyama_patients.csv', url_opendata: 'http://opendata.pref.toyama.jp/dataset/covid19' },
  // { pref: "Gifu", data_canuse: 1, data_standard: 1, url_patients_csv: 'https://data.gifu-opendata.pref.gifu.lg.jp/dataset/4661bf9d-6f75-43fb-9d59-f02eb84bb6e3/resource/9c35ee55-a140-4cd8-a266-a74edf60aa80/download/210005gifucovid19patients.csv', url_opendata: 'https://data.gifu-opendata.pref.gifu.lg.jp/dataset/c11223-001' },
  { pref: 'Yamaguchi', data_canuse: 1, data_alt: 1, data_standard: 1, url_patients_alt: 'https://yamaguchi-opendata.jp/ckan/dataset/f6e5cff9-ae43-4cd9-a398-085187277edf/resource/1a5f9bca-3216-45df-8a99-5c591df8f628/download/350001_yamaguchi_covid19_hospitalization.csv', url_opendata: 'https://yamaguchi-opendata.jp/ckan/dataset/f6e5cff9-ae43-4cd9-a398-085187277edf ' },
]

const fetchCSVtoJSON = async url => util.csv2json(util.decodeCSV(await (await fetch(url)).text()))

const main = async function () {
  const yday = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000) // 2日前以降は含めない
  const yesterday = new Date(util.formatYMD(yday)).getTime()
  // console.log(new Date(yesterday))
  // return
  // console.log(yesterday, util.formatYMD(yday), new Date(util.formatYMD(yday)))

  //const data = fs.readFileSync('../data/covid19fukui/20200409T151739.csv', 'utf-8')
  //fs.writeFileSync('../data/covid19fukui/20200409T151739-2.csv', util.addBOM(data))

  const url_official = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-OrSJv81VIWWrQ0W6vndw8HEjtztkWY39E97v-oFR0tYF0chwV-duQUkKIOSJPj57IbVuqGZO-C_K/pub?gid=0&single=true&output=csv'
  const list = await fetchCSVtoJSON(url_official)
  //const list = list_test

  const data = []
  for (const d of list) {
    // if (d.pref !== 'Akita') { continue }

    console.log(d)
    if (d.data_canuse == 1) {
      console.log(d.data_canuse, d.pref, 'standard', d.data_standard, 'alt', d.data_alt, 'data.json', d.data_json, 'special', d.data_special)
      let fastdata = null
      if (d.data_special) {
        const lpref = d.pref.toLowerCase()
        const stdout = await cmd.cmd('node covid19' + lpref + '.mjs')
        // console.log(stdout, 'special invoked')
        const fn = '../data/covid19' + lpref + '/latest.json'
        const json = JSON.parse(fs.readFileSync(fn, 'utf-8'))
        console.log(fn, json)
        fastdata = json
      } else if (d.data_json) {
        fastdata = await makeDataFromDataJSON(d.pref, d.url_patients_json, d.url_opendata)
      } else if (d.data_standard == 1 && d.data_alt != 1) {
        fastdata + await makeData(d.pref, d.url_patients_csv, d.url_opendata)
      } else if (d.data_alt == 1) {
        fastdata = await makeDataFromAlt(d.pref, d.url_patients_alt, d.url_opendata)
      }
      if (fastdata && fastdata.lastUpdate) {
        if (new Date(fastdata.lastUpdate).getTime() >= yesterday) {
          data.push(fastdata)
        } else {
          console.log('too old', d.pref, fastdata.lastUpdate, new Date(fastdata.lastUpdate).getTime(), yesterday, new Date(yesterday))
          await util.sleep(2000)
        }
      }
      await util.sleep(1000)
    }
  }
  // data.push(await makeDataFromJSON())

  //console.log(data)
  for (const d of data) {
    console.log(d.lastUpdate, new Date(d.lastUpdate))
  }

  if (util.writeCSV('../data/covid19japan-fast', util.json2csv(data))) {
    util.writeCSV('../data/covid19fast/' + util.getYMDHMS(), util.json2csv(data))
    util.writeCSV('../data/covid19fast/' + util.getYMD(), util.json2csv(data))
  }

  //const data2 = util.readCSV('../data/covid19japan-fast')
  //console.log(data2)
}

//import Diff from 'diff'

if (process.argv[1].endsWith('/covid19fast.mjs')) {
  main()


  /*
  const csv1 = util.readCSV('../data/covid19fast/20200426065504')
  let csv2 = util.readCSV('../data/covid19fast/20200426065639')
  //csv2 = csv2.unshift()
  const diff = Diff.diffJson(csv1, csv2)
  console.log(diff)
  console.log(JSON.stringify(csv1) == JSON.stringify(csv2))
  */
}

export default { makeData }
