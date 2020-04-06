const fs = require('fs')
const fetch = require('node-fetch')
const util = require('./util.js')
const jimp = require("jimp")
const img2text = require('./img2text.js')

const CACHE_TIME = 10 * 1000 // 10min
const PATH = 'data/covid19tokyo/'
const URL = 'https://stopcovid19.metro.tokyo.lg.jp/data/130001_tokyo_covid19_patients.csv'

// 2020年4月3日, 午前11時33分 (UTC+09:00)
const parseDate = function(s) {
  s = util.toHalf(s)
  const fix0 = util.fix0
  let num = s.match(/(\d+)年(\d+)月(\d+)日.*(午前|午後)(\d+)時(\d+)分.+UTC(\+|\-)(\d+):(\d+)/)
  if (num) {
    const y = parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    const afternoon = num[4] == '午後'
    let h = parseInt(num[5]) + (afternoon ? 12 : 0)
    let min = parseInt(num[6])

    const d1 = new Date()
    d1.setFullYear(y)
    d1.setMonth(m - 1)
    d1.setDate(d)
    d1.setHours(h)
    d1.setMinutes(min)
    d1.setSeconds(0)
    d1.setMilliseconds(0)
    let t = d1.getTime()
    const utcplus = num[7] == '+'
    const utch = parseInt(num[8]) * (utcplus ? 1 : -1)
    const utcm = parseInt(num[9]) * (utcplus ? 1 : -1)
    const utcdt = ((utch * 60 + utcm) * 60) * 1000
    t += utcdt
    const d2 = new Date(t)
    return d2.getFullYear() + "-" + fix0(d2.getMonth() + 1, 2) + "-" + fix0(d2.getDate(), 2) + "T" + fix0(d2.getHours(), 2) + ":" + fix0(d2.getMinutes(), 2)
  }
  return "--"
}
//console.log(parseDate('2020年4月3日, 午前11時33分 (UTC+09:00)'))
//console.log(parseDate('2020年4月3日, 午前11時33分 (UTC+09:55)'))
//return

const img2num = async function(img) {
  let res = 0
  await cropImages(img, async function(img) {
    const n = await croppedimg2num(img)
    res = res * 10 + n
  })
  return res
}
let numimg = null
const croppedimg2num = async function(img) {
  if (numimg == null) {
    numimg = []
    for (let i = 0; i < 10; i++) {
      numimg[i] = await jimp.read('numimg/n' + i + '.png')
      numimg[i].resize(16, 16)
    }
  }
  const pixel2num = function(n) {
    const r = (n >> 24) & 0xff
    const g = (n >> 16) & 0xff
    const b = (n >> 8) & 0xff
    return (r + g + b) / (256 * 3)
  }
  const chk = function(img1, img2) {
    let n = 0
    for (let i = 0; i < img1.bitmap.width && i < img2.bitmap.width; i++) {
      for (let j = 0; j < img1.bitmap.height && j < img2.bitmap.height; j++) {
        const n1 = pixel2num(img1.getPixelColor(i, j))
        const n2 = pixel2num(img2.getPixelColor(i, j))
        n += Math.abs(n1 - n2)
      }
    }
    return n
  }
  let min = 1 << 30
  let nmin = 0
  img.resize(numimg[0].bitmap.width, numimg[0].bitmap.height)
  for (let i = 0; i < numimg.length; i++) {
    const n = chk(img, numimg[i])
    //console.log(i, n)
    if (n < min) {
      min = n
      nmin = i
    }
  }
  return nmin
}

const makeNumImage = async function(img) {
  let cnt = 0
  await cropImages(img, async function(img) {
    imgc.write('temp/num' + cnt++ + '.png')
    console.log(cnt)
  })
}

