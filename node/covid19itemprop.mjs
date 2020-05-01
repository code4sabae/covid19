import util from './util.mjs'
import fetch from 'node-fetch'
import htmlparser from './htmlparser.mjs'

const main = async function () {
  const url = 'https://www.pref.saitama.lg.jp/a0701/shingatacoronavirus.html'

  // const html = await (await fetch(url)).text()
  const html = util.readFileSync('../data/covid19saitama/sample.html', 'utf-8') // sample

  const res = htmlparser.parseItem(html, 'https://wvw.stopcovid19.jp/schema/')
  res.src_url = res.url_opendata = url
  console.log(res)
  return

  const lpref = pref.toLowerCase()
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/latest.html', html, 'utf-8')
  util.writeFileSync('../data/covid19' + lpref + '/' + date2s(res.lastUpdate) + '.json', JSON.stringify(res))
  // util.writeFileSync('../data/covid19' + lpref + '/latest.csv', util.addBOM(scsv))
  util.writeFileSync('../data/covid19' + lpref + '/latest.json', JSON.stringify(res))
}
main()
