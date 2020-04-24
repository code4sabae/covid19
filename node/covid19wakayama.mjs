import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'

const fetchAndSave = async function(url) {
  const data = await (await fetch(url)).arrayBuffer()
  const temp = new Date().getTime() + ".xlsx"
  const fn = 'temp/' + temp
  fs.writeFileSync(fn, new Buffer.from(data), 'binary')
  return fn
}
const date2s = function(datetime) {
  return datetime.replace(/:|-/g, "")
}

// '2020年4月23日17時現在'
const parseDateTime = function(s) {
  const n = s.match(/(\d+)年(\d+)月(\d+)日(\d+)時/)
  if (!n)
    throw "can't parseDateTime " + s
  const d = new Date()
  d.setFullYear(parseInt(n[1]))
  d.setMonth(parseInt(n[2]) + 1)
  d.setDate(parseInt(n[3]))
  d.setHours(parseInt(n[4]))
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d
}

const main = async function() {
  const pref = 'Wakayama'
  const url = 'https://www.pref.wakayama.lg.jp/prefg/000200/covid19_d/fil/kansensuii.xlsx'
  const url_opendata = 'https://www.pref.wakayama.lg.jp/prefg/041200/d00203387.html'
  
  const fn = await fetchAndSave(url)
  //const workbook = xlsx.readFile('temp/kansensuii.xlsx')
  const workbook = xlsx.readFile(fn)
  //console.log(workbook)
  const res = { name: pref }
  for (const shname in workbook.Sheets) {
    const sh = workbook.Sheets[shname]
    //console.log(sh)
  
    res.lastUpdate = util.formatYMDHMS(parseDateTime(sh.F2.v))
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
    res.ncurrentpatients = getLatest(4)
    res.nexits = getLatest(7)
    res.ndeaths = getLatest(10)
    res.npatients = res.ncurrentpatients + res.nexits + res.ndeaths
    //console.log(npatients, nexits, ndeaths, ncurrentpatients)
    break
  }
  res.src_url = url
  res.url_opendata = url_opendata
  console.log(res)

  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + ".json", JSON.stringify(res))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
