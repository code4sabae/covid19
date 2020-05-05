import util from './util.js'
import fs from 'fs'

const main = async function() {
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