const cropImages = async function(img, asynccallback) {
  const n = img.getPixelColor(0, 0)
  const WHITE = 0xffffffff // RGBA (A=0xff 不透明)
  //console.log(n.toString(16)) // 0xffffffff // RGBA (A=0xff 不透明)
  let miny = 0
  A: for (let i = 0; i < img.bitmap.height; i++) {
    for (let j = 0; j < img.bitmap.width; j++) {
      let n = img.getPixelColor(j, i)
      if (n != WHITE) {
        miny = i
        break A
      }
    }
  }
  let maxy = 0
  B: for (let i = img.bitmap.height - 1; i >= miny; i--) {
    for (let j = 0; j < img.bitmap.width; j++) {
      let n = img.getPixelColor(j, i)
      if (n != WHITE) {
        maxy = i
        break B
      }
    }
  }
  let x = 0
  for (;;) {
    let x1 = -1
    A: for (; x < img.bitmap.width; x++) {
      for (let i = miny; i <= maxy; i++) {
        let n = img.getPixelColor(x, i)
        if (n != WHITE) {
          x1 = x
          break A
        }
      }
    }
    if (x1 < 0) {
      break
    }
    let x2 = img.bitmap.width - 1
    for (x++; x < img.bitmap.width; x++) {
      let flg = 0
      for (let i = miny; i <= maxy; i++) {
        let n = img.getPixelColor(x, i)
        flg += n != WHITE ? 1 : 0
      }
      if (!flg) {
        x2 = x
        break
      }
    }
    const imgc = img.clone()
    imgc.crop(x1, miny, (x2 - x1) + 1, (maxy - miny) + 1)
    await asynccallback(imgc)
  }
// return cnt
}

const DEBUG = true
const getPatientsTokyo = async function(fn) {
  const towns = [
    '千代田', '中央', '港', '新宿', '文京', '台東', '墨田', '江東', '品川', '目黒', '大田',
    '世田谷', '渋谷', '中野', '杉並', '豊島', '北', '荒川', '板橋', '練馬', '足立', '葛飾',
    '江戸川', '八王子', '立川', '武蔵野', '三鷹', '青梅', '府中', '昭島', '調布', '町田', '小金井',
    '小平', '日野', '東村山', '国分寺', '国立', '福生', '狛江', '東大和', '清瀬', '東久留米', '武蔵村山',
    '多摩', '稲城', '羽村', 'あきる野', '西東京', '瑞穂', '日の出', '檜原', '奥多摩', '大島', '利島',
    '新島', '神津島', '三宅', '御蔵島', '八丈', '青ヶ島', '小笠原', '都外', '調査中'
  ]
  const jpg = await jimp.read(fn)
  let res = []
  for (let i = 0; i < 11 * 6 - 2; i++) {
    const x = 26 + 66 * (i % 11)
    const y = 50 + 52 * Math.floor(i / 11)
    const w = 60
    const h = 24
    const imgc = jpg.clone()
    imgc.crop(x, y, w, h)
    //const text = await img2text.img2text(imgc, DEBUG)
    const num = await img2num(imgc)
    //imgc.write('temp/' + i + '.png')
    res.push({ name_ja: towns[i], npatients: num })
  }
  return res
}

const checkJSON = function(json) {
  const names = {}
  for (const d of json) {
    for (const n in d) {
      if (names[n] == null) {
        names[n] = []
      }
      const val = d[n]
      if (names[n].indexOf(val) == -1) {
        names[n].push(val)
      }
    }
  }
  console.log(names)
}
const makeTokyo = async function() {
  console.log(1)
  const scsv = await (await fetch(URL)).text()
  console.log(scsv)
  const csv = util.decodeCSV(scsv)
  const json = util.csv2json(csv)
  console.log(json)

  checkJSON(json)

  let cnt = 0
  const flglist = []
  for (const d of json) {
    const flg = d['退院済フラグ']
    if (flglist.indexOf(flg) == -1) {
      flglist.push(flg)
      console.log('flg: ', flg)
    }
    if (flg != 1) {
      cnt++
    }
  }
  /*
  const area = []
  const PREF = util.JAPAN_PREF_EN
  for (let i = 0; i < PREF.length; i++) {
    if (PREF
  }
  */
  console.log(json.length, cnt)
  const res = { name: 'Tokyo', patientscurrent: cnt, patients: json.length, src_url: URL }
}
const main = async function() {
  const fn = '../data/covid19tokyo/153-5.png' // 4/4
  //const fn = '../data/150-5.png' // 4/3
  const data = await getPatientsTokyo(fn)
  util.writeCSV('../data/covid19tokyo-detail', util.json2csv(data))
  console.log(data)
  
  //const img = await jimp.read('temp/47.png')
  //console.log(await img2num(img))
}
if (require.main === module) {
  main()
} else {
}
