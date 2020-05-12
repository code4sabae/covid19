import util from './util.mjs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import dateparser from './dateparser.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const main = async function () {
  const pref = 'Akita'
  const url = 'https://www.pref.akita.lg.jp/pages/archive/47957'

  const html = await (await fetch(url)).text()
  const dom = cheerio.load(html)
  let dt = null
  dom('p').each((idx, ele) => {
    const txt = dom(ele).text()
    if (txt.startsWith('〇陽性者の現在の状況')) {
      dt = dateparser.parseDate(txt)
    }
  })
  let data = null
  dom('table').each((idx, ele) => {
    if (data) { return }
    data = []
    dom('td', null, ele).each((idx, ele) => {
      data.push(dom(ele).text())
    })
  })
  console.log(data)
  console.log(dt)
  const chk = ['陽性者累計', '入院者数', 'うち重症者数', '死亡者数', '退院者数', '宿泊療養者数']
  for (let i = 0; i < chk.length; i++) {
    if (chk[i] !== data[i]) {
      console.log('****!! err cant parse data')
      process.exit(1)
    }
  }
  const res = {}
  res.name = pref
  try {
    res.npatients = parseInt(data[6])
    res.lastUpdate = dt
    res.nexits = parseInt(data[10])
    res.ndeaths = parseInt(data[9])
    res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
    res.ncurrentpatients_hospital = parseInt(data[7])
    res.ncurrentpatients_hotel = parseInt(data[11])
    res.nheavycurrentpatients = parseInt(data[8])
    res.src_url = res.url_opendata = url
  } catch (e) {
    console.log('error! can\'t parse', text, e)
    process.exit(1)
  }

  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/latest.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
