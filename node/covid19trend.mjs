import util from './util.mjs'
import fs from 'fs'

const main = async function () {
  // makeTrendFromMHLW()
  makeTrendFromFast()
}
const oneDayBefore = function (d) {
  return new Date(d.getTime() - (1000 * 60 * 60 * 24))
}
const makeTrendFromFast = async function () {
  const now = new Date()
  const yesterday = oneDayBefore(now)
  const src1 = '../data/covid19fast/' + util.getYMD(yesterday) + '.json'
  const src2 = '../data/covid19fast/' + util.getYMD(now) + '.json'
  const dstfn = '../data/covid19japan-trend.json'
  const prev = JSON.parse(fs.readFileSync(src1))
  const latest = JSON.parse(fs.readFileSync(src2))
  console.log(latest)
  const trend = []
  for (const dc of latest) {
    const dp = prev.find(i => i.name === dc.name)
    if (!dp) { continue }
    const div = dc.ncurrentpatients - dp.ncurrentpatients
    const ratio = dp.ncurrentpatients ? div / dp.ncurrentpatients : 0
    const o = {
      name: dc.name,
      dcurrentpatients: div,
      //dpercent: parseFloat(ratio.toFixed(4)),
      prevcurrentpatients: dp.ncurrentpatients,
    }
    trend.push(o)
  }
  console.log(trend)
  fs.writeFileSync(dstfn, JSON.stringify(trend))
}
const makeTrendFromMHLW = async function () {
  const srcfn = '../data/covid19japan-all.json'
  const dstfn = '../data/covid19japan-trend.json'
  const json = JSON.parse(fs.readFileSync(srcfn))
  console.log(json)
  const latest = json[json.length - 1]
  const prev = json[json.length - 2]
  const trend = []
  for (let i = 0; i < latest.area.length; i++) {
    const dc = latest.area[i]
    const dp = prev.area[i]
    const div = dc.ncurrentpatients - dp.ncurrentpatients
    console.log(dc.name, dc.ncurrentpatients, dp.ncurrentpatients)
    const ratio = dp.ncurrentpatients ? div / dp.ncurrentpatients : 0
    const o = {
      name: dc.name,
      dcurrentpatients: div,
      //dpercent: parseFloat(ratio.toFixed(4)),
      prevcurrentpatients: dp.ncurrentpatients,
    }
    trend.push(o)
  }
  console.log(trend)
  fs.writeFileSync(dstfn, JSON.stringify(trend))
}
if (process.argv[1].endsWith('/covid19trend.mjs')) {
  main()
}
