import util from './util.mjs'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import dateparser from './dateparser.mjs'

const date2s = function (datetime) {
  return datetime.replace(/:|-/g, '')
}

const main = async function () {
  const pref = 'Saitama'
  const url = 'https://www.pref.saitama.lg.jp/a0701/shingatacoronavirus.html'

  const html = await (await fetch(url)).text()
  const dom = cheerio.load(html)
  let text = ''
  dom('.outline').each((idx, ele) => {
    text += dom(ele).text()
  })
  text = text.replace(/\s/g, '')
  console.log(text)

  const res = {}
  res.name = pref
  try {
    res.npatients = parseInt(text.match(/県内の陽性確認者数：(\d+)人/)[1])
    res.lastUpdate = dateparser.parseDate(text.match(/\((\d+月\d+日)公表分/)[1])
    res.nexits = parseInt(text.match(/退院・療養終了：(\d+)人/)[1])
    res.ndeaths = parseInt(text.match(/死亡：(\d+)人/)[1])
    res.ncurrentpatients = res.npatients - res.nexits - res.ndeaths
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
