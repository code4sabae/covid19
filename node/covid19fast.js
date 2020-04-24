const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')

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
  //csv.splice(0, 1)
  const json = util.csv2json(csv)
  //console.log(json)

  checkJSON(json)
  // '患者_状態': [ '', '重篤', '死亡', '軽症', '重症' ],
  // '患者_退院済フラグ': [ '1', '0' ],

  let nexits = 0
  let ndeaths = 0
  for (const d of json) {
    if (d['患者_状態'] == '死亡' || d['状態'] == '死亡') {
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

  const res = { name: pref }
  const latest = json[json.length - 1]
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
    res.lastUpdate = lastUpdate.replace(/\//g, '-').replace(/ /g, 'T')
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

const main = async function() {
  //const data = fs.readFileSync('../data/covid19fukui/20200409T151739.csv', 'utf-8')
  //fs.writeFileSync('../data/covid19fukui/20200409T151739-2.csv', util.addBOM(data))

  const url_official = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-OrSJv81VIWWrQ0W6vndw8HEjtztkWY39E97v-oFR0tYF0chwV-duQUkKIOSJPj57IbVuqGZO-C_K/pub?gid=0&single=true&output=csv'
  const list = await fetchCSVtoJSON(url_official)
  
  const data = []
  for (const d of list) {
    /*
    if (d.pref != 'Wakayama') {
    //if (d.pref != 'Hyogo') {
      continue
    }
    */
   
    console.log(d)
    if (d.data_canuse == 1) {
      console.log(d.data_canuse, d.pref, 'standard', d.data_standard, 'alt', d.data_alt, 'data.json', d.data_json)
      if (d.data_special) {
        const fn = '../data/covid19' + d.pref.toLowerCase() + '/latest.json'
        const json = JSON.parse(fs.readFileSync(fn, 'utf-8'))
        console.log(fn, json)
        data.push(json)
      } if (d.data_json) {
        data.push(await makeDataFromDataJSON(d.pref, d.url_patients_json, d.url_opendata))
      } else if (d.data_standard == 1 && d.data_alt != 1) {
        data.push(await makeData(d.pref, d.url_patients_csv, d.url_opendata))
      } else if (d.data_alt == 1) {
        const d2 = await makeDataFromAlt(d.pref, d.url_patients_alt, d.url_opendata)
        console.log(d2)
        data.push(d2)
      }
    }
  }
  //data.push(await makeDataFromJSON())
  console.log(data)
  util.writeCSV('../data/covid19japan-fast', util.json2csv(data))

  //const data2 = util.readCSV('../data/covid19japan-fast')
  //console.log(data2)
}
if (require.main === module) {
  main()
} else {
}
