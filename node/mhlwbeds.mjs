import util from './util.mjs'
import fs from 'fs'

const main = async function () {
  const srcfn = '../data/mhlw_go_jp/20200501-beds'
  const dstfn = '../data/mhlw_go_jp/beds'

  const csv = util.readCSV(srcfn)
  const json = util.csv2json(csv)
  // console.log(csv)

  /*
   '都道府県名', '入院患者受入確保病床数', '入院患者受入確保想定病床数', '宿泊施設受入可能室数' ],

  */
  const parsei = function (s) {
    if (s.length === 0)
      return 0
    return parseInt(s)
  }
  const res = []
  for (const i of json) {
    res.push({
      自治体名: i.都道府県名,
      新型コロナウイルス対策感染症病床数: parsei(i.入院患者受入確保病床数) + parsei(i.宿泊施設受入可能室数),
      発表日: '2020/05/01',
      出典: 'https://www.mhlw.go.jp/content/10900000/000628694.pdf',
      備考: '医療病床数' + i.入院患者受入確保病床数 + '床' + (i.宿泊施設受入可能室数.length > 0 ? '+宿泊療養施設' + i.宿泊施設受入可能室数 + '室' : '')
    })
  }
  console.log(res)
  util.writeCSV(dstfn, util.json2csv(res))
  /*
  const trend = await makeTrendFromMHLW()
  const fast = await makeTrendFromFast()
  // console.log(trend)
  for (let i = 0; i < trend.length; i++) {
    const t = trend[i]
    const t2 = fast.find(i => i.name === t.name)
    if (t2) { trend[i] = t2 }
  }
  // console.log(trend)
  // console.log(fast)

  util.writeCSV(dstfnbase, util.json2csv(trend))

  */
}
if (process.argv[1].endsWith('/mhlwbeds.mjs')) {
  main()
}
