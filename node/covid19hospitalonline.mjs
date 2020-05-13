import util from './util.mjs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import fs from 'fs'
import pdf2csv from './pdf2csv.mjs'

const extractLinks = function(dom, base) {
  const res = []
  dom('a', null, base).each((idx, ele) => {
    const dome = dom(ele)
    res.push({
      text: dome.text(),
      link: dome.attr('href'),
    })
  })
  return res
}
const fetchAndSave = async function(url, fn) {
  const data = await (await fetch(url)).arrayBuffer()
  console.log(data)
  const temp = new Date().getTime() + ".xlsx"
  fs.writeFileSync(fn, new Buffer.from(data), 'binary')
  return fn
}
const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))

const dstpath = 'temp/mhlwgojp/hospital/'

const fetchPDFs = async function() {
  const url = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/rinsyo/index_00014.html'
  const fn = 'temp/mhlw-hospitals.html'
  const html = await (await fetch(url)).text()
  fs.writeFileSync(fn, html, 'utf-8')
  //console.log(html)

  const dom = cheerio.load(html)
  const ul = dom('.m-listLink--hCol2')[0]
  const links = extractLinks(dom, ul)
  console.log(links)
  for (const l of links) {
    const urlpdf = 'https://www.mhlw.go.jp/' + l.link
    console.log(l)
    await fetchAndSave(urlpdf, dstpath + l.text + '.pdf')
    await sleep(3000)
  }
}
const renamePDFs = async function() { // 日本語ファイル名ではだめだった
  const prefcsv = 'https://code4fukui.github.io/localgovjp/prefjp-utf8.csv'
  const prefdata = await util.fetchCSVtoJSON(prefcsv)
  console.log(prefdata)
  const list = fs.readdirSync(dstpath)
  // rename
  for (const f of list) {
    if (f.endsWith('.pdf')) {
      const pref = f.substring(0, f.length - 4)
      const p = prefdata.find(e => e.pref == pref)
      if (p) {
        const prefen = p.pref_en.toLowerCase()
        console.log("rename", pref, p.pref_en)
        fs.renameSync(dstpath + f, dstpath + prefen + ".pdf")
      }
    }
    /*
    if (f.endsWith('.csv')) { // 拡張子間違えたので変更
      fs.renameSync(dstpath + f, dstpath + f.substring(0, f.length - 4) + ".pdf")
    }
    */
  }
}
// 変換、1時間10分
const convertPDF2CSV = async function() {
  console.log(new Date())
  const list = fs.readdirSync(dstpath)
  for (const f of list) {
    if (f.endsWith('.pdf')) {
      console.log(f)
      await pdf2csv.pdf2csv(dstpath + f)
    }
  }
  console.log(new Date())
}
const makeCSV = function() {
  // pdftotext temp/aichi-p12.pdf > temp/aichi-p12.txt
  const ss = fs.readFileSync('temp/aichi-p12.txt', 'utf-8').split('\n')
  console.log(ss)
  const res = []
  let state = 0
  let line = null
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i]
    if (s == '病院' || s == '診療所') {
      if (line) {
        res.push(line)
      }
      line = []
      line.push(s)
      state = 1
    } else if (s.length > 0) {
      let s2 = s
      for (let j = i + 1; j < ss.length; j++, i++) {
        if (ss[j].length == 0) {
          break
        }
        s2 += '\n' + ss[j]
      }
      line.push(s2)
    }
  }
  res.push(line)
  console.log(res)

  fs.writeFileSync('temp/aichi-p12.csv', util.addBOM(util.encodeCSV(res)))
  // 手作業で、テーブル修正 aichi-p12-3.csv
// aichi 12 v, chiba 12 v
// fukuoka 11 , 12 v
// kagawa16 v, yamanashi 8 v

// fukuoka 6
// hokkaido 7
// kagoshima 4
// kanagawa 21
// niigata 5
// oita 4
// osaka 8, 10, 12, 14, 15, 17, 19, 20, 24

}
const joinCSVs = function(prefen, prefja) {
  const res = []
  try {
    for (let i = 1;; i++) {
      const scsv = util.removeBOM(fs.readFileSync('temp/mhlwgojp/hospital/' + prefen + '.pdf-' + i + '.csv', 'utf-8'))
      const csv = util.decodeCSV(scsv)
      res.push(csv)
      //console.log(csv)
    }
  } catch (e) {
  }
  const res2 = res.flat()
  //console.log(res, res.length, res2.length)
  //console.log(prefen, res.length, res2.length)
  fs.writeFileSync('temp/mhlwgojp/join/' + prefen + '.csv', util.addBOM(util.encodeCSV(res2)))
  return res
}
const main = async function() {
  const prefcsv = 'https://code4fukui.github.io/localgovjp/prefjp-utf8.csv'
  const prefdata = await util.fetchCSVtoJSON(prefcsv)
  const all = []
  for (const p of prefdata) {
    const prefen = p.pref_en.toLowerCase()
    const res = joinCSVs(prefen, p.pref)
    all.push({ name: prefen, csv: res })
  }
  all.sort((a, b) => util.sortByString(a.name, b.name))
  for (const p of all) {
    console.log(p.name, p.csv.length, p.csv.flat().length)
  }
}

main()
