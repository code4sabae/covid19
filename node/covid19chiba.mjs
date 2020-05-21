import util from './util.mjs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import dateparser from './dateparser.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const main = async function () {
  const pref = 'Chiba'
  const url = 'https://www.pref.chiba.lg.jp/shippei/press/2019/ncov-index.html'

  const html = await (await fetch(url)).text()
  const dom = cheerio.load(html)
  const base = dom('.tmp_contents')[0]
  let dt = null
  dom('h2', null, base).each((idx, ele) => {
    const txt = dom(ele).text()
    if (txt.indexOf('千葉県内で確認された感染者数') >= 0) {
      dt = dateparser.parseDate(txt)
    }
  })
  let data = null
  dom('table', null, base).each((idx, ele) => {
    if (data) { return }
    data = []
    dom('th', null, ele).each((idx, ele) => {
      data.push(dom(ele).text().trim())
    })
    dom('td', null, ele).each((idx, ele) => {
      data.push(dom(ele).text().trim())
    })
  })
  console.log(data)
  console.log(dt)
  // const chk = ['検査実施人数', '陽性者数', '現在の感染者数', '退院・療養終了', '死亡']
  const chk = [
    '陽性者数\n            （累積）',
    '現在の感染者数',
    '退院・療養終了',
    '死亡'
  ]
  for (let i = 0; i < chk.length; i++) {
    if (!data[i].startsWith(chk[i])) {
      console.log('****!! err cant parse data')
      process.exit(1)
    }
  }
  const res = {}
  res.name = pref
  try {
    res.lastUpdate = dt
    res.npatients = parseInt(data[4])
    res.nexits = parseInt(data[6])
    res.ndeaths = parseInt(data[7])
    /*
    res.npatients = parseInt(data[6])
    res.nexits = parseInt(data[8])
    res.ndeaths = parseInt(data[9])
    */
   res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
    /*
    res.ncurrentpatients_hospital = parseInt(data[7])
    res.ncurrentpatients_hotel = parseInt(data[11])
    res.nheavycurrentpatients = parseInt(data[8])
    */
    res.src_url = res.url_opendata = url
  } catch (e) {
    console.log('error! can\'t parse', text, e)
    process.exit(1)
  }
  console.log(res)

  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/latest.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
