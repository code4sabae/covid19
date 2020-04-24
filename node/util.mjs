import fs from 'fs'
import fetch from 'node-fetch'
import iconv from 'iconv-lite'
import cheerio from 'cheerio'

const exports = {}

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

exports.encodeCSV = function(csvar) {
  let s = []
  for (let i = 0; i < csvar.length; i++) {
    let s2 = []
    const line = csvar[i]
    for (let j = 0; j < line.length; j++) {
      const v = line[j]
      if (v == undefined || v.length == 0) {
        s2.push("")
      } else if (typeof v == 'number') {
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
	for (let i = 0; i < head.length; i++) {
		const h = head[i]
		const n = h.indexOf('(')
		const m = h.indexOf('（')
		let l = -1
		if (n == -1) {
			l = m
		} else if (m == -1) {
			l = n
		} else {
			l = Math.min(n, m)
		}
		head[i] = (l > 0 ? h.substring(0, l) : h).trim()
	}
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
exports.addBOM = function(s) {
  return '\ufeff' + s
}
exports.writeCSV = function(fnbase, csvar) {
  const s = this.encodeCSV(csvar)
  //const bom = new Uint8Array([ 0xEF, 0xBB, 0xBF ]) // add BOM
  //fs.writeFileSync(fnbase + '.csv', bom)
  fs.writeFileSync(fnbase + '.csv', this.addBOM(s), 'utf-8')
  //fs.writeFileSync(fnbase + '.sjis.csv', iconv.encode(s, 'ShiftJIS'))
  fs.writeFileSync(fnbase + '.json', JSON.stringify(this.csv2json(csvar)))
}
exports.readCSV = function(fnbase) {
  try {
    let data = fs.readFileSync(fnbase + '.csv', 'utf-8')
    if (data.charCodeAt(0) == 0xfeff) {
      data = data.substring(1)
    }
    const csv = this.decodeCSV(data)
    return csv
  } catch (e) {
    const data = fs.readFileSync(fnbase + '.json', 'utf-8')
    const json = JSON.parse(data)
    return this.json2csv(json)
  }
}
exports.readJSONfromCSV = function(fn) {
  try {
    let data = fs.readFileSync(fn, 'utf-8')
    if (data.charCodeAt(0) == 0xfeff) {
      data = data.substring(1)
    }
    const csv = this.decodeCSV(data)
    return this.csv2json(csv)
  } catch (e) {
    console.log(e)
    return []
  }
}
exports.writeCSVfromJSON = function(fn, json) {
  const csv = this.json2csv(json)
  const data = this.addBOM(this.encodeCSV(csv))
  this.writeFileSync(fn, data, 'utf-8')
}
exports.fix0 = function(n, beam) {
  const s = "000000000" + n
  return s.substring(s.length - beam)
}
exports.formatYMDHMS = function(t) {
  if (!t)
    t = new Date()
  const fix0 = exports.fix0
  return t.getFullYear() + "-" + fix0(t.getMonth() + 1, 2) + "-" + fix0(t.getDate(), 2) + "T" + fix0(t.getHours(), 2) + ":" + fix0(t.getMinutes(), 2) + ":" + fix0(t.getSeconds(), 2)
}
exports.formatYMD = function(t) {
  if (!t)
    t = new Date()
  const fix0 = exports.fix0
  return t.getFullYear() + "-" + fix0(t.getMonth() + 1, 2) + "-" + fix0(t.getDate(), 2)
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
  if (s === null || s === undefined)
    return s
  const ZEN = "０１２３４５６７８９（）／ー！＆：　ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
  const HAN = "0123456789()/-!&: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
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
      fs.mkdirSync(dir, 0o0744)
    } catch (e) {
    }
  }
}
exports.writeFileSync = function(fn, data, enc) {
  this.mkdirSyncForFile(fn)
  fs.writeFileSync(fn, data, enc)
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
exports.getHistogram = function(s) {
  const chs = {}
  for (const c of s) {
    if (!chs[c.charCodeAt(0)])
      chs[c.charCodeAt(0)] = 1
    else
      chs[c.charCodeAt(0)]++
  }
  const ar = []
  for (const c in chs) {
    ar.push([ c, chs[c] ])
  }
  ar.sort((a, b) => b[1] - a[1])
  return ar
}
exports.fetchTextWithLastModified = async function(url, enc, debug) {
  const res = await fetch(url)
  let lastUpdate = null
  if (res.status != 200)
    return null
  if (debug)
    console.log(res, res.status, res.headers)
  const s = res.headers.get('last-modified')
  if (s) {
    lastUpdate = this.formatYMDHMS(new Date(s))
  }
  const abuf = await res.arrayBuffer()
  if (!enc) {
    //const text = String.fromCharCode.apply(null, new Uint8Array(abuf)) // await res.text()
    const text = new TextDecoder().decode(abuf)
    //console.log(this.getHistogram(text))
    // console.log(String.fromCharCode(65533))
    if (text.indexOf(String.fromCharCode(65533)) == -1) {
      return [ text, lastUpdate ]
    }
    enc = 'ShiftJIS'
  }
  const buf = new Buffer.from(abuf, 'binary')
  return [ iconv.decode(buf, enc), lastUpdate ]
}
exports.fetchText = async function(url, enc) {
  const [ text, lastUpdate ] = await this.fetchTextWithLastModified(url, enc)
  return text
}

// parse HTML
exports.parseTagsFromHTML = function(html, tag, key) {
  const dom = cheerio.load(html)
  const res = []
  dom(tag).each((idx, ele) => {
    const text = dom(ele).text()
    if (!key || text.indexOf(key) >= 0)
      res.push(text)
  })
  return res
}
exports.parseTablesFromHTML = function(html) {
  const dom = cheerio.load(html)
  const tbl = []
  const extract = function(ele) {
    const atag = dom('a', null, ele)
    if (!atag)
      return dom(ele).text().trim()
    return dom(atag[0]).attr('href')
  }
  const tbls = []
  dom('table', null, null).each((idx, div) => {
    const lines = []
    dom('tr', null, div).each((idx, dl) => {
      const line = []
      dom('th', null, dl).each((idx, ele) => line.push(extract(ele)))
      dom('td', null, dl).each((idx, ele) => line.push(extract(ele)))
      lines.push(line)
    })
    tbls.push(lines)
  })
  return tbls
}
exports.parseDLsFromHTML = function(html) {
  const dom = cheerio.load(html)
  const tbl = []
  const extract = function(ele) {
    const ch = dom(ele).children()
    if (ch.length == 0)
      return dom(ele).text()
    const c = ch[0]
    console.log(c)
    if (c.type == 'tag' && c.name == 'iframe') {
      return dom(c).attr('src')
    }
    //process.exit(0)
    return dom(ele).text()
  }
  const tbls = []
  dom('div', null, null).each((idx, div) => {
    const lines = []
    dom('dl', null, div).each((idx, dl) => {
      const line = []
      dom('dt', null, dl).each((idx, ele) => line.push(extract(ele)))
      dom('dd', null, dl).each((idx, ele) => line.push(extract(ele)))
      lines.push(line)
    })
    tbls.push(lines)
  })
  return tbls
}
exports.fetchCSVtoJSON = async url => exports.csv2json(exports.decodeCSV(await exports.fetchText(url)))
exports.sleep = async msec => new Promise(resolve => setTimeout(resolve, msec))
exports.copyJSON = d => JSON.parse(JSON.stringify(d))
exports.setJSON = function(dst, src) {
  for (const name in src) {
    dst[name] = src[name]
  }
  return dst
}
exports.splitString = function(s, splitters) {
  const res = []
  let n = 0
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i)
    if (splitters.indexOf(c) >= 0) {
      if (i > n)
        res.push(s.substring(n, i))
      n = i + 1
    }
  }
  if (n < s.length)
    res.push(s.substring(n))
  return res
}

const main = async function() {
  
}
if (process.argv[1].endsWith('/exports.mjs')) {
  main()
  /*
  const test = [ [ '"abc"', '"', '""', '"""', 'a""b' ] ]
  const enc = exports.encodeCSV(test)
  console.log(enc)
  const dec = exports.decodeCSV(enc)
  console.log(dec)
  */
}

export default exports
