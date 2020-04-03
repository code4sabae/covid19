const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')

const fetchViaProxy = async function(url) {
  /*
	//const proxyhost = "https://app.sabae.cc/proxy"
	const proxyhost = "http://localhost:8003/proxy"
	const proxyurl = proxyhost + "/?url=" + encodeURIComponent(url)
  const data = await (await fetch(proxyurl)).text()
  */
  const data = await (await fetch(url)).text()
	return data
}
const fetchGoogleSpreadSheet = async function(key) {
	const csvurl = `https://docs.google.com/spreadsheets/d/e/${key}/pub?gid=0&single=true&output=csv`
  const csv = await fetchViaProxy(csvurl)
  const data = util.convertCSVtoArray(csv)
	//data.shift()
	return util.csv2json(data)
}
const fetchGoogleSpreadSheetCSV = async function(key) {
	const csvurl = `https://docs.google.com/spreadsheets/d/e/${key}/pub?gid=0&single=true&output=csv`
  const csv = await fetchViaProxy(csvurl)
  return csv
}

const makeSupport = async function() {
  const key = '2PACX-1vSFMNp5HcRNOF5MrAujEUWR1dIoX2mncMEWTbPlVAaJqKWiq831-6gnCyI7n_G8YfPqNQXrfwyVjyHL'
  const data = await fetchGoogleSpreadSheet(key)
  console.log(data)
  fs.writeFileSync('vscovid19-data.json', JSON.stringify(data))
}
const makeCovid19 = async function() {
  const fns = [ 'covid19japan.json', 'bedforinfection_summary.json', 'bedforinfection.json', 'covid19cio.json' ]
  for (const fn of fns) {
    const url = 'http://localhost:8003/api/' + fn
    const data = await (await fetch(url)).json()
    fs.writeFileSync(fn, JSON.stringify(data))
  }
}
const makeBedData = async function() {
  //const key = '2PACX-1vQRpNRUT8_oXjgxsZd1KL6zAU_zKSUe-Z80DtcazxhmDMtO11FvPWvxUnbpcleFgbu3k2RYmAVqu1xc'
  const key = '2PACX-1vQEUdBj10hsT18kpdqluHmVfjh5hBXgLW0naLaMf6cXTRF5vd8ezOmwj49s815tJ1oMmamLmMsQF1Lp'
  const csv = await fetchGoogleSpreadSheetCSV(key)
  const fn = '../data/bedforinfection_current'
  fs.writeFileSync(fn + '.csv', csv)
  const data = util.convertCSVtoArray(csv)
	const json = util.csv2json(data)
  console.log(json)
  fs.writeFileSync(fn + '.json', JSON.stringify(json))
}
/*
  9時-12時、
*/

const makeCovid19Pref = async function() {
  const key = '2PACX-1vS-OrSJv81VIWWrQ0W6vndw8HEjtztkWY39E97v-oFR0tYF0chwV-duQUkKIOSJPj57IbVuqGZO-C_K'
  const json = await fetchGoogleSpreadSheet(key)
  //console.log(data)
  //console.log(csv)
  /*
  const data = fs.readFileSync('covid19pref.csv', 'utf-8')
  //console.log(data)
  const csv = util.convertCSVtoArray(data)
  //console.log(csv)
  const json = util.csv2json(csv)
  console.log(json)
  */
  /*
  const PREF = util.JAPAN_PREF
  const PREF_EN = util.JAPAN_PREF_EN
  for (let i = 0; i < json.length; i++) {
    //console.log(json[i], PREF[i])
    
    if (json[i].pref_ja != PREF[i]) {
      console.log("** ERR!", json[i].pref_ja)
      return
    }
    json[i].pref = PREF_EN[i]
  }
  */
  util.writeCSV('../data/covid19pref', util.json2csv(json))

  //console.log(JSON.stringify(json))
  //fs.writeFileSync('covid19pref.json', JSON.stringify(json))
}
const main = async function() {
  // makeSupport()
  //makeCovid19()
  //makeCovid19Pref()
  makeBedData()
}
if (require.main === module) {
  main()
}
