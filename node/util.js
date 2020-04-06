const fs = require('fs')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')

exports.simplejson2txt = function(json) {
  if (typeof json == 'string') {
    json = JSON.parse(json)
  }
  const res = []
  for (const name in json) {
    res.push(name)
    res.push(json[name])
  }
  res.splice(0, 0, res.length / 2)
  res.push('')
  return res.join('\r\n')
}
exports.decodeCSV = function(s) {
	const res = []
	let st = 0
	let line = []
	let sb = null
	if (!s.endsWith("\n"))
		s += "\n"
	const len = s.length
	for (let i = 0; i < len; i++) {
		let c = s.charAt(i)
		if (c == '\r')
			continue
		if (st == 0) {
			if (c == '\n') {
				if (line.length > 0)
					line.push("")
				res.push(line)
				line = []
			} else if (c == ',') {
				line.push("")
			} else if (c == '"') {
				sb = ""
				st = 2
			} else {
				sb = c
				st = 1
			}
		} else if (st == 1) {
			if (c == '\n') {
				line.push(sb)
				res.push(line)
				line = []
				st = 0
				sb = null
			} else if (c == ',') {
				line.push(sb)
				sb = null
				st = 0
			} else {
				sb += c
			}
		} else if (st == 2) {
			if (c == '"') {
				st = 3
			} else {
				sb += c
			}
		} else if (st == 3) {
			if (c == '"') {
				sb += c
				st = 2
			} else if (c == ',') {
				line.push(sb)
				sb = null
				st = 0
			} else if (c == '\n') {
				line.push(sb)
				res.push(line)
				line = []
				st = 0
				sb = null
			}
		}
	}
	if (sb != null)
		line.push(sb)
	if (line.length > 0)
		res.push(line)
	return res
}
exports.convertCSVtoArray = exports.decodeCSV

