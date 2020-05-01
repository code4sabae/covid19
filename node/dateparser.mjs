import util from './util.mjs'

const exports = {}

// 令和2年2月27日 -> 2020-02-27 or null
exports.parseDate = function (s) {
  s = util.toHalf(s)
  let num = s.match(/令和(\d+)年(\d+)月(\d+)日/)
  if (num) {
    const y = 2018 + parseInt(num[1])
    const m = parseInt(num[2])
    const d = parseInt(num[3])
    return `${y}-${util.fix0(m, 2)}-${util.fix0(d, 2)}`
  }
  num = s.match(/(\d+)月(\d+)日(\d+):(\d+)/)
  if (num) {
    const y = new Date().getFullYear()
    const m = parseInt(num[1])
    const d = parseInt(num[2])
    const hour = parseInt(num[3])
    const min = parseInt(num[4])
    return `${y}-${util.fix0(m, 2)}-${util.fix0(d, 2)}T${util.fix0(hour, 2)}:${util.fix0(min, 2)}`
  }
  num = s.match(/(\d+)月(\d+)日/)
  if (num) {
    const y = new Date().getFullYear()
    const m = parseInt(num[1])
    const d = parseInt(num[2])
    return `${y}-${util.fix0(m, 2)}-${util.fix0(d, 2)}`
  }
  return null
}

export default exports
