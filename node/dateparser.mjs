import util from './util.mjs'

const exports = {}

// 令和2年2月27日 -> 2020-02-27 or null
exports.parseDate = function(s) {
  s = util.toHalf(s)
  const num = s.match(/令和(\d+)年(\d+)月(\d+)日/)
  if (!num)
    return null
  const y = 2018 + parseInt(num[1])
  const m = parseInt(num[2])
  const d = parseInt(num[3])
  return y + "-" + util.fix0(m, 2) + "-" + util.fix0(d, 2)
}

export default exports
