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
  fs.writeFileSync('vscovid19-data.csv', csv)
  const data = util.convertCSVtoArray(csv)
	//data.shift()
	return util.csv2json(data)
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
  const key = '2PACX-1vQRpNRUT8_oXjgxsZd1KL6zAU_zKSUe-Z80DtcazxhmDMtO11FvPWvxUnbpcleFgbu3k2RYmAVqu1xc'
  const json = await fetchGoogleSpreadSheet(key)
  console.log(json)
  fs.writeFileSync('../data/bedforinfection_current.json', JSON.stringify(json))
}
/*
  9時-12時、
*/

const makeCovid19Pref = function() {
  const data = fs.readFileSync('covid19pref.csv', 'utf-8')
  //console.log(data)
  const csv = util.convertCSVtoArray(data)
  //console.log(csv)
  const json = util.csv2json(csv)
  console.log(json)
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
  //console.log(JSON.stringify(json))
  fs.writeFileSync('covid19pref.json', JSON.stringify(json))

}
const main = async function() {
  // makeSupport()
  //makeCovid19()
  makeBedData()

}
if (require.main === module) {
  main()
}
