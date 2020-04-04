const cheerio = require('cheerio')
const fetch = require('node-fetch')
const util = require('./util.js')
const fs = require('fs')

const PREF = util.JAPAN_PREF
const PREF_EN = util.JAPAN_PREF_EN

const URL = 'https://cio.go.jp/node/2581'

const parse = function(data) {
  const dom = cheerio.load(data)
  const res = {}
  let flg = false
  dom('article').each((idx, ele) => {
    if (flg)
      return
    const article = dom(ele)
    const h1 = article.find('h1')
    const title = h1.text()
    if (title != '東京都のオープンソースを活用した新型コロナウイルス感染症対策サイトの紹介')
      return
    res.lastUpdate = article.find('time').attr("datetime")

    res.title = title
    let npref = -1
    const list = []
    for (let i = 0; i < ele.children.length; i++) {
      const ele2 = ele.children[i]
      if (ele2.name == 'p') {
        const s = dom(ele2).text()
        const nextnpref = PREF.indexOf(s)
        if (nextnpref < 0 && npref >= 0) {
          list.push({ name: PREF_EN[npref], name_jp: PREF[npref], url: s })
        }
        npref = nextnpref
      }
    }
    res.area = list
  })
  return res
}

const main = async function() {
  const path = '../data/'
  const html = await (await fetch(URL)).text()
  console.log(html)
  const json = parse(html)
  console.log(json)
  fs.writeFileSync(path + 'covid19cio.json', JSON.stringify(json))

  const PREF = util.JAPAN_PREF
  for (let i = 0; i < PREF.length; i++) {
    let hit = ""
    for (const a of json.area) {
      if (PREF[i] == a.name_jp) {
        hit = a.url.trim()
        break
      }
    }
    console.log(hit)
  }
  /*
  const csv = util.json2csv(json)

  util.writeCSV(path + 'covid19cio', csv)
  console.log(res)
  */
}
if (require.main === module) {
  main()
} else {
}
