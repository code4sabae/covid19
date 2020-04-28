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

export default exports
