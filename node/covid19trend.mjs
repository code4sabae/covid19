import util from './util.mjs'
import fs from 'fs'

const oneDayBefore = function (d) {
  return new Date(d.getTime() - (1000 * 60 * 60 * 24))
}
const makeTrendFromFast = async function () {
  const DEBUG = false;
  //const DEBUG = true;
  const now = DEBUG ? oneDayBefore(new Date()) : new Date();
  const yesterday = oneDayBefore(now)
  const src1 = '../data/covid19fast/' + util.getYMD(yesterday) + '.json'
  const src2 = '../data/covid19fast/' + util.getYMD(now) + '.json'
  console.log(src1, src2);
  const prev = JSON.parse(fs.readFileSync(src1))
  const latest = JSON.parse(fs.readFileSync(src2))
  console.log(latest)
  const trend = []
  for (const dc of latest) {
    const dp = prev.find(i => i.name === dc.name)
    if (!dp) { continue }
    const div = dc.ncurrentpatients - dp.ncurrentpatients
    // const ratio = dp.ncurrentpatients ? div / dp.ncurrentpatients : 0
    const o = {
      name: dc.name,
      ncurrentpatients: dc.ncurrentpatients,
      dcurrentpatients: div
      // dpercent: parseFloat(ratio.toFixed(4)),
      // prevcurrentpatients: dp.ncurrentpatients
    }
    trend.push(o)
  }
  console.log(trend)
  return trend
}
const makeTrendFromMHLW = async function () {
  const srcfn = '../data/covid19japan-all.json'
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
    const o = {
      name: dc.name,
      ncurrentpatients: dc.ncurrentpatients,
      dcurrentpatients: div
      // dpercent: parseFloat(ratio.toFixed(4)),
      // prevcurrentpatients: dp.ncurrentpatients
    }
    trend.push(o)
  }
  console.log(trend)
  return trend
}

const PREF_EN = ["Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"]
const PREF_S = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']
const PREF_C3 = ['HKD', 'AOM', 'IWT', 'MYG', 'AKT', 'YGT', 'FKS', 'IBR', 'TCG', 'GNM', 'SAI', 'CBA', 'TKY', 'KNG', 'NIG', 'TYM', 'ISK', 'FKI', 'YMN', 'NGN', 'GIF', 'SZO', 'AIC', 'MIE', 'SGA', 'KYT', 'OSK', 'HYG', 'NRA', 'WKY', 'TTR', 'SMN', 'OKY', 'HRS', 'YGC', 'TKS', 'KGW', 'EHM', 'KOC', 'FKO', 'SAG', 'NGS', 'KMM', 'OIT', 'MYZ', 'KGS', 'OKN']

const TABULARMAPS_JAPAN = `
日本 日本 鳥取 石川 富山 青森 北海道
山口 島根 岡山 福井 新潟 秋田 岩手
長崎 福岡 広島 滋賀 長野 山形 宮城
佐賀 大分 兵庫 京都 山梨 群馬 福島
熊本 宮崎 大阪 奈良 岐阜 埼玉 栃木
鹿児島 愛媛 香川 和歌山 静岡 東京 茨城
沖縄 高知 徳島 三重 愛知 神奈川 千葉`

const sortByTabularMaps = function (array) {
  const prefja = name => PREF_S[PREF_EN.indexOf(name)]
  const tabidx = name => TABULARMAPS_JAPAN.indexOf(prefja(name))
  return array.sort((a, b) => tabidx(a.name) - tabidx(b.name))
}
const json2txt = function (json) {
  const p = s => PREF_EN.indexOf(s) < 0 ? s : PREF_C3[PREF_EN.indexOf(s)]
  const res = []
  for (const d of json) {
    for (const n in d) {
      res.push(p(d[n]))
    }
  }
  res.unshift(res.length)
  return res.join('\r\n') + "\r\n";
}
const main = async function () {
  const dstfnbase = '../data/covid19japan-trend'

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

  const trend2 = sortByTabularMaps(trend)
  console.log(trend2)
  fs.writeFileSync(dstfnbase + '.txt', json2txt(trend2))
}
if (process.argv[1].endsWith('/covid19trend.mjs')) {
  main()
}
