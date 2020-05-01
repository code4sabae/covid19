import cheerio from 'cheerio'

const exports = {}

exports.extractText = function(dom, tag, key) {
  let res = null
  dom(tag).each((idx, ele) => {
    if (res)
      return
    const text = dom(ele).text()
    if (text.indexOf(key) >= 0)
      res = text
  })
  return res
}
exports.extractTag = function(dom, tag, key) {
  let res = null
  dom(tag).each((idx, ele) => {
    if (res)
      return
    const text = dom(ele).text()
    if (text.indexOf(key) >= 0)
      res = dom(ele)
  })
  return res
}
exports.extractLink = function(dom, key) {
  let res = null
  dom('a').each((idx, ele) => {
    if (res)
      return
    const dome = dom(ele)
    const text = dome.text()
    if (text.indexOf(key) >= 0) {
      res = dome.attr('href')
    }
  })
  return res
}
exports.parseTHTD = function(dom, ele) {
  const lines = []
  dom('tr', null, ele).each((idx, tr) => {
    const line = []
    const parse = function(ele) {
      const atags = dom('a', null, ele)
      if (atags.length == 0) {
        const s = dom(ele).text()
        line.push(s.trim())
        return
      }
      atags.each((idx, a) => {
        const doma = dom(a)
        line.push(doma.attr('href') + " " + doma.text().trim())
      })
    }
    dom('th', null, tr).each((idx, th) => parse(th))
    dom('td', null, tr).each((idx, td) => parse(td))
    lines.push(line)
  })
  return lines
}
exports.parseTables = function(dom) { // aタグは 'URL text' としてパース
  const tbl = []
  const trim = function(s) {
    return s.replace(/\s/g, '')
  }
  dom('table').each((idx, ele) => {
    tbl.push(this.parseTHTD(dom, ele))
  })
  return tbl
}

exports.parseItemType = function (res, dom, ele) {
  const d = dom(ele)
  const itemtype = d.attr('itemtype')
  const body = {}
  dom(ele).find('[itemprop]').each((idx, ele) => {
    const d = dom(ele)
    const itemprop = d.attr('itemprop')
    let val = null
    if (d.attr('itemtype')) {
      val = {}
      exports.parseItemType(val, dom, ele)
    } else {
      const chk = [ 'href', 'datetime', 'src', 'content', 'value' ]
      for (const c of chk) {
        val = d.attr(c)
        if (val)
          break
      }
      if (!val)
        val = d.text()
    }
    body[itemprop] = val
  })
  if (res[itemtype]) {
    if (res[itemtype] instanceof Array) {
      res[itemtype].push(body)
    } else {
      res[itemtype] = [ res[itemtype], body ]
    }
  } else {
    res[itemtype] = body
  }
}
exports.parseItems = function (dom) {
  const res = {}
  dom('[itemtype]').each((idx, ele) => {
    exports.parseItemType(res, dom, ele)
  })
  return res
}
exports.parseItem = function (domOrHTML, filtertype) {
  let dom = domOrHTML
  if (typeof domOrHTML == 'string') {
    dom = cheerio.load(domOrHTML)
  }
  let res = null
  dom(`[itemtype="${filtertype}"]`).each((idx, ele) => {
    if (res) {
      return
    }
    res = {}
    exports.parseItemType(res, dom, ele)
  })
  if (!res) {
    return null
  }
  return res[filtertype]
}

export default exports
