const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')

const CACHE_TIME = 10 * 1000 // 10min
const PATH = 'data/covid19tokyo/'
const URL = 'https://www.harp.lg.jp/opendata/dataset/1369/resource/2828/patients.csv'

// 2020年4月3日, 午前11時33分 (UTC+09:00)
const parseDate = function(s) {
  s = util.toHalf(s)
  const fix0 = util.fix0
  let num = s.match(/(\d+)年(\d+)月(\d+)日.*(午前|午後)(\d+)時(\d+)分.+UTC(\+|\-)(\d+):(\d+)/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    const afternoon = num[4] == '午後'
    let h = parseInt(num[5]) + (afternoon ? 12 : 0)
    let min = parseInt(num[6])

    const d1 = new Date()
    d1.setFullYear(y)
    d1.setMonth(m - 1)
    d1.setDate(d)
    d1.setHours(h)
    d1.setMinutes(min)
    d1.setSeconds(0)
    d1.setMilliseconds(0)
    let t = d1.getTime()
    const utcplus = num[7] == '+'
    const utch = parseInt(num[8]) * (utcplus ? 1 : -1)
    const utcm = parseInt(num[9]) * (utcplus ? 1 : -1)
    const utcdt = ((utch * 60 + utcm) * 60) * 1000
    t += utcdt
    const d2 = new Date(t)
    return d2.getFullYear() + "-" + fix0(d2.getMonth() + 1, 2) + "-" + fix0(d2.getDate(), 2) + "T" + fix0(d2.getHours(), 2) + ":" + fix0(d2.getMinutes(), 2)
  }
  return "--"
}
//console.log(parseDate('2020年4月3日, 午前11時33分 (UTC+09:00)'))
//console.log(parseDate('2020年4月3日, 午前11時33分 (UTC+09:55)'))
//return

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
const main = async function() {
  const scsv = await util.fetchText(URL, 'ShiftJIS')
  //console.log(scsv)
  const csv = util.decodeCSV(scsv)
  const json = util.csv2json(csv)
  console.log(json)

  checkJSON(json)
  return

  let cnt = 0
  const flglist = []
  for (const d of json) {
    const flg = d['退院済フラグ']
    if (flglist.indexOf(flg) == -1) {
      flglist.push(flg)
      console.log('flg: ', flg)
    }
    if (flg != 1) {
      cnt++
    }
  }
  /*
  const area = []
  const PREF = util.JAPAN_PREF_EN
  for (let i = 0; i < PREF.length; i++) {
    if (PREF
  }
  */
  console.log(json.length, cnt)
  const res = { name: 'Tokyo', patientscurrent: cnt, patients: json.length, src_url: URL }


}
if (require.main === module) {
  main()
} else {
}
