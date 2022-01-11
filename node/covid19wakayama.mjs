import xlsx from 'xlsx'
import util from './util.mjs'
import fetch from 'node-fetch'
import fs from 'fs'
import xlsx2csv from './xlsx2csv.mjs'

const fetchAndSave = async function (url, dstpath) {
  const fnlatest = dstpath + 'latest.xlsx'
  const data = await (await fetch(url)).arrayBuffer()
  const temp = new Date().getTime() + '.xlsx'
  dstpath = dstpath || 'temp/'
  const bin = new Buffer.from(data)
  const binpast = util.readFileSync(fnlatest)
  console.log(bin, binpast)
  if (Buffer.compare(bin, binpast) === 0) {
    return fnlatest
  }
  fs.writeFileSync(dstpath + temp, bin, 'binary')
  fs.writeFileSync(fnlatest, bin, 'binary')
  return fnlatest
}
const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

// '2020年4月23日17時現在'
const parseDateTime = function (s) {
  const n = s.match(/(\d+)年(\d+)月(\d+)日(\d+)時/)
  if (!n) { throw new Error("can't parseDateTime " + s) }
  const d = new Date()
  d.setFullYear(parseInt(n[1]))
  d.setMonth(parseInt(n[2]) - 1)
  d.setDate(parseInt(n[3]))
  d.setHours(parseInt(n[4]))
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d
}

const parseV1 = function (res, sh) {
  res.lastUpdate = util.formatYMDHMS(parseDateTime(sh.F2.v))
  const getLatest = function (num) {
    let last = null
    for (const name in sh) {
      if (name.endsWith(num)) {
        last = name
      }
    }
    if (last == null) { return null }
    return sh[last].v
  }
  res.ncurrentpatients = getLatest(4)
  res.nexits = getLatest(7)
  res.ndeaths = getLatest(10)
  res.npatients = res.ncurrentpatients + res.nexits + res.ndeaths
  // console.log(npatients, nexits, ndeaths, ncurrentpatients)
}
const parseV2 = function (res, sh) {
  const csv = xlsx2csv.xlsx2csv(sh)
  res.lastUpdate = util.formatYMDHMS(parseDateTime(csv[0][1]))
  // const chk = ['陽性の方', '新規感染者', '入院中', '退院済みの方', '健康観察中', '社会復帰', '死亡']
  const chk = ['入院患者数', '新規感染者', '入院中', '退院済みの方', '健康観察中', '社会復帰', '死亡']
  for (let i = 0; i < chk.length; i++) {
    const h = csv[2 + i][0].trim();
    if (h !== chk[i]) {
      console.log(h, chk[i]);
      return false;
    }
  }
  //fs.writeFileSync("wakayama_csv.csv", JSON.stringify(csv));

  let last = csv[2].length - 1;
  while (csv[2][last].length == 0) {
    last--;
  }
  const getLatest = num => {
    const s = csv[num][last];
    if (s.length == 0) {
      return null;
    }
    return parseInt(s)
  };
  for (let i = 0; i < 10; i++) {
    console.log(last, csv[i][last]);
  }
  res.ncurrentpatients = getLatest(4 - 2)
  res.nexits = getLatest(7 - 2)
  res.ndeaths = getLatest(10 - 2)
  res.npatients = res.ncurrentpatients + res.nexits + res.ndeaths
  return res.ncurrentpatients != null && res.nexits != null && res.ndeaths != null && res.npatients != null;
}

const main = async function () {
  const pref = 'Wakayama'
  const url = 'https://www.pref.wakayama.lg.jp/prefg/000200/covid19_d/fil/kansensuii.xlsx'
  const urlOpendata = 'https://www.pref.wakayama.lg.jp/prefg/041200/d00203387.html'
  const lpref = pref.toLowerCase()
  const path = '../data/covid19' + lpref + '/'

  const fn = await fetchAndSave(url, path)
  // const workbook = xlsx.readFile('temp/kansensuii.xlsx')
  const workbook = xlsx.readFile(fn)
  // console.log(workbook)
  const res = { name: pref }
  for (const shname in workbook.Sheets) {
    const sh = workbook.Sheets[shname]
    console.log(sh)
    if (!parseV2(res, sh)) {
      console.log('** data format changed!!!')
      process.exit(1)
    }
    break
  }
  res.src_url = url
  res.url_opendata = urlOpendata
  console.log(res)

  util.writeFileSync(path + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  util.writeFileSync(path + 'latest.json', JSON.stringify(res))
}
main()