exports.encodeCSV = function(csvar) {
  let s = []
  for (let i = 0; i < csvar.length; i++) {
    let s2 = []
    const line = csvar[i]
    for (let j = 0; j < line.length; j++) {
      const v = line[j]
      if (v == undefined || v.length == 0) {
        s2.push("")
      } else if (parseInt(v) == v) {
        s2.push(v)
      } else if (v.indexOf('"') >= 0) {
        s2.push('"' + v.replace(/\"/g, '""') + '"')
      } else {
        s2.push('"' + v + '"')
      }
    }
    s.push(s2.join(','))
  }
  return s.join('\n')
}
exports.csv2json = function(csv) {
	const res = []
	const head = csv[0]
	for (let i = 1; i < csv.length; i++) {
		const d = {}
		for (let j = 0; j < head.length; j++) {
			d[head[j]] = csv[i][j]
		}
		res.push(d)
	}
	return res
}
exports.json2csv = function(json) {
  if (!Array.isArray(json)) {
    throw 'is not array! at json2csv'
  }
  const head = []
  for (const d of json) {
    for (const name in d) {
      if (head.indexOf(name) == -1) {
        head.push(name)
      }
    }
  }
  const res = [ head ]
  for (const d of json) {
    const line = []
    for (let i = 0; i < head.length; i++) {
      const v = d[head[i]]
      if (v == undefined) {
        line.push('')
      } else {
        line.push(v)
      }
    }
    res.push(line)
  }
  return res
}

exports.writeCSV = function(fnbase, csvar) {
  const s = this.encodeCSV(csvar)
  fs.writeFileSync(fnbase + '.csv', s, 'utf-8')
  fs.writeFileSync(fnbase + '.sjis.csv', iconv.encode(s, 'ShiftJIS'))
  fs.writeFileSync(fnbase + '.json', JSON.stringify(this.csv2json(csvar)))
}
exports.readCSV = function(fnbase) {
  try {
    const data = fs.readFileSync(fnbase + '.csv', 'utf-8')
    const csv = this.decodeCSV(data)
    return csv
  } catch (e) {
    const data = fs.readFileSync(fnbase + '.json', 'utf-8')
    const json = JSON.parse(data)
    return this.json2csv(json)
  }
}
exports.fix0 = function(n, beam) {
  const s = "000000000" + n
  return s.substring(s.length - beam)
}
exports.formatYMDHMS = function(t) {
  const fix0 = exports.fix0
  return t.getFullYear() + "-" + fix0(t.getMonth() + 1, 2) + "-" + fix0(t.getDate(), 2) + "T" + fix0(t.getHours(), 2) + ":" + fix0(t.getMinutes(), 2) + ":" + fix0(t.getSeconds(), 2)
}
exports.getYMDHMS = function() {
  const t = new Date()
  const fix0 = exports.fix0
  return t.getFullYear() + fix0(t.getMonth() + 1, 2) + fix0(t.getDate(), 2) + fix0(t.getHours(), 2) + fix0(t.getMinutes(), 2) + fix0(t.getSeconds(), 2)
}
exports.getYMDH = function() {
  const t = new Date()
  const fix0 = exports.fix0
  return t.getFullYear() + fix0(t.getMonth() + 1, 2) + fix0(t.getDate(), 2) + fix0(t.getHours(), 2)
}
exports.getYMD = function() {
  const t = new Date()
  const fix0 = exports.fix0
  return t.getFullYear() + fix0(t.getMonth() + 1, 2) + fix0(t.getDate(), 2)
}
exports.cutNoneN = function(s) {
  s = exports.toHalf(s)
  const n = parseInt(s.replace(/[^\d]/g, ""))
  if (isNaN(n))
    return 0
  return n
}
exports.toHalf = function(s) {
  const ZEN = "０１２３４５６７８９（）／"
  const HAN = "0123456789()/"
  let s2 = ""
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i)
    const n = ZEN.indexOf(c)
    if (n >= 0) {
      s2 += HAN.charAt(n)
    } else {
      s2 += c
    }
  }
  return s2
}
exports.toHalfNumber = function(s) {
  const ZEN = "０１２３４５６７８９"
  const HAN = "0123456789"
  let s2 = ""
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i)
    const n = ZEN.indexOf(c)
    if (n >= 0) {
      s2 += HAN.charAt(n)
    } else {
      s2 += c
    }
  }
  return s2
}
exports.mkdirSyncForFile = function(fn) {
  const dirs = fn.split('/')
  let dir = ""
  for (let i = 0; i < dirs.length - 1; i++) {
    dir += dirs[i] + "/"
    try {
      fs.mkdirSync(dir, 0744)
    } catch (e) {
    }
  }
}
exports.getExtFromURL = function(url) {
  let ext = ".txt"
  const n = url.lastIndexOf('/')
  const webfn = url.substring(n)
  const m = webfn.lastIndexOf('.')
  if (m >= 0) {
    ext = webfn.substring(m)
  }
  return ext
}
exports.fetchText = async function(url, enc) {
  if (!enc) {
    return await (await fetch(url)).text()
  }
  const abuf = await (await fetch(url)).arrayBuffer()
  var buf = new Buffer.from(abuf, 'binary')
  return iconv.decode(buf, enc)
}
exports.getWebWithCache = async function(url, path, cachetime, enc) {
  const ext = exports.getExtFromURL(url)
  const fnlatest = path + "_latest" + ext
  const fn = path + exports.getYMDHMS() + ext
  let cache = null
  //console.log(fn, cachetime)
  try {
    const modtime = fs.statSync(fnlatest).mtime
    const dt = new Date().getTime() - new Date(modtime).getTime()
    //console.log(dt, new Date(modtime).getTime(), new Date().getTime())
    cache = fs.readFileSync(fnlatest, 'utf-8')
    if (!cachetime || dt < cachetime) {
      //console.log("use cache")
      return cache
    }
  } catch (e) {
  }
  let data = null
  try {
    data = await exports.fetchText(url, enc)
  } catch (e) {
    console.log(e)
  }
  if (data == cache) {
    //console.log("same as cache")
    //fs.writeFileSync(fnlatest, data)
    return cache
  }
  //console.log("use original")
  try {
    fs.writeFileSync(fnlatest, data)
    fs.writeFileSync(fn, data)
  } catch (e) {
    exports.mkdirSyncForFile(fn)
    fs.writeFileSync(fnlatest, data)
    fs.writeFileSync(fn, data)
  }
  //console.log("write", fn)
  return data
}
exports.getCache = async function(asyncfetch, path, ext, cachetime) {
  const fnlatest = path + "_latest" + ext
  const fn = path + exports.getYMDHMS() + ext
  let cache = null
  //console.log(fn, cachetime)
  try {
    const modtime = fs.statSync(fnlatest).mtime
    const dt = new Date().getTime() - new Date(modtime).getTime()
    //console.log(dt, new Date(modtime).getTime(), new Date().getTime())
    cache = fs.readFileSync(fnlatest, 'utf-8')
    if (!cachetime || dt < cachetime) {
      //console.log("use cache")
      return cache
    }
  } catch (e) {
  }
  let data = null
  try {
    data = await asyncfetch()
  } catch (e) {
    console.log('asyncfetch err', e)
  }
  if (!data) {
    //console.log("can't fetch or convert")
    return cache
  }
  if (data == cache) {
    //console.log("same as cache")
    //fs.writeFileSync(fnlatest, data)
    return cache
  }
  //console.log("use original")
  try {
    fs.writeFileSync(fnlatest, data)
    fs.writeFileSync(fn, data)
  } catch (e) {
    exports.mkdirSyncForFile(fn)
    fs.writeFileSync(fnlatest, data)
    fs.writeFileSync(fn, data)
  }
  //console.log("write", fn)
  return data
}
exports.getLastUpdateOfCache = function(url, path) {
  const fnlatest = path + "_latest" + exports.getExtFromURL(url)
  try {
    const modtime = fs.statSync(fnlatest).mtime
    const d = new Date(modtime)
    return exports.formatYMDHMS(d)
  } catch (e) {
  }
  return null
}

