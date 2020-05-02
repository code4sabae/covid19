import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'
import cheerio from 'cheerio'
import cmd from './cmd.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const parseJSON = function (pref, json) {
  // util.checkJSON(json)
  console.log(json)

  const res = {
    name: pref,
    npatients: 0,
    ncurrentpatients: 0,
    nexits: 0,
    ndeaths: 0
  }
  const pi = s => s.length == 0 ? 0 : parseInt(s)
  for (const d of json) {
    res.lastUpdate = d['年月日']
    res.npatients += pi(d['陽性人数'])
    res.nexits += pi(d['退院者数'])
    res.ndeaths += pi(d['死亡者数'])
  }
  res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
  return res
}

const fetchAndSave = async function (url) {
  const m = url.match(/\.([^\.]+)$/)
  const ext = m ? m[1] : 'bin'
  const data = await (await fetch(url)).arrayBuffer()
  console.log(data)
  const temp = new Date().getTime() + '.' + ext
  const fn = 'temp/' + temp
  fs.writeFileSync(fn, new Buffer.from(data), 'binary')
  return fn
}

const main = async function () {
  const pref = 'Toyama'
  /*
  const url = 'http://opendata.pref.toyama.jp/dataset/covid19/resource/de742c2d-8471-496a-9ff1-55d4afd69109'

  const html = await (await fetch(url)).text()
  const dom = cheerio.load(html)
  let urlOpendata = null
  dom('.resource-url-analytics').each((idx, ele) => {
    urlOpendata = dom(ele).attr('href')
  })
  console.log(urlOpendata)
  if (!urlOpendata) {
    console.log('not found urlOpendata')
    process.exit(1)
  }
  const fn = await fetchAndSave(urlOpendata)
  console.log(fn)
  await cmd.cmd(`unzip -o ${fn} -d temp`)

  const scsv = util.removeBOM(fs.readFileSync('temp/data/toyama_counts.csv', 'utf-8'))
  */
  const url = 'http://opendata.pref.toyama.jp/dataset/covid19/resource/85d4c612-c174-4f73-be63-f8512d25361a'
  const urlOpendata = 'http://opendata.pref.toyama.jp/files/covid19/20200403/toyama_counts.csv'
  const scsv = await (await fetch(urlOpendata)).text()

  const csv = util.decodeCSV(scsv)
  console.log(csv)

  const json = util.csv2json(csv)
  console.log(json)
  const res = parseJSON(pref, json)
  res.src_url = url
  res.url_opendata = urlOpendata
  console.log(res)

  const lpref = pref.toLowerCase()
  // const scsv = util.encodeCSV(csv)
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.csv', util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(util.encodeCSV(csv)))
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
