import util from './util.mjs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import dateparser from './dateparser.mjs'
import pdf2text from './pdf2text.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const fetchAndSave = async function (url, dstpath, ext) {
  const fnlatest = dstpath + 'latest' + ext
  const data = await (await fetch(url)).arrayBuffer()
  const temp = new Date().getTime() + ext
  dstpath = dstpath || 'temp/'
  const bin = new Buffer.from(data)
  const binpast = util.readFileSync(fnlatest)
  // console.log(bin, binpast)
  if (binpast && Buffer.compare(bin, binpast) === 0) {
    return fnlatest
  }
  util.writeFileSync(dstpath + temp, bin, 'binary')
  util.writeFileSync(fnlatest, bin, 'binary')
  return fnlatest
}

const parseV1 = function (res, txt) {
  const ss = txt.split('\n')
  // console.log(ss)
  let data = null
  let dt = null
  for (const t of ss) {
    if (!dt) {
      const t2 = util.toHalf(t)
      dt = dateparser.parseDate(t2)
    }
    data = t.match(/(\d+)人 (\d+)人 (\d+)人 (\d+)人 (\d+)人 (\d+)人 (\d+)人 (\d+)人/)
    if (data) { break }
  }
  if (!dt || !data) {
    console.log('cant parse', dt, data)
    // process.exit(1)
    return null
  }
  // 0:感染者（累積） 1:入院中 2:医療機関 3:軽症 4:重症 5:宿泊療養 6:死亡 7:退院
  try {
    res.npatients = parseInt(data[1])
    res.lastUpdate = dt
    res.nexits = parseInt(data[8])
    res.ndeaths = parseInt(data[7])
    res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
    res.ncurrentpatients_hospital = parseInt(data[6])
    res.ncurrentpatients_hotel = parseInt(data[3])
    res.nheavycurrentpatients = parseInt(data[5])
  } catch (e) {
    console.log('error! can\'t parse', e)
    // process.exit(1)
    return null
  }
  return res
}
const parseV2 = function (res, txt) {
  const ss = txt.split('\n')
  console.log(ss)

  // 死亡者数、不明
  /*
  '退院等：44人',
  '【 Ｒ２.５.１５ １３時現在 】',
  '治療中：26人',
  '合 計 1,441 1,371 70',
  */
  for (const t of ss) {
    if (!res.lastUpdate) {
      const t2 = util.toHalf(t)
      res.lastUpdate = dateparser.parseDate(t2)
    }
    let n = t.match(/退院数: ([\d|,]+)人/)
    if (n) {
      res.nexits = util.removeComma(n[1])
    }
    n = t.match(/治療中: ([\d|,]+)人/)
    if (n) {
      res.nexits = util.removeComma(n[1])
    }
    n = t.match(/合 計: ([\d|,]+) ([\d|,]+) ([\d|,]+)/)
    if (n) {
      res.ninspections = util.removeComma(n[1])
      res.npatients = util.removeComma(n[3])
    }
  }
  return res
}
const main = async function () {
  const pref = 'Ehime'
  const urlWeb = 'https://www.pref.ehime.jp/h25500/kansen/covid19.html'
  const url = 'https://www.pref.ehime.jp/h25500/kansen/documents/kennai_link.pdf'
  const lpref = pref.toLowerCase()
  const path = '../data/covid19' + lpref + '/'

  //const fn = path + '1589530359544.pdf' // 'kennai_link.pdf'
  const fn = await fetchAndSave(url, path, '.pdf')
  console.log(fn)
  // return

  const txt = await pdf2text.pdf2text(fn)

  const res = {}
  res.name = pref
  if (!parseV1(res, txt)) {
    console.log('cant parse V1')
    // process.exit(1)
    return
  }
  res.src_url = url
  res.url_opendata = urlWeb
  console.log(res)

  //util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.html', html, 'utf-8')
  //util.writeFileSync('../data/covid19' + lpref + '/latest.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