exports.JAPAN_PREF = [ "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県" ]
exports.JAPAN_PREF_EN = [ "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa" ]

exports.makeURL = function(url, relurl) {
  if (relurl.startsWith("http://") || relurl.startsWith("https://"))
    return relurl
  if (relurl.indexOf("..") >= 0) {
    throw "not supported '..' utils.makeURL"
  }
  if (relurl.startsWith('/')) {
    const n = url.indexOf('/', 8)
    if (n >= 0)
      url = url.substring(0, n)
    return url + relurl
  }
  const n = url.substring(8).lastIndexOf('/')
  if (n < 0)
    return url + "/" + relurl
  return url.substring(0, n + 8 + 1) + relurl
}
exports.test = function(t1, t2) {
  if (t1 == t2)
    return
  console.log(t1, t2)
  throw 'err on util.test'
}
const test = async function() {
  console.log(exports.formatYMDHMS(new Date()))
  exports.test(exports.makeURL('http://sabae.cc/', 'test.html'), 'http://sabae.cc/test.html')
  exports.test(exports.makeURL('https://sabae.cc/', 'test.html'), 'https://sabae.cc/test.html')
  exports.test(exports.makeURL('https://sabae.cc', 'test.html'), 'https://sabae.cc/test.html')
  exports.test(exports.makeURL('https://sabae.cc/', 'https://jig.jp/'), 'https://jig.jp/')
  exports.test(exports.makeURL('https://sabae.cc/abc/test.html', '/img/'), 'https://sabae.cc/img/')
}

if (require.main === module) {
//  test()
  for (let i = 0; i < this.JAPAN_PREF.length; i++) {
    console.log((i + 1) + '\t' + this.JAPAN_PREF[i] + "\t" + this.JAPAN_PREF_EN[i])
  }
} else {
}
