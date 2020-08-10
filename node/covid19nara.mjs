import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'
import xlsx2csv from './xlsx2csv.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const parseJSON = function (pref, json) {
  // util.checkJSON(json)
  console.log(json)

  const res = { name: pref }
  const latest = json[json.length - 1]
  const lastUpdate = latest['公表_年月日']
  res.npatients = parseInt(latest['陽性確認_件数_累計'])
  res.ncurrentpatients = parseInt(latest['入院者数'])
  res.nbeds_hospital = parseInt(latest['感染症対応病床数'])
  res.nbeds_hotel = parseInt(latest['宿泊療養室数'])
  res.nbeds = res.nbeds_hospital + res.nbeds_hotel
  res.nexits = parseInt(latest['退院者_累計'])
  res.ndeaths = parseInt(latest['死亡者_累計'])
  res.lastUpdate = lastUpdate // util.formatYMDHMS(parseDateTime(lastUpdate))
  console.log(lastUpdate, res.lastUpdate)

  for (const name in res) {
    if (name !== 'name' && name.charAt(0) === 'n') {
      // console.log(res[name], name)
      if (isNaN(res[name])) {
        return null
      }
    }
  }
  console.log(res)
  return res
}

const fetchAndSave = async function (url) {
  const data = await (await fetch(url)).arrayBuffer()
  console.log(data)
  const temp = new Date().getTime() + '.xlsx'
  const fn = 'temp/' + temp
  fs.writeFileSync(fn, new Buffer.from(data), 'binary')
  return fn
}
const getSheetXlsx = async function (url) {
  const fn = await fetchAndSave(url)
  // console.log(fn);
  // const fn = 'temp/1597060642149.xlsx'
  const workbook = xlsx.readFile(fn)
  // fs.unlinkSync(fn)

  // console.log(workbook)
  for (const shname in workbook.Sheets) {
    const sh = workbook.Sheets[shname]
    // console.log(sh)
    return sh
  }
  return null
}

const main = async function () {
  const pref = 'Nara'
  const url = 'http://www.pref.nara.jp/secure/227221/%E5%A5%88%E8%89%AF%E7%9C%8C_02%E6%96%B0%E5%9E%8B%E3%82%B3%E3%83%AD%E3%83%8A%E3%82%A6%E3%82%A4%E3%83%AB%E3%82%B9%E6%84%9F%E6%9F%93%E8%80%85_%E6%82%A3%E8%80%85%E9%9B%86%E8%A8%88%E8%A1%A8.xlsx'
  //const url = "https://www.city.nara.lg.jp/site/coronavirus/";
  const urlOpendata = 'http://www.pref.nara.jp/55168.htm'

  const sh = await getSheetXlsx(url)
  let csv = xlsx2csv.xlsx2csv(sh)
  util.writeFileSync('temp/test-nara.csv', util.addBOM(util.encodeCSV(csv)))
  csv = csv.splice(1);

  const json = util.csv2json(csv);
  console.log(json)
  const res = parseJSON(pref, json)
  process.exit(0);
  res.src_url = url
  res.url_opendata = urlOpendata

  const lpref = pref.toLowerCase()
  // const scsv = util.encodeCSV(csv)
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.csv', util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
